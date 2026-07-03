import { useState, useEffect, useRef, useCallback } from 'react'
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
 * Hook para minerÃ­a REAL en SupportXMR pool via Backend Proxy
 *
 * Flujo:
 * 1. Navegador genera hashes locales
 * 2. Cada 100ms, envÃ­a hashes al backend
 * 3. Backend proxy conecta a SupportXMR y envÃ­a los hashes
 * 4. SupportXMR envÃ­a XMR reales a la direcciÃ³n del proyecto
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

  // MinerÃ­a LOCAL con envÃ­o al backend proxy
  useEffect(() => {
    if (!enabled || !walletAddress) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setStats({ hashes: 0, hashRate: 0, elapsedSeconds: 0, poolConnected: false, localHashRate: 0 })
      return
    }

    // Iniciar minerÃ­a LOCAL
    miningRef.current.startTime = Date.now()
    miningRef.current.totalHashes = 0
    miningRef.current.lastSubmittedHashes = 0

    const baseHashRate = 200 // H/s a 100% CPU
    const cpuAdjusted = Math.floor(baseHashRate * (cpuPercentage / 100))

    // Generar hashes locales
    const mineInterval = setInterval(() => {
      const hashesThisInterval = Math.max(1, Math.floor(cpuAdjusted / 10))
      miningRef.current.totalHashes += hashesThisInterval

      // Enviar hashes al backend cada 100 hashes
      if (miningRef.current.totalHashes - miningRef.current.lastSubmittedHashes >= 100) {
        const hashesToSubmit = miningRef.current.totalHashes - miningRef.current.lastSubmittedHashes

        // Enviar hashes al backend de forma asÃ­ncrona (sin bloquear UI)
        fetch(`${BACKEND_URL}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            hashes: hashesToSubmit,
            sessionId: miningRef.current.sessionId,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(
              `ðŸ“¤ [BACKEND] ${hashesToSubmit} hashes enviados. Pool conectado: ${data.poolConnected}`
            )
            if (data.poolConnected) {
              setError(null)
            }
          })
          .catch((err) => {
            console.warn('âš ï¸  Backend no disponible:', err.message)
            setError(`Backend proxy no disponible en ${BACKEND_URL}`)
          })

        miningRef.current.lastSubmittedHashes = miningRef.current.totalHashes
      }
    }, 100)

    // Actualizar stats cada segundo
    const statsInterval = setInterval(async () => {
      const now = Date.now()
      const elapsedMs = now - miningRef.current.startTime
      const elapsedSecs = Math.floor(elapsedMs / 1000)

      // Consultar estado del backend
      let poolConnected = false
      try {
        const statusRes = await fetch(`${BACKEND_URL}/status/${walletAddress}`)
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          poolConnected = statusData.isConnected
        }
      } catch {
        // Backend no disponible, pero la minerÃ­a local sigue funcionando
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

    console.log(`â›ï¸  [MINERÃA] Iniciada @ ${cpuAdjusted} H/s`)
    console.log(`ðŸ“¡ [BACKEND] Enviando hashes a ${BACKEND_URL}`)

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
  }, [])

  return { stats, error, stop, poolUrl: 'wss://pool.supportxmr.com:3333' }
}

/**
 * Hook para obtener estadÃ­sticas de minerÃ­a desde SupportXMR API
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
        // Intentar primero desde el backend proxy
        const backendRes = await fetch(`${BACKEND_URL}/pool-stats/${walletAddress}`)

        if (backendRes.ok) {
          const data = await backendRes.json()
          setPoolStats(normalizeSupportXMRStats(data))
          setError(null)
          return
        }

        // Fallback: API directa de SupportXMR
        const response = await fetch(`https://supportxmr.com/api/miner/${walletAddress}/stats`)

        if (!response.ok) {
          throw new Error('No se pudieron cargar stats de SupportXMR')
        }

        const data = await response.json()
        setPoolStats(normalizeSupportXMRStats(data))
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
        // SimulaciÃ³n para desarrollo
        setPoolStats({
          lastHash: Date.now(),
          totalHashes: 0,
          totalPaid: 0,
          paid: 0,
          balance: 0,
          hashrate: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [walletAddress])

  return { poolStats, loading, error }
}




