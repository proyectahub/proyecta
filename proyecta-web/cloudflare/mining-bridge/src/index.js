import { connect } from 'cloudflare:sockets'

const POOL_HOST = 'pool.supportxmr.com'
const POOL_PORT = 3333
const MAX_CLIENTS = 16
const WALLET_PATTERN = /^[48][0-9A-Za-z]{94}$/

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': 'https://proyecta.pages.dev',
      'Cache-Control': 'no-store',
    },
  })
}

function parseDifficulty(targetHex) {
  if (typeof targetHex !== 'string' || !/^[0-9a-f]{1,8}$/i.test(targetHex)) return 0
  const normalized = targetHex.padStart(8, '0')
  const value = Number.parseInt(`${normalized.slice(6)}${normalized.slice(4, 6)}${normalized.slice(2, 4)}${normalized.slice(0, 2)}`, 16)
  return value > 0 ? 0xffffffff / value : 0
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://proyecta.pages.dev',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    if (url.pathname === '/api/mining/health') {
      return json({ ok: true, status: 'healthy', service: 'cloudflare-mining-bridge', hasWebSocketRoute: true })
    }

    if (url.pathname === '/api/mining/submit' && request.method === 'POST') {
      return json({ ok: true, accepted: true })
    }

    if (url.pathname !== '/ws/mining') return json({ error: 'Not found' }, 404)
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return json({ error: 'WebSocket required' }, 426)

    const wallet = url.searchParams.get('wallet')?.trim() || ''
    if (!WALLET_PATTERN.test(wallet)) return json({ error: 'Invalid Monero wallet' }, 400)

    const id = env.MINING_BRIDGE.idFromName(wallet)
    return env.MINING_BRIDGE.get(id).fetch(request)
  },
}

export class MiningBridge {
  constructor(state) {
    this.state = state
    this.wallet = null
    this.clients = new Map()
    this.socket = null
    this.writer = null
    this.connected = false
    this.authorized = false
    this.minerId = null
    this.currentJob = null
    this.difficulty = 0
    this.buffer = ''
    this.rpcId = 1
    this.pending = new Map()
    this.projectCounters = new Map()
    this.reconnectTimer = null
  }

  async fetch(request) {
    const url = new URL(request.url)
    this.wallet = url.searchParams.get('wallet')?.trim() || this.wallet

    if (!this.wallet || !WALLET_PATTERN.test(this.wallet)) return json({ error: 'Invalid Monero wallet' }, 400)
    if (this.clients.size >= MAX_CLIENTS) return json({ error: 'Bridge capacity reached' }, 429)

    const pair = new WebSocketPair()
    const client = pair[0]
    const server = pair[1]
    server.accept()
    const metadata = {
      projectId: url.searchParams.get('projectId')?.trim().slice(0, 160) || '',
      sessionId: url.searchParams.get('sessionId')?.trim().slice(0, 160) || '',
      noncePrefix: this.allocateNoncePrefix(),
      workerCount: 1,
    }
    this.clients.set(server, metadata)

    server.addEventListener('message', (event) => this.onClientMessage(server, event.data))
    server.addEventListener('close', () => this.removeClient(server))
    server.addEventListener('error', () => this.removeClient(server))
    this.sendClient(server, { type: 'status', connected: this.connected && this.authorized })
    this.broadcastCoordination(metadata.projectId)
    if (this.currentJob) this.sendClient(server, { type: 'job', job: this.currentJob, connected: true, difficulty: this.difficulty })
    this.ensurePoolConnection()

    return new Response(null, { status: 101, webSocket: client })
  }

