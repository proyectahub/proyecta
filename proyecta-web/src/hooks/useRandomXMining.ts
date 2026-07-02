import { useCallback, useEffect, useRef, useState } from "react"
import { resolveMiningWebSocketUrl } from "../lib/api"

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

const BACKEND_URL = import.meta.env.VITE_MINING_API_URL ?? import.meta.env.VITE_API_URL ?? "/api/mining"
const WS_URL = resolveMiningWebSocketUrl()

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
    status: "Inactivo",
  })
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const workersRef = useRef<Worker[]>([])
  const startTimeRef = useRef<number>(0)
  const perWorkerRef = useRef<{ rate: number; hashes: number }[]>([])

  useEffect(() => {
    if (!enabled || !walletAddress) {
      return
    }

    const cores = navigator.hardwareConcurrency || 4
    const threads = Math.max(1, Math.min(6, Math.round(cores * (cpuPercentage / 100))))

    setError(null)
    setStats((current) => ({
      ...current,
      status: "Conectando al pool...",
      poolConnected: false,
    }))
    startTimeRef.current = Date.now()
    perWorkerRef.current = Array.from({ length: threads }, () => ({ rate: 0, hashes: 0 }))

    const workers: Worker[] = []
    for (let index = 0; index < threads; index += 1) {
      const worker = new Worker(new URL("../workers/randomx.worker.ts", import.meta.url), {
        type: "module",
      })

      worker.onmessage = (event: MessageEvent) => {
        const message = event.data
        if (message.type === "hashrate") {
          perWorkerRef.current[index] = { rate: message.hashRate, hashes: message.totalHashes }
          const totalRate = perWorkerRef.current.reduce((sum, workerStats) => sum + workerStats.rate, 0)
          const totalHashes = perWorkerRef.current.reduce((sum, workerStats) => sum + workerStats.hashes, 0)
          setStats((current) => ({
            ...current,
            hashRate: Math.round(totalRate * 10) / 10,
            totalHashes,
            elapsedSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
            status: "Minando RandomX real",
          }))
        }

        if (message.type === "share" && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "share",
              job_id: message.job_id,
              nonce: message.nonce,
              result: message.result,
            }),
          )
        }

        if (message.type === "log") {
          setStats((current) => ({ ...current, status: message.message }))
        }

        if (message.type === "error") {
          setError(message.error)
        }
      }

      worker.postMessage({ type: "start" })
      workers.push(worker)
    }

    workersRef.current = workers

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", wallet: walletAddress }))
      setStats((current) => ({ ...current, status: "Suscrito, esperando job del pool..." }))
    }

    ws.onmessage = (event) => {
      let message: any
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }

      if (message.type === "job") {
        for (const worker of workersRef.current) {
          worker.postMessage({ type: "job", job: message.job })
        }
        setStats((current) => ({
          ...current,
          poolConnected: true,
          jobHeight: message.job?.height ?? current.jobHeight,
          status: "Minando RandomX real",
        }))
      }

      if (message.type === "status") {
        setStats((current) => ({ ...current, poolConnected: !!message.connected }))
      }

      if (message.type === "share_result") {
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

      if (message.type === "error") {
        setError(message.error)
      }
    }

    ws.onerror = () => {
      setError(`No se pudo conectar al proxy de mineria (${WS_URL}).`)
      setStats((current) => ({ ...current, poolConnected: false }))
    }

    ws.onclose = () => {
      setStats((current) => ({ ...current, poolConnected: false }))
    }

    return () => {
      for (const worker of workersRef.current) {
        worker.postMessage({ type: "stop" })
        worker.terminate()
      }
      workersRef.current = []
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setStats((current) => ({
        ...current,
        hashRate: 0,
        poolConnected: false,
        status: "Detenido",
      }))
    }
  }, [enabled, walletAddress, cpuPercentage])

  const stop = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    for (const worker of workersRef.current) {
      worker.postMessage({ type: "stop" })
      worker.terminate()
    }
    workersRef.current = []
    setStats((current) => ({ ...current, poolConnected: false, status: "Detenido" }))
  }, [])

  return { stats, error, stop, poolUrl: "pool.supportxmr.com:3333 (Stratum/TCP via proxy)" }
}
