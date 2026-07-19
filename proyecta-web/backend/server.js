import app from "./index.js"
import express from "express"
import http from "http"
import net from "net"
import { WebSocketServer } from "ws"
import orcidRoutes from "./orcid.js"
import moneroRoutes from "./moneroRoutes.js"
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
    totalPaid: parseAtomicXmr(data?.totalPaid ?? data?.amtPaid ?? data?.paid ?? 0),
    lastHash: parseHashCount(data?.lastHash ?? 0),
    minPayout: parseAtomicXmr(data?.minPayout ?? 0.3) || 0.3,
    validShares: parseHashCount(data?.validShares ?? data?.valid_shares ?? 0),
    invalidShares: parseHashCount(data?.invalidShares ?? data?.invalid_shares ?? 0),
    identifier: typeof data?.identifier === "string" ? data.identifier : null,
    expiry: Number(data?.expiry || 0) || null,
  }
}

async function fetchConfirmedPoolStats(wallet) {
  try {
    const response = await fetch(`https://www.supportxmr.com/api/miner/${wallet}/stats`, {
      headers: { "User-Agent": "PROYECTA/1.0", "Cache-Control": "no-cache", "Accept": "application/json" },
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
      lastHash: 0,
      minPayout: 0.3,
      validShares: 0,
      invalidShares: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function buildWalletSummary(wallet) {
  const confirmedStats = await fetchConfirmedPoolStats(wallet)
  return buildUnifiedMiningSummary(wallet, confirmedStats)
}

function buildProjectTelemetryKey(wallet, projectId) {
  const safeProjectId = String(projectId || "").trim()
  return safeProjectId ? `${wallet}::project::${safeProjectId}` : wallet
}

function buildProjectMiningSummary(wallet, projectId) {
  const telemetryKey = buildProjectTelemetryKey(wallet, projectId)
  return {
    ...buildUnifiedMiningSummary(telemetryKey, null),
    wallet,
    projectId: String(projectId || "").trim() || null,
    isPoolConfirmed: false,
    externalMiningActive: false,
    confirmedBalance: 0,
    confirmedHashrate: 0,
    confirmedTotalHashes: 0,
    confirmedTotalPaid: 0,
    confirmedValidShares: 0,
    confirmedInvalidShares: 0,
    status: "Esperando aporte local del proyecto",
  }
}

const PUBLIC_APP_URL = (process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || "https://proyecta.pages.dev").replace(/\/$/, "")
const projectConfirmedStatsCache = new Map()

async function fetchProjectConfirmedStats(projectId, wallet) {
  const cacheKey = `${projectId}::${wallet}`
  const cached = projectConfirmedStatsCache.get(cacheKey)
  if (cached?.expiresAt > Date.now()) return cached.value

  try {
    const response = await fetch(`${PUBLIC_APP_URL}/cf-api/projects/${encodeURIComponent(projectId)}/mining-stats`, {
      headers: { "User-Agent": "PROYECTA-Mining/1.0", "Cache-Control": "no-cache", "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`Project mining stats ${response.status}`)

    const stats = await response.json()
    const value = stats?.wallet === wallet ? stats : null
    if (projectConfirmedStatsCache.size >= 500 && !projectConfirmedStatsCache.has(cacheKey)) {
      projectConfirmedStatsCache.delete(projectConfirmedStatsCache.keys().next().value)
    }
    projectConfirmedStatsCache.set(cacheKey, { value, expiresAt: Date.now() + 8000 })
    return value
  } catch (error) {
    console.warn(`[MINING] No fue posible consultar la linea base de ${projectId}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

function mergeProjectConfirmedStats(localSummary, confirmedStats) {
  if (!confirmedStats) return localSummary

  const confirmedBalance = Math.max(0, Number(confirmedStats.confirmedBalance || 0))
  const confirmedHashrate = Math.max(0, Number(confirmedStats.confirmedHashrate || 0))
  const confirmedTotalHashes = Math.max(0, Math.trunc(Number(confirmedStats.confirmedTotalHashes || 0)))
  const confirmedTotalPaid = Math.max(0, Number(confirmedStats.confirmedTotalPaid || 0))
  const confirmedValidShares = Math.max(0, Math.trunc(Number(confirmedStats.confirmedValidShares || 0)))
  const confirmedInvalidShares = Math.max(0, Math.trunc(Number(confirmedStats.confirmedInvalidShares || 0)))
  const isPoolConfirmed = Boolean(confirmedStats.isPoolConfirmed)
  const status = localSummary.isLocalActive
    ? (isPoolConfirmed ? "SupportXMR confirmado + potencia comunitaria coordinada" : "Potencia comunitaria coordinada; esperando el primer share")
    : confirmedStats.status || localSummary.status

  return {
    ...localSummary,
    hashrate: confirmedHashrate,
    totalHashes: confirmedTotalHashes,
    balance: confirmedBalance,
    totalPaid: confirmedTotalPaid,
    lastHash: Number(confirmedStats.lastHash || localSummary.lastHash),
    minPayout: Number(confirmedStats.minPayout || localSummary.minPayout),
    confirmedBalance,
    confirmedHashrate,
    confirmedTotalHashes,
    confirmedTotalPaid,
    confirmedValidShares,
    confirmedInvalidShares,
    visibleBalance: confirmedBalance,
    visibleHashrate: confirmedHashrate,
    visibleTotalHashes: confirmedTotalHashes,
    isPoolConfirmed,
    externalMiningActive: isPoolConfirmed,
    poolIdentifier: typeof confirmedStats.poolIdentifier === "string" ? confirmedStats.poolIdentifier : null,
    poolExpiry: Number(confirmedStats.poolExpiry || 0) || null,
    baselineCapturedAt: Number(confirmedStats.baselineCapturedAt || 0) || null,
    status,
  }
}

const telemetryRateLimits = new Map()

function allowTelemetry(req) {
  const forwarded = typeof req.headers["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"].split(",")[0].trim() : ""
  const key = forwarded || req.headers["cf-connecting-ip"] || req.ip || "unknown"
  const current = Date.now()
  const entry = telemetryRateLimits.get(key)

  if (!entry || entry.resetAt <= current) {
    telemetryRateLimits.set(key, { count: 1, resetAt: current + 60 * 1000 })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= 120) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - current) / 1000)) }
  }

  entry.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

function createMiningCompatibilityRouter() {
  const router = express.Router()

  router.get("/health", (_req, res) => {
    res.json({ ok: true, status: "healthy", service: "mining", build: "ws-mining-coordination-2026-07-19", hasWebSocketRoute: true })
  })

  router.post("/submit", (req, res) => {
    const rateLimit = allowTelemetry(req)
    if (!rateLimit.allowed) {
      res.set("Retry-After", String(rateLimit.retryAfterSeconds))
      return res.status(429).json({ error: "Demasiadas actualizaciones de telemetría." })
    }

    const wallet = String(req.body?.walletAddress || req.body?.wallet || "").trim()
    const hashes = Number(req.body?.hashes || 0)
    const hashRate = Number(req.body?.hashRate || req.body?.localHashRate || 0)
    const elapsedSeconds = Number(req.body?.elapsedSeconds || 0)
    const acceptedShares = Number(req.body?.acceptedShares || 0)
    const rejectedShares = Number(req.body?.rejectedShares || 0)
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : null
    const poolConnected = Boolean(req.body?.poolConnected)
    const projectId = typeof req.body?.projectId === "string" ? req.body.projectId.trim() : ""
    const telemetryKey = buildProjectTelemetryKey(wallet, projectId)

    if (wallet) {
      recordMiningTelemetry(telemetryKey, {
        totalHashes: hashes,
        hashRate,
        elapsedSeconds,
        acceptedShares,
        rejectedShares,
        sessionId,
        poolConnected,
        source: req.body?.source || "browser",
        miningIntent: req.body?.miningIntent === true,
      })
    }

    res.json({
      ok: true,
      poolConnected: poolConnected || hashes > 0 || hashRate > 0,
      accepted: true,
      submittedHashes: hashes,
      summary: wallet ? buildProjectMiningSummary(wallet, projectId) : null,
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
      miners: summary.localMiners || (summary.isLocalActive ? 1 : 0),
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

  router.get("/project-stats/:projectId/:wallet", async (req, res) => {
    const wallet = req.params.wallet
    const projectId = req.params.projectId
    const localSummary = buildProjectMiningSummary(wallet, projectId)
    const confirmedStats = await fetchProjectConfirmedStats(projectId, wallet)
    const summary = mergeProjectConfirmedStats(localSummary, confirmedStats)
    const bridge = getMiningBridgeProjectSummary(wallet, projectId)
    const communityHashrate = Math.max(0, Number(summary.localBrowserHashrate || 0) + Number(summary.localNativeHashrate || 0))
    const expectedShareSeconds = bridge.poolDifficulty > 0 && communityHashrate > 0
      ? bridge.poolDifficulty / communityHashrate
      : null

    res.json({
      ...summary,
      ...bridge,
      expectedShareSeconds,
      shareProbability95Seconds: expectedShareSeconds ? expectedShareSeconds * -Math.log(0.05) : null,
    })
  })

  router.get("/pool-stats/:wallet", async (req, res) => {
    const wallet = req.params.wallet
    const summary = await buildWalletSummary(wallet)
    res.json(summary)
  })

  router.get("/payments/:wallet", async (req, res) => {
    try {
      const response = await fetch(`https://www.supportxmr.com/api/miner/${req.params.wallet}/payments`)
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
const MAX_POOL_CONNECTIONS = Number(process.env.MAX_POOL_CONNECTIONS ?? "100")
const configuredMaxSubscribers = Number(process.env.MAX_SUBSCRIBERS_PER_WALLET ?? "16")
const MAX_SUBSCRIBERS_PER_WALLET = Number.isFinite(configuredMaxSubscribers)
  ? Math.min(16, Math.max(1, Math.trunc(configuredMaxSubscribers)))
  : 16
const pools = new Map()

function parsePoolDifficulty(targetHex) {
  if (typeof targetHex !== "string" || !/^[0-9a-f]{1,8}$/i.test(targetHex)) return 0
  const normalized = targetHex.padStart(8, "0")
  const bytes = Buffer.from(normalized, "hex")
  const target = bytes.readUInt32LE(0)
  return target > 0 ? 0xffffffff / target : 0
}

function normalizeSubscriberMetadata(metadata = {}) {
  return {
    projectId: typeof metadata.projectId === "string" ? metadata.projectId.trim().slice(0, 160) : "",
    sessionId: typeof metadata.sessionId === "string" ? metadata.sessionId.trim().slice(0, 160) : "",
    workerCount: Math.max(1, Math.min(16, Math.trunc(Number(metadata.workerCount) || 1))),
  }
}

class PoolConnection {
  constructor(wallet) {
    this.wallet = wallet
    this.socket = null
    this.connected = false
    this.authed = false
    this.rpcId = 1
    this.pendingRequests = new Map()
    this.minerId = null
    this.currentJob = null
    this.currentDifficulty = 0
    this.buffer = ""
    this.subscribers = new Set()
    this.subscriberMetadata = new Map()
    this.projectCounters = new Map()
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
      }, "login")
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

  send(payload, requestType = null) {
    if (this.socket && this.connected) {
      if (requestType && payload.id != null) this.pendingRequests.set(payload.id, requestType)
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

    const requestType = msg.id != null ? this.pendingRequests.get(msg.id) : null
    if (msg.id != null) this.pendingRequests.delete(msg.id)

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
        }, "keepalive")
      }, 30000)
      return
    }

    if (msg.method === "job" && msg.params) {
      this.setJob(msg.params)
      return
    }

    if (requestType?.type === "submit" && msg.result && typeof msg.result.status === "string") {
      if (msg.result.status === "OK") {
        this.acceptedShares += 1
        const counters = this.getProjectCounters(requestType.projectId)
        counters.acceptedShares += 1
        this.broadcastProject(requestType.projectId, {
          type: "share_result",
          accepted: true,
          accepted_total: counters.acceptedShares,
          bridge_accepted_total: counters.acceptedShares,
        })
        this.broadcastCoordination(requestType.projectId)
      }
      return
    }

    if (requestType?.type === "submit" && msg.error) {
      this.rejectedShares += 1
      const counters = this.getProjectCounters(requestType.projectId)
      counters.rejectedShares += 1
      const errorMessage = msg.error.message || JSON.stringify(msg.error)
      if (!errorMessage.includes("block template") && !errorMessage.includes("duplicate")) {
        this.broadcastProject(requestType.projectId, {
          type: "share_result",
          accepted: false,
          error: errorMessage,
          rejected_total: counters.rejectedShares,
          bridge_rejected_total: counters.rejectedShares,
        })
      }
      this.broadcastCoordination(requestType.projectId)
    }
  }

  setJob(job) {
    this.currentJob = job
    this.currentDifficulty = parsePoolDifficulty(job?.target)
    this.broadcastCoordination()
    this.broadcast({ type: "job", job, connected: true, difficulty: this.currentDifficulty })
  }

  submitShare(jobId, nonce, result, ws) {
    if (!this.authed) return
    const metadata = this.subscriberMetadata.get(ws) || normalizeSubscriberMetadata()
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
    }, { type: "submit", projectId: metadata.projectId, sessionId: metadata.sessionId })
  }

  getProjectCounters(projectId) {
    const key = String(projectId || "")
    let counters = this.projectCounters.get(key)
    if (!counters) {
      counters = { acceptedShares: 0, rejectedShares: 0 }
      this.projectCounters.set(key, counters)
    }
    return counters
  }

  allocateNoncePrefix() {
    const used = new Set(Array.from(this.subscriberMetadata.values(), (metadata) => metadata.noncePrefix))
    for (let prefix = 0; prefix < 16; prefix += 1) {
      if (!used.has(prefix)) return prefix
    }
    return Math.floor(Math.random() * 16)
  }

  addSubscriber(ws, rawMetadata = {}) {
    const metadata = {
      ...normalizeSubscriberMetadata(rawMetadata),
      noncePrefix: this.allocateNoncePrefix(),
    }
    this.subscribers.add(ws)
    this.subscriberMetadata.set(ws, metadata)
    ws.send(JSON.stringify({ type: "status", connected: this.connected && this.authed }))
    this.broadcastCoordination(metadata.projectId)
    if (this.currentJob) {
      ws.send(JSON.stringify({ type: "job", job: this.currentJob, connected: true, difficulty: this.currentDifficulty }))
    }
  }

  removeSubscriber(ws) {
    const projectId = this.subscriberMetadata.get(ws)?.projectId || ""
    this.subscribers.delete(ws)
    this.subscriberMetadata.delete(ws)
    this.broadcastCoordination(projectId)
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

  broadcastProject(projectId, payload) {
    const data = JSON.stringify(payload)
    for (const ws of this.subscribers) {
      const metadata = this.subscriberMetadata.get(ws)
      if (metadata?.projectId === String(projectId || "") && ws.readyState === 1) ws.send(data)
    }
  }

  broadcastCoordination(projectId = null) {
    for (const ws of this.subscribers) {
      const metadata = this.subscriberMetadata.get(ws)
      if (!metadata || (projectId !== null && metadata.projectId !== String(projectId || ""))) continue
      const counters = this.getProjectCounters(metadata.projectId)
      const coordinatedMiners = Array.from(this.subscriberMetadata.values())
        .filter((candidate) => candidate.projectId === metadata.projectId).length
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: "coordination",
          active: true,
          noncePrefix: metadata.noncePrefix,
          workerCount: metadata.workerCount,
          coordinatedMiners,
          poolDifficulty: this.currentDifficulty,
          bridgeAcceptedShares: counters.acceptedShares,
          bridgeRejectedShares: counters.rejectedShares,
        }))
      }
    }
  }

  getProjectSummary(projectId) {
    const normalizedProjectId = String(projectId || "")
    const counters = this.getProjectCounters(normalizedProjectId)
    const bridgeMiners = Array.from(this.subscriberMetadata.values())
      .filter((metadata) => metadata.projectId === normalizedProjectId).length
    return {
      bridgeConnected: this.connected && this.authed,
      bridgeMiners,
      bridgeAcceptedShares: counters.acceptedShares,
      bridgeRejectedShares: counters.rejectedShares,
      poolDifficulty: this.currentDifficulty,
      nonceCoordinationActive: bridgeMiners > 0,
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

function getMiningBridgeProjectSummary(wallet, projectId) {
  const pool = pools.get(wallet)
  return pool
    ? pool.getProjectSummary(projectId)
    : {
        bridgeConnected: false,
        bridgeMiners: 0,
        bridgeAcceptedShares: 0,
        bridgeRejectedShares: 0,
        poolDifficulty: 0,
        nonceCoordinationActive: false,
      }
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
    if (raw.length > 4096) {
      ws.close(1009, "Mensaje demasiado grande")
      return
    }
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (msg.type === "subscribe" && msg.wallet) {
      if (pool) return
      if (!/^[48][0-9A-Za-z]{94}$/.test(msg.wallet)) {
        ws.send(JSON.stringify({ type: "error", error: "Dirección Monero inválida" }))
        return
      }

      if (!pools.has(msg.wallet) && pools.size >= MAX_POOL_CONNECTIONS) {
        ws.send(JSON.stringify({ type: "error", error: "Capacidad temporal de minería alcanzada" }))
        return
      }

      pool = getOrCreatePool(msg.wallet)
      if (pool.subscribers.size >= MAX_SUBSCRIBERS_PER_WALLET) {
        ws.send(JSON.stringify({ type: "error", error: "Demasiados mineros conectados para esta wallet" }))
        pool = null
        return
      }
      pool.addSubscriber(ws, {
        projectId: msg.projectId,
        sessionId: msg.sessionId,
        workerCount: msg.workerCount,
      })
      return
    }

    if (msg.type === "share" && pool) {
      if (typeof msg.job_id !== "string" || msg.job_id.length > 256 || !/^[0-9a-f]{8}$/i.test(msg.nonce) || !/^[0-9a-f]{64}$/i.test(msg.result)) return
      pool.submitShare(msg.job_id, msg.nonce, msg.result, ws)
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


server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