  onClientMessage(ws, raw) {
    let message
    try {
      message = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw))
    } catch {
      return
    }

    const metadata = this.clients.get(ws)
    if (!metadata) return

    if (message.type === 'subscribe') {
      metadata.workerCount = Math.max(1, Math.min(16, Math.trunc(Number(message.workerCount) || 1)))
      this.broadcastCoordination(metadata.projectId)
      this.ensurePoolConnection()
      return
    }

    if (message.type === 'share') this.submitShare(ws, message)
  }

  async ensurePoolConnection() {
    if (this.socket || !this.wallet || this.clients.size === 0) return
    try {
      this.socket = connect({ hostname: POOL_HOST, port: POOL_PORT })
      this.writer = this.socket.writable.getWriter()
      this.connected = true
      this.authorized = false
      this.sendPool({
        id: this.rpcId++, jsonrpc: '2.0', method: 'login',
        params: { login: this.wallet, pass: 'proyecta', agent: 'proyecta-cloudflare/1.0', algo: ['rx/0'], difficulty: 50 },
      }, { type: 'login' })
      this.state.waitUntil(this.readPool())
      this.state.waitUntil(this.socket.closed.then(() => this.onPoolClosed()).catch(() => this.onPoolClosed()))
    } catch (error) {
      this.onPoolClosed(error)
    }
  }

  async readPool() {
    const reader = this.socket?.readable.getReader()
    if (!reader) return
    const decoder = new TextDecoder()
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        this.onPoolData(decoder.decode(value, { stream: true }))
      }
    } finally {
      reader.releaseLock()
    }
  }

  onPoolData(chunk) {
    this.buffer += chunk
    let newline
    while ((newline = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newline).trim()
      this.buffer = this.buffer.slice(newline + 1)
      if (!line) continue
      try { this.handlePoolMessage(JSON.parse(line)) } catch { /* Ignore malformed pool data. */ }
    }
  }

  handlePoolMessage(message) {
    const request = message.id != null ? this.pending.get(message.id) : null
    if (message.id != null) this.pending.delete(message.id)

    if (message.result?.id && message.result?.job) {
      this.authorized = true
      this.minerId = message.result.id
      this.setJob(message.result.job)
      return
    }
    if (message.method === 'job' && message.params) {
      this.setJob(message.params)
      return
    }
    if (request?.type === 'submit') {
      const counters = this.getCounters(request.projectId)
      if (message.result?.status === 'OK') {
        counters.accepted += 1
        this.broadcastProject(request.projectId, { type: 'share_result', accepted: true, accepted_total: counters.accepted })
      } else {
        counters.rejected += 1
        const error = message.error?.message || 'Share rejected by pool'
        this.broadcastProject(request.projectId, { type: 'share_result', accepted: false, rejected_total: counters.rejected, error })
      }
      this.broadcastCoordination(request.projectId)
    }
  }

  setJob(job) {
    this.currentJob = job
    this.difficulty = parseDifficulty(job?.target)
    this.broadcast({ type: 'job', job, connected: true, difficulty: this.difficulty })
    this.broadcastCoordination()
  }

  submitShare(ws, message) {
    if (!this.authorized || !/^[0-9a-f]{8}$/i.test(message.nonce || '') || !/^[0-9a-f]{64}$/i.test(message.result || '')) return
    const metadata = this.clients.get(ws)
    if (!metadata) return
    this.sendPool({
      id: this.rpcId++, jsonrpc: '2.0', method: 'submit',
      params: { id: this.minerId, job_id: message.job_id, nonce: message.nonce, result: message.result },
    }, { type: 'submit', projectId: metadata.projectId })
  }

  async sendPool(payload, request) {
    if (!this.writer) return
    if (request && payload.id != null) this.pending.set(payload.id, request)
    try {
      await this.writer.write(new TextEncoder().encode(`${JSON.stringify(payload)}\n`))
    } catch {
      this.onPoolClosed()
    }
  }

  onPoolClosed() {
    this.connected = false
    this.authorized = false
    this.socket = null
    this.writer = null
    this.broadcast({ type: 'status', connected: false })
    if (this.clients.size && !this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null
        this.ensurePoolConnection()
      }, 3000)
    }
  }

  removeClient(ws) {
    const projectId = this.clients.get(ws)?.projectId || ''
    this.clients.delete(ws)
    this.broadcastCoordination(projectId)
    if (!this.clients.size && this.socket) {
      this.socket.close()
      this.socket = null
      this.writer = null
    }
  }

  allocateNoncePrefix() {
    const used = new Set([...this.clients.values()].map((metadata) => metadata.noncePrefix))
    for (let prefix = 0; prefix < 16; prefix += 1) if (!used.has(prefix)) return prefix
    return Math.floor(Math.random() * 16)
  }

  getCounters(projectId) {
    const key = projectId || ''
    if (!this.projectCounters.has(key)) this.projectCounters.set(key, { accepted: 0, rejected: 0 })
    return this.projectCounters.get(key)
  }

  broadcastCoordination(projectId = null) {
    for (const [ws, metadata] of this.clients) {
      if (projectId !== null && metadata.projectId !== projectId) continue
      const counters = this.getCounters(metadata.projectId)
      const coordinatedMiners = [...this.clients.values()].filter((client) => client.projectId === metadata.projectId).length
      this.sendClient(ws, {
        type: 'coordination', active: true, noncePrefix: metadata.noncePrefix, workerCount: metadata.workerCount,
        coordinatedMiners, poolDifficulty: this.difficulty,
        bridgeAcceptedShares: counters.accepted, bridgeRejectedShares: counters.rejected,
      })
    }
  }

  broadcastProject(projectId, payload) {
    for (const [ws, metadata] of this.clients) if (metadata.projectId === projectId) this.sendClient(ws, payload)
  }

  broadcast(payload) {
    for (const ws of this.clients.keys()) this.sendClient(ws, payload)
  }

  sendClient(ws, payload) {
    try { ws.send(JSON.stringify(payload)) } catch { this.removeClient(ws) }
  }
}
