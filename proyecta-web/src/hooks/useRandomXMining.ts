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
}

const WS_URL = resolveMiningWebSocketUrl()
const TELEMETRY_INTERVAL_MS = 10000

export function useRandomXMining(
  walletAddress: string,
  enabled: boolean,
  cpuPercentage: number = 50,
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
  })
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const workersRef = useRef<Worker[]>([])
  const startTimeRef = useRef<number>(0)
  const perWorkerRef = useRef<{ rate: number; hashes: number }[]>([])
  const hasPoolJobRef = useRef(false)
  const isClosingRef = useRef(false)
  const sessionIdRef = useRef(Math.random().toString(36).slice(2))
  const lastTelemetryAtRef = useRef(0)
  const workersStartedRef = useRef(false)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
          sessionId: sessionIdRef.current,
          source: 'browser',
          ...payload,
        }),
      }).catch(() => undefined)
    },
    [walletAddress],
  )

  useEffect(() => {
    if (!enabled || !walletAddress) {
      return
    }

    const cores = navigator.hardwareConcurrency || 4
    const threads = Math.max(1, Math.min(6, Math.round(cores * (cpuPercentage / 100))))

    setError(null)
    isClosingRef.current = false
    setStats((current) => ({
      ...current,
      status: 'Conectando al puente de minería...',
      poolConnected: false,
    }))
    startTimeRef.current = Date.now()
    perWorkerRef.current = Array.from({ length: threads }, () => ({ rate: 0, hashes: 0 }))
    hasPoolJobRef.current = false
    workersStartedRef.current = false
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
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
            acceptedShares: stats.acceptedShares,
            rejectedShares: stats.rejectedShares,
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

    const startWorkers = (mode: 'start' | 'benchmark') => {
      if (workersStartedRef.current) return
      workersStartedRef.current = true
      for (const worker of workersRef.current) {
        worker.postMessage({ type: mode })
      }
      setStats((current) => ({
        ...current,
        status: mode === 'benchmark' ? 'Prueba local RandomX activa' : current.status,
      }))
    }

    fallbackTimerRef.current = setTimeout(() => {
      if (!hasPoolJobRef.current) {
        startWorkers('benchmark')
        setStats((current) => ({
          ...current,
          poolConnected: false,
          status: 'Prueba local RandomX activa; esperando puente con el pool.',
        }))
      }
    }, 5000)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', wallet: walletAddress }))
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
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }
        startWorkers('start')
        for (const worker of workersRef.current) {
          worker.postMessage({ type: 'job', job: message.job })
        }
        setStats((current) => ({
          ...current,
          poolConnected: true,
          jobHeight: message.job?.height ?? current.jobHeight,
          status: 'Minando RandomX',
        }))
      }

      if (message.type === 'status') {
        setStats((current) => ({ ...current, poolConnected: !!message.connected }))
      }

      if (message.type === 'share_result') {
        if (message.accepted) {
          setStats((current) => ({
            ...current,
            acceptedShares: message.accepted_total ?? current.acceptedShares + 1,
          }))
        } else {
          setStats((current) => ({
            ...current,
            rejectedShares: message.rejected_total ?? current.rejectedShares + 1,
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
      if (!hasPoolJobRef.current) startWorkers('benchmark')
      setStats((current) => ({
        ...current,
        poolConnected: false,
        status: 'Esperando reconexión del puente; la prueba local sigue activa.',
      }))
    }

    ws.onclose = () => {
      if (!isClosingRef.current && !hasPoolJobRef.current) startWorkers('benchmark')
      if (isClosingRef.current) {
        return
      }
      setStats((current) => ({
        ...current,
        poolConnected: false,
        status: hasPoolJobRef.current
          ? 'Puente cerrado: el navegador detuvo la coordinación con el pool.'
          : 'Esperando reconexión del puente; la prueba local sigue activa.',
      }))
    }

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
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
        status: 'Detenido',
      }))
      setError(null)
    }
  }, [enabled, walletAddress, cpuPercentage, sendTelemetry])

  const stop = useCallback(() => {
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
