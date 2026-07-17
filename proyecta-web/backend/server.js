import app from "./index.js"
import express from "express"
import http from "http"
import net from "net"
import { WebSocketServer } from "ws"
import orcidRoutes from "./orcid.js"
import moneroRoutes from "./moneroRoutes.js"
import { initializeMoneroConnection } from "./monero.js"
import { readStore as readMiningStore, recordMiningTelemetry, buildUnifiedMiningSummary } from "./moneroStore.js"

function parseDecimalLike(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value !== "string") {
    return 0
  }

  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseAtomicXmr(value) {
  const raw = parseDecimalLike(value)
  if (raw === 0) return 0

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (/[.,]/.test(trimmed)) {
      return raw
    }
  }

  if (Math.abs(raw) >= 1e6) {
    return raw / 1e12
  }

  return raw
}

function parseHashCount(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
  }

  if (typeof value !== "string") {
    return 0
  }

  const digits = value.replace(/[^0-9-]/g, "")
  if (!digits) return 0
  const parsed = Number(digits)
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0
}

function normalizeSupportXMRStats(data) {
  return {
    hashrate: parseDecimalLike(data?.hashrate ?? data?.hash ?? 0),
    totalHashes: parseHashCount(data?.totalHashes ?? data?.total_hashes ?? data?.hashes ?? 0),
    balance: parseAtomicXmr(data?.balance ?? data?.amtDue ?? data?.due ?? 0),
    totalPaid: parseAtomicXmr(data?.totalPaid ?? data?.paid ?? 0),
    lastHash: parseHashCount(data?.lastHash ?? Date.now()),
    minPayout: parseAtomicXmr(data?.minPayout ?? 0.3) || 0.3,
  }
}

