import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, Zap, Target } from 'lucide-react'
import { API_BASE } from '../lib/api'
import { normalizeSupportXMRStats } from '../lib/supportxmr'

interface MiningStats {
  hashrate: number
  totalHashes: number
  balance: number
  totalPaid: number
  lastHash: number
  minPayout: number
}

interface MiningStatsWidgetProps {
  wallet: string
  fundingGoal: number
  projectTitle: string
}

export function MiningStatsWidget({ wallet, fundingGoal, projectTitle }: MiningStatsWidgetProps) {
  const [stats, setStats] = useState<MiningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchMiningStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrls = [
        `${API_BASE}/api/mining/pool-stats/${wallet}`,
        `https://supportxmr.com/api/miner/${wallet}/stats`,
      ]

      for (const url of apiUrls) {
        try {
          const response = await fetch(url)
          if (!response.ok) {
            continue
          }

          const data = await response.json()
          const normalized = normalizeSupportXMRStats(data)

          setStats(normalized)
          setLastUpdate(new Date())
          return
        } catch {
          continue
        }
      }

      setError('No fue posible obtener estadisticas de mineria')
      setStats(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estadisticas')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMiningStats()
    const interval = setInterval(fetchMiningStats, 30000)
    return () => clearInterval(interval)
  }, [wallet])

  if (loading && !stats) {
    return (
      <div className="nova-card p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Mineria en tiempo real
          </h3>
          <div className="inline-flex animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
        </div>
        <p className="text-sm text-slate-500">Cargando estadisticas del pool...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="nova-card p-6 bg-blue-50 border-2 border-blue-200 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Mineria en tiempo real
          </h3>
          <button
            onClick={fetchMiningStats}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold"
          >
            Reintentar
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-blue-700">
            <strong>La mineria esta ocurriendo en SupportXMR.</strong> Si no ves datos aqui, puedes verificar manualmente:
          </p>
          <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-2">
            <p className="text-sm font-bold text-slate-900">Verificar en SupportXMR directamente:</p>
            <p className="text-xs text-slate-600 mb-2">Direccion: <code className="font-mono bg-slate-100 px-1 rounded break-all">{wallet.substring(0, 32)}...</code></p>
            <a
              href={`https://supportxmr.com/miner/${wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm transition"
            >
              Ver en SupportXMR.com ?
            </a>
          </div>
          <p className="text-xs text-blue-600">
            El widget se sincronizara automaticamente cuando SupportXMR confirme los datos.
          </p>
        </div>
      </div>
    )
  }

  const progressPercent = Math.min((stats.balance / fundingGoal) * 100, 100)
  const remaining = Math.max(fundingGoal - stats.balance, 0)
  const usdValue = (stats.balance * 316.12).toFixed(2)
  const usdGoal = (fundingGoal * 316.12).toFixed(0)

  return (
    <div className="nova-card p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-purple-600" />
          Mineria comunitaria en progreso
        </h3>
        <button
          onClick={fetchMiningStats}
          className="p-2 hover:bg-white rounded-lg transition text-slate-600 hover:text-purple-600"
          title="Actualizar ahora"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-slate-900">{stats.balance.toFixed(4)} XMR</span>
          <span className="text-sm text-slate-600">
            de {fundingGoal.toFixed(2)} XMR ({progressPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>$ {usdValue} USD</span>
          <span>Falta: {remaining.toFixed(4)} XMR</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-1">Hashrate actual</p>
          <p className="font-bold text-slate-900">{stats.hashrate.toFixed(2)} H/s</p>
          <p className="text-xs text-slate-500 mt-1">en tiempo real</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-1">Total de hashes</p>
          <p className="font-bold text-slate-900">{(stats.totalHashes / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-slate-500 mt-1">acumulados</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-1">Saldo pendiente</p>
          <p className="font-bold text-slate-900">{stats.balance.toFixed(4)} XMR</p>
          <p className="text-xs text-slate-500 mt-1">listo para pagar</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-1">Total pagado</p>
          <p className="font-bold text-slate-900">{stats.totalPaid.toFixed(4)} XMR</p>
          <p className="text-xs text-slate-500 mt-1">confirmado</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-purple-600" />
          <p className="font-bold text-slate-900 text-sm">Pool: SupportXMR (0.6% fee)</p>
        </div>
        <p className="text-xs text-slate-600">
          Direccion: <code className="font-mono text-xs bg-slate-100 px-2 py-1 rounded break-all">{wallet.substring(0, 32)}...</code>
        </p>
        <p className="text-xs text-slate-600">
          Verificable en: <a
            href={`https://supportxmr.com/miner/${wallet}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-bold"
          >
            SupportXMR Stats
          </a>
        </p>
        {lastUpdate && (
          <p className="text-xs text-slate-500 mt-2">
            Actualizado: {lastUpdate.toLocaleTimeString('es-ES')}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-300 rounded-lg p-4 space-y-2">
        <p className="text-xs font-bold text-emerald-900">Como funciona la mineria comunitaria</p>
        <ul className="text-xs text-emerald-800 space-y-1">
          <li>Comunidad elige iniciar mineria para este proyecto</li>
          <li>Cada participante aporta poder de computo (App o Navegador)</li>
          <li>SupportXMR acumula hashes y paga en XMR automaticamente</li>
          <li>XMR va directamente a direccion del investigador</li>
          <li>PROYECTA solo registra, nunca custodia fondos</li>
        </ul>
      </div>
    </div>
  )
}

