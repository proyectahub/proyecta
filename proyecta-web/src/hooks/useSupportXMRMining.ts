import { useEffect, useState } from 'react'
import { PROJECTS_API_BASE, resolveMiningApiBase } from '../lib/api'
import { normalizeSupportXMRStats } from '../lib/supportxmr'

const BACKEND_URL = resolveMiningApiBase()

export function useSupportXMRStats(walletAddress: string, projectId?: string) {
  const [poolStats, setPoolStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) return

    const fetchStats = async () => {
      setLoading(true)
      try {
        const statsPath = projectId
          ? `${PROJECTS_API_BASE}/projects/${encodeURIComponent(projectId)}/mining-stats`
          : `${BACKEND_URL}/pool-stats/${encodeURIComponent(walletAddress)}`
        const backendResponse = await fetch(statsPath)
        if (backendResponse.ok) {
          setPoolStats(normalizeSupportXMRStats(await backendResponse.json()))
          setError(null)
          return
        }

        if (projectId) throw new Error('No se pudieron cargar las estadísticas del proyecto.')

        const poolResponse = await fetch(`https://supportxmr.com/api/miner/${encodeURIComponent(walletAddress)}/stats`)
        if (!poolResponse.ok) throw new Error('No se pudieron cargar las estadísticas de SupportXMR.')
        setPoolStats(normalizeSupportXMRStats(await poolResponse.json()))
        setError(null)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar las estadísticas.')
        setPoolStats({
          lastHash: Date.now(), totalHashes: 0, totalPaid: 0, paid: 0, balance: 0,
          hashrate: 0, visibleBalance: 0, localBalance: 0, isLocalActive: false, isPoolConfirmed: false,
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchStats()
    const interval = window.setInterval(() => void fetchStats(), 10000)
    return () => window.clearInterval(interval)
  }, [walletAddress, projectId])

  return { poolStats, loading, error }
}
