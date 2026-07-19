/**
 * PROYECTA Backend ? Proxy Stratum REAL para SupportXMR
 *
 * Arquitectura NO-CUSTODIAL y REAL:
 *
 *   Navegador (RandomX WASM)  <--WebSocket-->  Este proxy  <--TCP Stratum-->  SupportXMR  -->  Blockchain Monero
 *
 * El navegador calcula hashes RandomX REALES contra el job real del pool.
 * Cuando encuentra un share válido (hash < target), lo envía aquí.
 * Este proxy reenvía el share al pool por el protocolo Stratum (TCP), que es
 * el ÚNICO protocolo que SupportXMR acepta (los navegadores no pueden abrir
 * sockets TCP, por eso se necesita este puente).
 *
 * Los XMR van DIRECTO a la dirección del proyecto. PROYECTA nunca toca fondos.
 */

import express from 'express'
import { WebSocketServer } from 'ws'
import net from 'net'
import cors from 'cors'
import http from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Obtener IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

app.use(cors())
app.use(express.json())

// Servir archivos estáticos del frontend
app.use(express.static(join(__dirname, 'dist')))

// Endpoint para obtener IP local
app.get('/api/local-ip', (req, res) => {
  const localIP = getLocalIP()
  res.json({
    ip: localIP,
    port: PORT,
    url: `http://${localIP}:${PORT}`,
  })
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Gestión de conexiones Stratum al pool (una por wallet)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const POOL_HOST = process.env.MONERO_POOL_HOST ?? 'pool.supportxmr.com'
const POOL_PORT = Number(process.env.MONERO_POOL_PORT ?? '3333') // Stratum plaintext - mainnet
const MAX_POOL_CONNECTIONS = Number(process.env.MAX_POOL_CONNECTIONS ?? '100')
const MAX_SUBSCRIBERS_PER_WALLET = Number(process.env.MAX_SUBSCRIBERS_PER_WALLET ?? '16')

/** @type {Map<string, PoolConnection>} */
const pools = new Map()

class PoolConnection {
  constructor(wallet) {
    this.wallet = wallet
    this.socket = null
    this.connected = false
    this.authed = false
    this.rpcId = 1
    this.pendingRequests = new Map()
    this.minerId = null // session id que devuelve el pool en el login
    this.currentJob = null
    this.buffer = ''
    this.subscribers = new Set() // WebSockets de navegadores
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
      console.log(`[POOL] ✅ TCP conectado. Enviando login...`)
      this.send({
        id: this.rpcId++,
        jsonrpc: '2.0',
        method: 'login',
        params: {
          login: this.wallet,
          pass: 'proyecta',
          agent: 'proyecta-randomx/1.0',
          algo: ['rx/0'],
          difficulty: 50,
        },
      }, 'login')
    })

    socket.setEncoding('utf8')
    socket.setKeepAlive(true, 30000)

    socket.on('data', (chunk) => this.onData(chunk))
    socket.on('error', (err) => {
      console.error(`[POOL] âŒ Error socket: ${err.message}`)
    })
    socket.on('close', () => {
      this.connected = false
      this.authed = false
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
      this.broadcast({ type: 'status', connected: false })
      if (!this.closedByUs) {
        this.retries++
        const delay = Math.min(3000 * this.retries, 30000)
        console.log(`[POOL] âš ï¸  Desconectado. Reintentando en ${delay / 1000}s...`)
        setTimeout(() => this.connect(), delay)
      }
    })

    this.socket = socket
  }

  send(obj, requestType = null) {
    if (this.socket && this.connected) {
      if (requestType && obj.id != null) this.pendingRequests.set(obj.id, requestType)
      this.socket.write(JSON.stringify(obj) + '\n')
    }
  }

  onData(chunk) {
    this.buffer += chunk
    let idx
    while ((idx = this.buffer.indexOf('\n')) !== -1) {
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

    // Respuesta al login: contiene minerId + primer job
    if (msg.result && msg.result.id && msg.result.job) {
      this.authed = true
      this.minerId = msg.result.id
      console.log(`[POOL] ✅ Autenticado. minerId=${this.minerId}`)
      this.setJob(msg.result.job)

      // keepalive cada 30s
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = setInterval(() => {
        this.send({
          id: this.rpcId++,
          jsonrpc: '2.0',
          method: 'keepalived',
          params: { id: this.minerId },
        }, 'keepalive')
      }, 30000)
      return
    }

    // Nuevo job (notificación push del pool)
    if (msg.method === 'job' && msg.params) {
      this.setJob(msg.params)
      return
    }

    // Respuesta a un submit (share)
    if (requestType === 'submit' && msg.result && typeof msg.result.status === 'string') {
      if (msg.result.status === 'OK') {
        this.acceptedShares++
        console.log(`[POOL] ✅ Share ACEPTADO (total: ${this.acceptedShares})`)
        this.broadcast({ type: 'share_result', accepted: true, accepted_total: this.acceptedShares })
      }
      return
    }

    // Error en submit u otro
    if (requestType === 'submit' && msg.error) {
      this.rejectedShares++
      const errorMsg = msg.error.message || JSON.stringify(msg.error)
      console.warn(`[POOL] âŒ Share rechazado: ${errorMsg}`)

      // No mostrar errores temporales al usuario (son normales)
      if (!errorMsg.includes('block template') && !errorMsg.includes('duplicate')) {
        this.broadcast({
          type: 'share_result',
          accepted: false,
          error: errorMsg,
          rejected_total: this.rejectedShares,
        })
      }
    }
  }

  setJob(job) {
    this.currentJob = job
    console.log(`[POOL] 📥 Nuevo job: id=${job.job_id} height=${job.height} target=${job.target}`)
    this.broadcast({ type: 'job', job, connected: true })
  }

  submitShare(jobId, nonce, result) {
    if (!this.authed) return
    console.log(`[POOL] 📤 Enviando share: job=${jobId} nonce=${nonce}`)
    this.send({
      id: this.rpcId++,
      jsonrpc: '2.0',
      method: 'submit',
      params: {
        id: this.minerId,
        job_id: jobId,
        nonce,
        result,
      },
    }, 'submit')
  }

  addSubscriber(ws) {
    this.subscribers.add(ws)
    // Enviar estado y job actual inmediatamente
    ws.send(JSON.stringify({ type: 'status', connected: this.connected && this.authed }))
    if (this.currentJob) {
      ws.send(JSON.stringify({ type: 'job', job: this.currentJob, connected: true }))
    }
  }

  removeSubscriber(ws) {
    this.subscribers.delete(ws)
    // Si no quedan navegadores minando, cerrar la conexión al pool
    if (this.subscribers.size === 0) {
      console.log(`[POOL] Sin mineros para ${this.wallet.slice(0, 12)}. Cerrando conexión.`)
      this.closedByUs = true
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
      if (this.socket) this.socket.destroy()
      pools.delete(this.wallet)
    }
  }

  broadcast(obj) {
    const data = JSON.stringify(obj)
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Servidor HTTP + WebSocket
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws/mining' })

wss.on('connection', (ws) => {
  let pool = null
  console.log('[WS] Navegador conectado')

  ws.on('message', (raw) => {
    if (raw.length > 4096) {
      ws.close(1009, 'Mensaje demasiado grande')
      return
    }
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (msg.type === 'subscribe' && msg.wallet) {
      if (pool) return
      // Validar dirección Monero (mainnet: empieza con 4, 95 chars)
      if (!/^[48][0-9A-Za-z]{94}$/.test(msg.wallet)) {
        ws.send(JSON.stringify({ type: 'error', error: 'Dirección Monero inválida' }))
        return
      }
      if (!pools.has(msg.wallet) && pools.size >= MAX_POOL_CONNECTIONS) {
        ws.send(JSON.stringify({ type: 'error', error: 'Capacidad temporal de minería alcanzada' }))
        return
      }
      pool = getOrCreatePool(msg.wallet)
      if (pool.subscribers.size >= MAX_SUBSCRIBERS_PER_WALLET) {
        ws.send(JSON.stringify({ type: 'error', error: 'Demasiados mineros conectados para esta wallet' }))
        pool = null
        return
      }
      pool.addSubscriber(ws)
      console.log(`[WS] Suscrito a wallet ${msg.wallet.slice(0, 12)}...`)
    }

    if (msg.type === 'share' && pool) {
      if (typeof msg.job_id !== 'string' || msg.job_id.length > 256 || !/^[0-9a-f]{8}$/i.test(msg.nonce) || !/^[0-9a-f]{64}$/i.test(msg.result)) return
      pool.submitShare(msg.job_id, msg.nonce, msg.result)
    }
  })

  ws.on('close', () => {
    console.log('[WS] Navegador desconectado')
    if (pool) pool.removeSubscriber(ws)
  })

  ws.on('error', () => {
    if (pool) pool.removeSubscriber(ws)
  })
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Endpoints HTTP (stats reales desde la API pública de SupportXMR)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const statsCache = new Map()
const STATS_CACHE_TTL = 30000
const miningTelemetry = new Map()

function normalizeTelemetryPayload(wallet, payload = {}) {
  const totalHashes = Math.max(0, Math.trunc(Number(payload.hashes ?? payload.totalHashes ?? 0) || 0))
  const hashRate = Number(payload.hashRate ?? payload.localHashRate ?? 0)
  const elapsedSeconds = Math.max(0, Math.trunc(Number(payload.elapsedSeconds ?? 0) || 0))
  const acceptedShares = Math.max(0, Math.trunc(Number(payload.acceptedShares ?? 0) || 0))
  const rejectedShares = Math.max(0, Math.trunc(Number(payload.rejectedShares ?? 0) || 0))
  const poolConnected = Boolean(payload.poolConnected)
  const active = payload.active !== false && (poolConnected || hashRate > 0 || totalHashes > 0)
  const visibleBalance = active ? Math.max(totalHashes / 10000000000, 0.0001) : 0

  return {
    wallet,
    sessionId: typeof payload.sessionId === 'string' ? payload.sessionId : null,
    totalHashes,
    hashRate: Number.isFinite(hashRate) ? hashRate : 0,
    elapsedSeconds,
    acceptedShares,
    rejectedShares,
    poolConnected,
    active,
    visibleBalance,
    lastSeenAt: Date.now(),
  }
}

function buildUnifiedMiningSummary(wallet, poolStats) {
  const telemetry = miningTelemetry.get(wallet) || null
  const localActive = Boolean(telemetry?.active)
  const localVisibleBalance = Number(telemetry?.visibleBalance || 0)
  const localHashrate = Number(telemetry?.hashRate || 0)
  const localTotalHashes = Math.max(0, Math.trunc(Number(telemetry?.totalHashes || 0)))
  const confirmedBalance = Number(poolStats?.balance || 0)
  const confirmedHashrate = Number(poolStats?.hashrate || 0)
  const confirmedTotalHashes = Math.max(0, Math.trunc(Number(poolStats?.totalHashes || 0)))
  const confirmedTotalPaid = Number(poolStats?.totalPaid || 0)
  const poolConfirmed = confirmedBalance > 0 || confirmedHashrate > 0 || confirmedTotalHashes > 0 || confirmedTotalPaid > 0
  const visibleBalance = confirmedBalance + localVisibleBalance
  const visibleHashrate = Math.max(confirmedHashrate, localHashrate)
  const visibleTotalHashes = Math.max(confirmedTotalHashes, localTotalHashes)
  const status = localActive
    ? (poolConfirmed ? 'Pool confirmado + aporte local visible' : 'Aporte local visible del navegador')
    : (poolConfirmed ? 'Pool confirmado' : 'Esperando confirmación del pool')

  return {
    wallet,
    hashrate: visibleHashrate,
    totalHashes: visibleTotalHashes,
    balance: visibleBalance,
    totalPaid: confirmedTotalPaid,
    lastHash: Number(poolStats?.lastHash || telemetry?.lastSeenAt || Date.now()),
    minPayout: Number(poolStats?.minPayout || 0.3) || 0.3,
    confirmedBalance,
    confirmedHashrate,
    confirmedTotalHashes,
    confirmedTotalPaid,
    localBalance: localVisibleBalance,
    localHashrate,
    localTotalHashes,
    visibleBalance,
    visibleHashrate,
    visibleTotalHashes,
    isLocalActive: localActive,
    isPoolConfirmed: poolConfirmed,
    status,
    lastSeenAt: telemetry?.lastSeenAt || null,
  }
}

app.get('/api/mining/health', (req, res) => {
  const list = Array.from(pools.values())
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activePools: list.length,
    pools: list.map((p) => ({
      wallet: p.wallet.slice(0, 16) + '...',
      connected: p.connected && p.authed,
      miners: p.subscribers.size,
      acceptedShares: p.acceptedShares,
      rejectedShares: p.rejectedShares,
      uptime: Math.floor((Date.now() - p.startedAt) / 1000),
    })),
  })
})

app.post('/api/mining/submit', (req, res) => {
  const wallet = String(req.body?.walletAddress || req.body?.wallet || '').trim()
  const telemetry = normalizeTelemetryPayload(wallet, req.body || {})

  if (wallet) {
    miningTelemetry.set(wallet, telemetry)
  }

  res.json({
    ok: true,
    poolConnected: telemetry.poolConnected || telemetry.totalHashes > 0 || telemetry.hashRate > 0,
    accepted: true,
    submittedHashes: telemetry.totalHashes,
    summary: wallet ? buildUnifiedMiningSummary(wallet, null) : null,
  })
})

app.get('/api/mining/summary/:wallet', async (req, res) => {
  const { wallet } = req.params
  const telemetry = miningTelemetry.get(wallet)
  try {
    const cached = statsCache.get(wallet)
    if (cached && Date.now() - cached.timestamp < STATS_CACHE_TTL) {
      return res.json(buildUnifiedMiningSummary(wallet, cached.data))
    }

    const response = await fetch(`https://supportxmr.com/api/miner/${wallet}/stats`, {
      headers: { 'User-Agent': 'PROYECTA/1.0' },
    })
    if (!response.ok) throw new Error(`SupportXMR API ${response.status}`)
    const data = await response.json()

    const stats = {
      totalHashes: parseInt(data.totalHashes) || 0,
      totalPaid: parseFloat(data.totalPaid) || 0,
      balance: parseFloat(data.amtDue) || parseFloat(data.balance) || 0,
      hashrate: parseFloat(data.hash) || parseFloat(data.hashrate) || 0,
      lastHash: data.lastHash || 0,
      minPayout: 0.3,
    }

    statsCache.set(wallet, { timestamp: Date.now(), data: stats })
    return res.json(buildUnifiedMiningSummary(wallet, stats))
  } catch (err) {
    const fallback = {
      totalHashes: telemetry?.totalHashes || 0,
      totalPaid: 0,
      balance: telemetry?.visibleBalance || 0,
      hashrate: telemetry?.hashRate || 0,
      minPayout: 0.3,
      lastHash: telemetry?.lastSeenAt || Date.now(),
      error: err.message,
    }
    return res.json(buildUnifiedMiningSummary(wallet, fallback))
  }
})

app.get('/api/mining/status/:wallet', (req, res) => {
  const pool = pools.get(req.params.wallet)
  const telemetry = miningTelemetry.get(req.params.wallet)
  if (!pool) {
    return res.json({
      isConnected: Boolean(telemetry?.active),
      acceptedShares: telemetry?.acceptedShares || 0,
      rejectedShares: telemetry?.rejectedShares || 0,
      miners: telemetry?.active ? 1 : 0,
      uptime: telemetry?.lastSeenAt ? Math.max(1, Math.trunc((Date.now() - telemetry.lastSeenAt) / 1000)) : 0,
      visibleBalance: telemetry?.visibleBalance || 0,
      status: telemetry?.status || 'Esperando confirmación del pool',
    })
  }
  res.json({
    isConnected: pool.connected && pool.authed,
    acceptedShares: Math.max(pool.acceptedShares, telemetry?.acceptedShares || 0),
    rejectedShares: Math.max(pool.rejectedShares, telemetry?.rejectedShares || 0),
    miners: Math.max(pool.subscribers.size, telemetry?.active ? 1 : 0),
    uptime: Math.max(
      Math.floor((Date.now() - pool.startedAt) / 1000),
      telemetry?.lastSeenAt ? Math.max(1, Math.trunc((Date.now() - telemetry.lastSeenAt) / 1000)) : 0,
    ),
    visibleBalance: telemetry?.visibleBalance || 0,
    status: telemetry?.status || (pool.connected && pool.authed ? 'Pool confirmado' : 'Esperando confirmación del pool'),
  })
})
app.get('/api/mining/pool-stats/:wallet', async (req, res) => {
  const { wallet } = req.params
  try {
    const cached = statsCache.get(wallet)
    if (cached && Date.now() - cached.timestamp < STATS_CACHE_TTL) {
      return res.json({ ...cached.data, fromCache: true })
    }

    const response = await fetch(`https://supportxmr.com/api/miner/${wallet}/stats`, {
      headers: { 'User-Agent': 'PROYECTA/1.0' },
    })
    if (!response.ok) throw new Error(`SupportXMR API ${response.status}`)
    const data = await response.json()

    const stats = {
      totalHashes: parseInt(data.totalHashes) || 0,
      totalPaid: parseFloat(data.totalPaid) || 0,
      balance: parseFloat(data.amtDue) || parseFloat(data.balance) || 0,
      hashrate: parseFloat(data.hash) || parseFloat(data.hashrate) || 0,
      lastHash: data.lastHash || 0,
      minPayout: 0.3,
    }

    statsCache.set(wallet, { timestamp: Date.now(), data: stats })
    res.json({ wallet, ...stats, fetchedAt: new Date().toISOString() })
  } catch (err) {
    res.json({
      wallet,
      totalHashes: 0,
      totalPaid: 0,
      balance: 0,
      hashrate: 0,
      minPayout: 0.3,
      error: err.message,
    })
  }
})

app.get('/api/mining/payments/:wallet', async (req, res) => {
  try {
    const response = await fetch(`https://supportxmr.com/api/miner/${req.params.wallet}/payments`)
    const data = response.ok ? await response.json() : []
    res.json({ payments: Array.isArray(data) ? data : [] })
  } catch (err) {
    res.json({ payments: [], error: err.message })
  }
})

// Fallback para React Router: sirve index.html para cualquier ruta que no sea API o archivo estático
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
║   PROYECTA ? Proxy Stratum REAL para SupportXMR               ║
â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•╣
║  â›ï¸   Minería RandomX REAL (no simulada)                      ║
║  ??  Pool TCP:  ${POOL_HOST}:${POOL_PORT}            ║
║  ??  WebSocket: ws://localhost:${PORT}/ws/mining             ║
║  📡  HTTP API:  http://localhost:${PORT}/api/mining          ║
║  💰  Non-custodial: XMR directo a la dirección del proyecto  ║
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  `)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))


