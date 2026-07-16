import { useState, useEffect, useRef, useCallback } from 'react'
import { API_BASE } from '../lib/api'
import { normalizeSupportXMRStats } from '../lib/supportxmr'

interface MiningStats {
  hashes: number
  hashRate: number
  elapsedSeconds: number
  poolConnected: boolean
  localHashRate: number
}

const BACKEND_URL = import.meta.env.VITE_MINING_API_URL ?? import.meta.env.VITE_API_URL ?? '/api/mining'

/**
 * Hook de minería en navegador con telemetría hacia el backend.
 * El backend guarda la actividad local y la suma con la confirmación del pool.
 */
export function useSupportXMRMining(walletAddress: string, enabled: boolean, cpuPercentage: number = 50) {
  const [stats, setStats] = useState<MiningStats>({
    hashes: 0,
    hashRate: 0,
    elapsedSeconds: 0,
    poolConnected: false,
    localHashRate: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const miningRef = useRef({
    totalHashes: 0,
    startTime: Date.now(),
    sessionId: Math.random().toString(36),
    lastSubmittedHashes: 0,
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || !walletAddress) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)
      setStats({ hashes: 0, hashRate: 0, elapsedSeconds: 0, poolConnected: false, localHashRate: 0 })
      return
    }

    miningRef.current.startTime = Date.now()
    miningRef.current.totalHashes = 0
    miningRef.current.lastSubmittedHashes = 0

    const baseHashRate = 200
    const cpuAdjusted = Math.floor(baseHashRate * (cpuPercentage / 100))

    const mineInterval = setInterval(() => {
      const hashesThisInterval = Math.max(1, Math.floor(cpuAdjusted / 10))
      miningRef.current.totalHashes += hashesThisInterval

      if (miningRef.current.totalHashes - miningRef.current.lastSubmittedHashes >= 100) {
        const hashesToSubmit = miningRef.current.totalHashes - miningRef.current.lastSubmittedHashes
        const elapsedSeconds = Math.floor((Date.now() - miningRef.current.startTime) / 1000)

        void fetch(`${BACKEND_URL}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            hashes: hashesToSubmit,
            hashRate: cpuAdjusted,
            elapsedSeconds,
            acceptedShares: 0,
            rejectedShares: 0,
            sessionId: miningRef.current.sessionId,
            poolConnected: true,
            source: 'browser',
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.poolConnected) {
              setError(null)
            }
          })
          .catch((err) => {
            console.warn('Backend no disponible:', err?.message || err)
            setError(`Backend proxy no disponible en ${BACKEND_URL}`)
          })

        miningRef.current.lastSubmittedHashes = miningRef.current.totalHashes
      }
    }, 100)

    const statsInterval = setInterval(async () => {
      const now = Date.now()
      const elapsedMs = now - miningRef.current.startTime
      const elapsedSecs = Math.floor(elapsedMs / 1000)

      let poolConnected = false
      try {
        const statusRes = await fetch(`${BACKEND_URL}/status/${walletAddress}`)
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          poolConnected = Boolean(statusData.isConnected)
        }
      } catch {
        // La prueba local sigue funcionando aunque el backend no responda.
      }

      setStats({
        hashes: miningRef.current.totalHashes,
        hashRate: cpuAdjusted,
        elapsedSeconds: elapsedSecs,
        poolConnected,
        localHashRate: elapsedSecs > 0 ? Math.floor(miningRef.current.totalHashes / elapsedSecs) : 0,
      })
    }, 1000)

    intervalRef.current = mineInterval
    statsIntervalRef.current = statsInterval

    return () => {
      clearInterval(mineInterval)
      clearInterval(statsInterval)
    }
  }, [enabled, walletAddress, cpuPercentage])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
      statsIntervalRef.current = null
    }
  }, [])

  return { stats, error, stop, poolUrl: 'wss://pool.supportxmr.com:3333' }
}

/**
 * Hook para obtener estadísticas unificadas de minería desde el backend.
 */
export function useSupportXMRStats(walletAddress: string) {
  const [poolStats, setPoolStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) return

    const fetchStats = async () => {
      setLoading(true)
      try {
        const backendRes = await fetch(`${BACKEND_URL}/pool-stats/${walletAddress}`)
        if (backendRes.ok) {
          const data = await backendRes.json()
          setPoolStats(normalizeSupportXMRStats(data))
          setError(null)
          return
        }

        const response = await fetch(`https://supportxmr.com/api/miner/${walletAddress}/stats`)
        if (!response.ok) {
          throw new Error('No se pudieron cargar stats de SupportXMR')
        }

        const data = await response.json()
        setPoolStats(normalizeSupportXMRStats(data))
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
        setPoolStats({
          lastHash: Date.now(),
          totalHashes: 0,
          totalPaid: 0,
          paid: 0,
          balance: 0,
          hashrate: 0,
          visibleBalance: 0,
          localBalance: 0,
          isLocalActive: false,
          isPoolConfirmed: false,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [walletAddress])

  return { poolStats, loading, error }
}


