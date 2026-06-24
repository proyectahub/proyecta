import { useState, useEffect, useRef } from 'react'

/**
 * Hook de minería RandomX REAL.
 *
 * Flujo:
 *   1. Abre WebSocket al proxy Stratum (server.js)
 *   2. Se suscribe con la dirección Monero del proyecto
 *   3. El proxy entrega jobs reales del pool SupportXMR
 *   4. Uno o más Web Workers calculan hashes RandomX reales (WASM)
 *   5. Los shares válidos se envían al proxy → pool → blockchain
 *
 * Verificable en: https://supportxmr.com/api/miner/{wallet}/stats
 * y en https://xmrchain.net/
 */

const WS_URL =
  (import.meta as any).env?.VITE_MINING_WS_URL || 'ws://localhost:3001/ws/mining'

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

export function useRandomXMining(
  walletAddress: string,
  enabled: boolean,
  cpuPercentage: number = 50
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

  useEffect(() => {
    if (!enabled || !walletAddress) {
      return
    }

    // Cantidad de hilos según núcleos disponibles y % de CPU elegido.
    // Cada worker usa ~256MB de RAM (modo light), así que limitamos a 6 para
    // no agotar memoria en equipos modestos.
    const cores = (navigator.hardwareConcurrency || 4)
    const threads = Math.max(1, Math.min(6, Math.round(cores * (cpuPercentage / 100))))

    setError(null)
    setStats((s) => ({ ...s, status: 'Conectando al pool...', poolConnected: false }))
    startTimeRef.current = Date.now()
    perWorkerRef.current = Array.from({ length: threads }, () => ({ rate: 0, hashes: 0 }))

    // ── Crear workers
    const workers: Worker[] = []
    for (let i = 0; i < threads; i++) {
      const worker = new Worker(new URL('../workers/randomx.worker.ts', import.meta.url), {
        type: 'module',
      })
      const idx = i
      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data
        if (msg.type === 'hashrate') {
          perWorkerRef.current[idx] = { rate: msg.hashRate, hashes: msg.totalHashes }
          const totalRate = perWorkerRef.current.reduce((a, w) => a + w.rate, 0)
          const totalHashes = perWorkerRef.current.reduce((a, w) => a + w.hashes, 0)
          setStats((s) => ({
            ...s,
            hashRate: Math.round(totalRate * 10) / 10,
            totalHashes,
            elapsedSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
            status: '⛏️ Minando RandomX real',
          }))
        } else if (msg.type === 'share') {
          // Enviar share válido al proxy
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'share',
                job_id: msg.job_id,
                nonce: msg.nonce,
                result: msg.result,
              })
            )
          }
        } else if (msg.type === 'log') {
          setStats((s) => ({ ...s, status: msg.message }))
        } else if (msg.type === 'error') {
          setError(msg.error)
        }
      }
      worker.postMessage({ type: 'start' })
      workers.push(worker)
    }
    workersRef.current = workers

    // ── Conectar WebSocket al proxy
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', wallet: walletAddress }))
      setStats((s) => ({ ...s, status: 'Suscrito, esperando job del pool...' }))
    }

    ws.onmessage = (e) => {
      let msg: any
      try {
        msg = JSON.parse(e.data)
      } catch {
        return
      }

      if (msg.type === 'job') {
        // Repartir el job a todos los workers
        for (const w of workersRef.current) {
          w.postMessage({ type: 'job', job: msg.job })
        }
        setStats((s) => ({
          ...s,
          poolConnected: true,
          jobHeight: msg.job?.height ?? s.jobHeight,
          status: '⛏️ Minando RandomX real',
        }))
      } else if (msg.type === 'status') {
        setStats((s) => ({ ...s, poolConnected: !!msg.connected }))
      } else if (msg.type === 'share_result') {
        if (msg.accepted) {
          setStats((s) => ({ ...s, acceptedShares: msg.accepted_total ?? s.acceptedShares + 1 }))
        } else {
          setStats((s) => ({ ...s, rejectedShares: msg.rejected_total ?? s.rejectedShares + 1 }))
          if (msg.error) setError(`Share rechazado: ${msg.error}`)
        }
      } else if (msg.type === 'error') {
        setError(msg.error)
      }
    }

    ws.onerror = () => {
      setError(`No se pudo conectar al proxy de minería (${WS_URL}). ¿Está corriendo "npm run server"?`)
      setStats((s) => ({ ...s, poolConnected: false }))
    }

    ws.onclose = () => {
      setStats((s) => ({ ...s, poolConnected: false }))
    }

    // ── Limpieza
    return () => {
      for (const w of workersRef.current) {
        w.postMessage({ type: 'stop' })
        w.terminate()
      }
      workersRef.current = []
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setStats((s) => ({
        ...s,
        hashRate: 0,
        poolConnected: false,
        status: 'Detenido',
      }))
    }
  }, [enabled, walletAddress, cpuPercentage])

  return { stats, error, poolUrl: 'pool.supportxmr.com:3333 (Stratum/TCP vía proxy)' }
}