async function fetchConfirmedPoolStats(wallet) {
  try {
    const response = await fetch(`https://supportxmr.com/api/miner/${wallet}/stats`, {
      headers: { "User-Agent": "PROYECTA/1.0" },
    })

    if (!response.ok) {
      throw new Error(`SupportXMR API ${response.status}`)
    }

    const data = await response.json()
    return normalizeSupportXMRStats(data)
  } catch (error) {
    return {
      wallet,
      hashrate: 0,
      totalHashes: 0,
      balance: 0,
      totalPaid: 0,
      lastHash: Date.now(),
      minPayout: 0.3,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function buildWalletSummary(wallet) {
  const confirmedStats = await fetchConfirmedPoolStats(wallet)
  return buildUnifiedMiningSummary(wallet, confirmedStats)
}

function createMiningCompatibilityRouter() {
  const router = express.Router()

  router.get("/health", (_req, res) => {
    res.json({ ok: true, status: "healthy", service: "mining", build: "ws-mining-2026-07-17", hasWebSocketRoute: true })
  })

  router.post("/submit", (req, res) => {
    const wallet = String(req.body?.walletAddress || req.body?.wallet || "").trim()
    const hashes = Number(req.body?.hashes || 0)
    const hashRate = Number(req.body?.hashRate || req.body?.localHashRate || 0)
    const elapsedSeconds = Number(req.body?.elapsedSeconds || 0)
    const acceptedShares = Number(req.body?.acceptedShares || 0)
    const rejectedShares = Number(req.body?.rejectedShares || 0)
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : null
    const poolConnected = Boolean(req.body?.poolConnected)

    if (wallet) {
      recordMiningTelemetry(wallet, {
        totalHashes: hashes,
        hashRate,
        elapsedSeconds,
        acceptedShares,
        rejectedShares,
        sessionId,
        poolConnected,
        source: req.body?.source || "browser",
      })
    }

    res.json({
      ok: true,
      poolConnected: poolConnected || hashes > 0 || hashRate > 0,
      accepted: true,
      submittedHashes: hashes,
      summary: wallet ? buildUnifiedMiningSummary(wallet, null) : null,
    })
  })

  router.get("/status/:wallet", async (req, res) => {
    const wallet = req.params.wallet
    const summary = await buildWalletSummary(wallet)
    const lastSeenAt = summary.lastSeenAt ? new Date(summary.lastSeenAt).getTime() : Date.now()
    res.json({
      isConnected: summary.isPoolConfirmed || summary.isLocalActive,
      wallet,
      acceptedShares: summary.confirmedTotalHashes > 0 ? summary.confirmedTotalHashes : 0,
      rejectedShares: 0,
      miners: summary.isLocalActive ? 1 : 0,
      uptime: summary.isLocalActive ? Math.max(1, Math.trunc((Date.now() - lastSeenAt) / 1000)) : 0,
      visibleBalance: summary.visibleBalance,
      status: summary.status,
    })
  })

  router.get("/summary/:wallet", async (req, res) => {
    const wallet = req.params.wallet
    const summary = await buildWalletSummary(wallet)
    res.json(summary)
  })

  router.get("/pool-stats/:wallet", async (req, res) => {
    const wallet = req.params.wallet
    const summary = await buildWalletSummary(wallet)
    res.json(summary)
  })

  router.get("/payments/:wallet", async (req, res) => {
    try {
      const response = await fetch(`https://supportxmr.com/api/miner/${req.params.wallet}/payments`)
      const data = response.ok ? await response.json() : []
      res.json({ payments: Array.isArray(data) ? data : [] })
    } catch (error) {
      res.json({ payments: [], error: error instanceof Error ? error.message : String(error) })
    }
  })

  router.get("/addresses", (_req, res) => {
    const store = readMiningStore()
    res.json(Object.values(store.addresses || {}))
  })

  return router
}

const POOL_HOST = process.env.MONERO_POOL_HOST ?? "pool.supportxmr.com"
const POOL_PORT = Number(process.env.MONERO_POOL_PORT ?? "3333")
const pools = new Map()

class PoolConnection {
  constructor(wallet) {
    this.wallet = wallet
    this.socket = null
    this.connected = false
    this.authed = false
    this.rpcId = 1
    this.minerId = null
    this.currentJob = null
    this.buffer = ""
    this.subscribers = new Set()
    this.acceptedShares = 0
    this.rejectedShares = 0
    this.startedAt = Date.now()
    this.retries = 0
    this.keepAliveTimer = null
    this.closedByUs = false
  }

  connect() {
    this.closedByUs = false
    console.log(`[POOL] Conectando a ${POOL_HOST}:${POOL_PORT} para ${this.wallet.slice(0, 12)}...`)

    const socket = net.connect({ host: POOL_HOST, port: POOL_PORT }, () => {
      this.connected = true
      this.retries = 0
      this.send({
        id: this.rpcId++,
        jsonrpc: "2.0",
        method: "login",
        params: {
          login: this.wallet,
          pass: "proyecta",
          agent: "proyecta-randomx/1.0",
          algo: ["rx/0"],
          difficulty: 50,
        },
      })
    })

    socket.setEncoding("utf8")
    socket.setKeepAlive(true, 30000)
    socket.on("data", (chunk) => this.onData(chunk))
    socket.on("error", (error) => {
      console.error(`[POOL] Error socket: ${error.message}`)
    })
    socket.on("close", () => {
      this.connected = false
      this.authed = false
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
      this.broadcast({ type: "status", connected: false })
      if (!this.closedByUs) {
        this.retries += 1
        const delay = Math.min(3000 * this.retries, 30000)
        setTimeout(() => this.connect(), delay)
      }
    })

    this.socket = socket
  }

  send(payload) {
    if (this.socket && this.connected) {
      this.socket.write(`${JSON.stringify(payload)}\n`)
    }
  }

  onData(chunk) {
    this.buffer += chunk
    let idx
    while ((idx = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, idx).trim()
      this.buffer = this.buffer.slice(idx + 1)
      if (line) this.handleMessage(line)
    }
  }

  handleMessage(line) {
    let msg
    try {
      msg = JSON.parse(line)
    } catch {
      return
    }

    if (msg.result && msg.result.id && msg.result.job) {
      this.authed = true
      this.minerId = msg.result.id
      this.setJob(msg.result.job)
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = setInterval(() => {
        this.send({
          id: this.rpcId++,
          jsonrpc: "2.0",
          method: "keepalived",
          params: { id: this.minerId },
        })
      }, 30000)
      return
    }

    if (msg.method === "job" && msg.params) {
      this.setJob(msg.params)
      return
    }

    if (msg.result && typeof msg.result.status === "string") {
      if (msg.result.status === "OK") {
        this.acceptedShares += 1
        this.broadcast({
          type: "share_result",
          accepted: true,
          accepted_total: this.acceptedShares,
        })
      }
      return
    }

    if (msg.error) {
      this.rejectedShares += 1
      const errorMessage = msg.error.message || JSON.stringify(msg.error)
      if (!errorMessage.includes("block template") && !errorMessage.includes("duplicate")) {
        this.broadcast({
          type: "share_result",
          accepted: false,
          error: errorMessage,
          rejected_total: this.rejectedShares,
        })
      }
    }
  }

  setJob(job) {
    this.currentJob = job
    this.broadcast({ type: "job", job, connected: true })
  }

  submitShare(jobId, nonce, result) {
    if (!this.authed) return
    this.send({
      id: this.rpcId++,
      jsonrpc: "2.0",
      method: "submit",
      params: {
        id: this.minerId,
        job_id: jobId,
        nonce,
        result,
      },
    })
  }

  addSubscriber(ws) {
    this.subscribers.add(ws)
    ws.send(JSON.stringify({ type: "status", connected: this.connected && this.authed }))
    if (this.currentJob) {
      ws.send(JSON.stringify({ type: "job", job: this.currentJob, connected: true }))
    }
  }

  removeSubscriber(ws) {
    this.subscribers.delete(ws)
    if (this.subscribers.size === 0) {
      this.closedByUs = true
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
      if (this.socket) this.socket.destroy()
      pools.delete(this.wallet)
    }
  }

  broadcast(payload) {
    const data = JSON.stringify(payload)
    for (const ws of this.subscribers) {
      if (ws.readyState === 1) ws.send(data)
    }
  }
}

function getOrCreatePool(wallet) {
  let pool = pools.get(wallet)
  if (!pool) {
    pool = new PoolConnection(wallet)
    pools.set(wallet, pool)
    pool.connect()
  }
  return pool
}

const PORT = Number(process.env.PORT || 3000)

app.use("/api/orcid", orcidRoutes)
app.use("/api/monero", moneroRoutes)
app.use("/api/mining", createMiningCompatibilityRouter())

app.get("/ws/mining", (_req, res) => {
  res.status(426).json({
    ok: false,
    error: "Este endpoint requiere WebSocket.",
    expected: "wss://<host>/ws/mining",
  })
})

const server = http.createServer(app)
const wss = new WebSocketServer({ noServer: true })

server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url || "/", "http://localhost")

  if (pathname !== "/ws/mining") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
    socket.destroy()
    return
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request)
  })
})

wss.on("connection", (ws) => {
  let pool = null

  ws.on("message", (raw) => {
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (msg.type === "subscribe" && msg.wallet) {
      if (!/^[48][0-9A-Za-z]{94}$/.test(msg.wallet)) {
        ws.send(JSON.stringify({ type: "error", error: "Dirección Monero inválida" }))
        return
      }

      pool = getOrCreatePool(msg.wallet)
      pool.addSubscriber(ws)
      return
    }

    if (msg.type === "share" && pool) {
      pool.submitShare(msg.job_id, msg.nonce, msg.result)
    }
  })

  ws.on("close", () => {
    if (pool) pool.removeSubscriber(ws)
  })

  ws.on("error", () => {
    if (pool) pool.removeSubscriber(ws)
  })
})

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

void initializeMoneroConnection()
  .then(() => console.log("[Server] Monero RPC initialized"))
  .catch((error) => console.warn("[Server] Monero RPC not available:", error))

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
