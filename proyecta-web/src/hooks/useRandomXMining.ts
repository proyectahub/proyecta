import { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, resolveMiningWebSocketUrl } from '../lib/api'

export interface RandomXStats {
  hashRate: number
  totalHashes: number
  poolConnected: boolean
  acceptedShares: number
  rejectedShares: number
  elapsedSeconds: number
  jobHeight: number | null
  status: string
  poolDifficulty: number
  coordinatedMiners: number
  coordinationActive: boolean
}

const WS_URL = resolveMiningWebSocketUrl()
const TELEMETRY_INTERVAL_MS = 10000

export function useRandomXMining(
  walletAddress: string,
  enabled: boolean,
  cpuPercentage: number = 50,
  workerName?: string,
  projectId?: string,
  sessionId?: string,
) {
  const [stats, setStats] = useState<RandomXStats>({
    hashRate: 0,
    totalHashes: 0,
    poolConnected: false,
    acceptedShares: 0,
    rejectedShares: 0,
    elapsedSeconds: 0,
    jobHeight: null,
    status: 'Inactivo',
    poolDifficulty: 0,
    coordinatedMiners: 0,
    coordinationActive: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [connectionAttempt, setConnectionAttempt] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)
  const workersRef = useRef<Worker[]>([])
  const startTimeRef = useRef<number>(0)
  const perWorkerRef = useRef<{ rate: number; hashes: number }[]>([])
  const hasPoolJobRef = useRef(false)
  const isClosingRef = useRef(false)
  const fallbackSessionIdRef = useRef(Math.random().toString(36).slice(2))
  const engineSessionIdRef = useRef<string | null>(null)
  const lastTelemetryAtRef = useRef(0)
  const workersStartedRef = useRef(false)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noncePrefixRef = useRef(Math.floor(Math.random() * 16))
  const acceptedSharesRef = useRef(0)
  const rejectedSharesRef = useRef(0)
  const miningSessionId = sessionId?.trim() || fallbackSessionIdRef.current

  const sendTelemetry = useCallback(
    (payload: {
      totalHashes: number
      hashRate: number
      elapsedSeconds: number
      acceptedShares: number
      rejectedShares: number
      poolConnected: boolean
    }) => {
      const now = Date.now()
      if (now - lastTelemetryAtRef.current < TELEMETRY_INTERVAL_MS) {
        return
      }

      lastTelemetryAtRef.current = now
      void fetch(`${API_BASE}/api/mining/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          projectId,
          sessionId: miningSessionId,
          source: 'browser',
          ...payload,
        }),
      }).catch(() => undefined)
    },
    [walletAddress, projectId, miningSessionId, workerName],
  )

  useEffect(() => {
    if (!enabled || !walletAddress) {
      return
    }

    const cores = navigator.hardwareConcurrency || 4
    const threads = Math.max(1, Math.min(6, Math.round(cores * (cpuPercentage / 100))))

    const isNewMiningSession = engineSessionIdRef.current !== miningSessionId
    engineSessionIdRef.current = miningSessionId
    setError(null)
    isClosingRef.current = false
    setStats((current) => isNewMiningSession
      ? {
          hashRate: 0,
          totalHashes: 0,
          poolConnected: false,
          acceptedShares: 0,
          rejectedShares: 0,
          elapsedSeconds: 0,
          jobHeight: null,
          status: 'Conectando al puente de minería...',
          poolDifficulty: 0,
          coordinatedMiners: 0,
          coordinationActive: false,
        }
      : {
          ...current,
          status: 'Conectando al puente de minería...',
          poolConnected: false,
        })
    startTimeRef.current = Date.now()
    perWorkerRef.current = Array.from({ length: threads }, () => ({ rate: 0, hashes: 0 }))
    hasPoolJobRef.current = false
    workersStartedRef.current = false
    noncePrefixRef.current = Math.floor(Math.random() * 16)
    if (isNewMiningSession) {
      acceptedSharesRef.current = 0
      rejectedSharesRef.current = 0
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    const workers: Worker[] = []
    for (let index = 0; index < threads; index += 1) {
      const worker = new Worker(new URL('../workers/randomx.worker.ts', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (event: MessageEvent) => {
        const message = event.data
        if (message.type === 'hashrate') {
          perWorkerRef.current[index] = { rate: message.hashRate, hashes: message.totalHashes }
          const totalRate = perWorkerRef.current.reduce((sum, workerStats) => sum + workerStats.rate, 0)
          const totalHashes = perWorkerRef.current.reduce((sum, workerStats) => sum + workerStats.hashes, 0)
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setStats((current) => ({
            ...current,
            hashRate: Math.round(totalRate * 10) / 10,
            totalHashes,
            elapsedSeconds,
            status: 'Minando RandomX',
          }))
          sendTelemetry({
            totalHashes,
            hashRate: Math.round(totalRate * 10) / 10,
            elapsedSeconds,
            acceptedShares: acceptedSharesRef.current,
            rejectedShares: rejectedSharesRef.current,
            poolConnected: Boolean(wsRef.current && wsRef.current.readyState === WebSocket.OPEN),
          })
        }

        if (message.type === 'share' && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'share',
              job_id: message.job_id,
              nonce: message.nonce,
              result: message.result,
            }),
          )
        }

        if (message.type === 'log') {
          setStats((current) => ({ ...current, status: message.message }))
        }

        if (message.type === 'error') {
          setError(message.error)
        }
      }
      workers.push(worker)
    }

    workersRef.current = workers

    const startWorkers = () => {
      if (workersStartedRef.current) return
      workersStartedRef.current = true
      for (const worker of workersRef.current) {
        worker.postMessage({ type: 'start' })
      }
    }

    const pauseWorkers = () => {
      hasPoolJobRef.current = false
      workersStartedRef.current = false
      for (const worker of workersRef.current) worker.postMessage({ type: 'stop' })
      perWorkerRef.current = perWorkerRef.current.map((workerStats) => ({ ...workerStats, rate: 0 }))
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        wallet: walletAddress,
        projectId,
        sessionId: miningSessionId,
        workerCount: threads,
      }))
      setStats((current) => ({
        ...current,
        status: 'Puente conectado, esperando job del pool...',
        poolConnected: true,
      }))
    }

    ws.onmessage = (event) => {
      let message: any
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }

      if (message.type === 'job') {
        hasPoolJobRef.current = true
        for (let index = 0; index < workersRef.current.length; index += 1) {
          const lanePrefix = ((noncePrefixRef.current & 0x0f) << 4) | (index & 0x0f)
          const randomOffset = crypto.getRandomValues(new Uint32Array(1))[0] & 0x00ffffff
          const nonceStart = ((lanePrefix << 24) | randomOffset) >>> 0
          workersRef.current[index].postMessage({ type: 'job', job: message.job, nonceStart })
        }
        startWorkers()
        setStats((current) => ({
          ...current,
          poolConnected: true,
          jobHeight: message.job?.height ?? current.jobHeight,
          poolDifficulty: Number(message.difficulty || current.poolDifficulty || 0),
          status: 'Minando RandomX',
        }))
      }

      if (message.type === 'coordination') {
        if (Number.isInteger(message.noncePrefix)) {
          noncePrefixRef.current = Number(message.noncePrefix) & 0x0f
        }
        acceptedSharesRef.current = Math.max(acceptedSharesRef.current, Number(message.bridgeAcceptedShares || 0))
        rejectedSharesRef.current = Math.max(rejectedSharesRef.current, Number(message.bridgeRejectedShares || 0))
        setStats((current) => ({
          ...current,
          acceptedShares: Math.max(current.acceptedShares, acceptedSharesRef.current),
          rejectedShares: Math.max(current.rejectedShares, rejectedSharesRef.current),
          poolDifficulty: Number(message.poolDifficulty || current.poolDifficulty || 0),
          coordinatedMiners: Math.max(0, Number(message.coordinatedMiners || 0)),
          coordinationActive: message.active === true,
        }))
      }

      if (message.type === 'status') {
        const connected = Boolean(message.connected)
        if (!connected) pauseWorkers()
        setStats((current) => ({
          ...current,
          hashRate: connected ? current.hashRate : 0,
          poolConnected: connected,
          status: connected ? current.status : 'Puente disponible; esperando conexión con SupportXMR.',
        }))
      }

      if (message.type === 'share_result') {
        if (message.accepted) {
          acceptedSharesRef.current = Math.max(acceptedSharesRef.current + 1, Number(message.accepted_total || 0))
          setStats((current) => ({
            ...current,
            acceptedShares: Math.max(current.acceptedShares, acceptedSharesRef.current),
          }))
        } else {
          rejectedSharesRef.current = Math.max(rejectedSharesRef.current + 1, Number(message.rejected_total || 0))
          setStats((current) => ({
            ...current,
            rejectedShares: Math.max(current.rejectedShares, rejectedSharesRef.current),
          }))
          if (message.error) {
            setError(`Share rechazado: ${message.error}`)
          }
        }
      }

      if (message.type === 'error') {
        setError(message.error)
      }
    }

    ws.onerror = () => {
      setStats((current) => ({
        ...current,
        poolConnected: false,
        status: 'Error de conexión con el puente; esperando reconexión.',
      }))
    }

    ws.onclose = () => {
      if (isClosingRef.current) {
        return
      }
      pauseWorkers()
      setStats((current) => ({
        ...current,
        hashRate: 0,
        poolConnected: false,
        coordinatedMiners: 0,
        coordinationActive: false,
        status: 'Puente desconectado; reconectando en 3 segundos.',
      }))
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null
        setConnectionAttempt((attempt) => attempt + 1)
      }, 3000)
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      workersStartedRef.current = false
      for (const worker of workersRef.current) {
        worker.postMessage({ type: 'stop' })
        worker.terminate()
      }
      workersRef.current = []
      if (wsRef.current) {
        isClosingRef.current = true
        wsRef.current.close()
        wsRef.current = null
      }
      setStats((current) => ({
        ...current,
        hashRate: 0,
        poolConnected: false,
        coordinatedMiners: 0,
        coordinationActive: false,
        status: 'Detenido',
      }))
      setError(null)
    }
  }, [enabled, walletAddress, cpuPercentage, projectId, sendTelemetry, connectionAttempt])

  const stop = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (wsRef.current) {
      isClosingRef.current = true
      wsRef.current.close()
      wsRef.current = null
    }
    for (const worker of workersRef.current) {
      worker.postMessage({ type: 'stop' })
      worker.terminate()
    }
    workersRef.current = []
    setStats((current) => ({ ...current, poolConnected: false, status: 'Detenido' }))
  }, [])

  return { stats, error, stop, poolUrl: 'pool.supportxmr.com:3333 (Stratum/TCP)' }
}
