import { useEffect, useState } from 'react'
import { RefreshCw, Zap, Target } from 'lucide-react'
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

function hasConfirmedPoolData(stats: MiningStats | null) {
  if (!stats) return false
  return stats.hashrate > 0 || stats.totalHashes > 0 || stats.balance > 0 || stats.totalPaid > 0
}

export function MiningStatsWidget({ wallet, fundingGoal }: MiningStatsWidgetProps) {
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

      setStats(null)
      setError('No fue posible consultar SupportXMR en este momento.')
    } catch (err) {
      setStats(null)
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas')
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
      <div className="nova-card space-y-3 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Zap className="h-5 w-5 text-purple-600" />
            Minería comunitaria en progreso
          </h3>
          <div className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
        </div>
        <p className="text-sm text-slate-600">Consultando confirmación del pool...</p>
      </div>
    )
  }

  const confirmed = hasConfirmedPoolData(stats)
  const progressPercent = confirmed ? Math.min((stats!.balance / fundingGoal) * 100, 100) : 0
  const remaining = confirmed ? Math.max(fundingGoal - stats!.balance, 0) : fundingGoal
  const usdValue = confirmed ? (stats!.balance * 316.12).toFixed(2) : '0.00'

  if (!stats) {
    return (
      <div className="nova-card space-y-4 border-2 border-amber-200 bg-amber-50 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold text-amber-900">
            <Zap className="h-5 w-5" />
            Minería comunitaria en progreso
          </h3>
          <button onClick={fetchMiningStats} className="text-xs font-bold text-amber-800 hover:text-amber-900">
            Reintentar
          </button>
        </div>
        <div className="space-y-2 rounded-lg border border-amber-200 bg-white p-4 text-sm text-amber-900">
          <p className="font-bold">Esperando confirmación del pool</p>
          <p>
            No pudimos leer SupportXMR todavía. Si la minería local está activa, el navegador puede seguir generando hashes mientras el pool confirma los datos.
          </p>
          <p className="text-xs text-amber-700">
            Verifica manualmente en SupportXMR con la dirección del proyecto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="nova-card space-y-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Zap className="h-5 w-5 text-purple-600" />
            Minería comunitaria en progreso
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {confirmed
              ? 'SupportXMR ya confirmó actividad para esta dirección.'
              : 'El navegador puede estar aportando localmente mientras SupportXMR confirma.'}
          </p>
        </div>
        <button
          onClick={fetchMiningStats}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-purple-600"
          title="Actualizar ahora"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${confirmed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        {confirmed ? 'Pool confirmado' : 'Esperando confirmación del pool'}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="font-bold text-slate-900">{confirmed ? stats.balance.toFixed(4) : '0.0000'} XMR</span>
          <span className="text-sm text-slate-600">
            de {fundingGoal.toFixed(2)} XMR ({progressPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Hashrate actual</p>
          <p className="font-bold text-slate-900">{confirmed ? stats.hashrate.toFixed(2) : '0.00'} H/s</p>
          <p className="mt-1 text-xs text-slate-500">en tiempo real</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Total de hashes</p>
          <p className="font-bold text-slate-900">{confirmed ? (stats.totalHashes / 1e6).toFixed(2) : '0.00'}M</p>
          <p className="mt-1 text-xs text-slate-500">acumulados</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Saldo pendiente</p>
          <p className="font-bold text-slate-900">{confirmed ? stats.balance.toFixed(4) : '0.0000'} XMR</p>
          <p className="mt-1 text-xs text-slate-500">listo para pagar</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Total pagado</p>
          <p className="font-bold text-slate-900">{confirmed ? stats.totalPaid.toFixed(4) : '0.0000'} XMR</p>
          <p className="mt-1 text-xs text-slate-500">confirmado</p>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          <p className="text-sm font-bold text-slate-900">Pool: SupportXMR (0.6% fee)</p>
        </div>
        <p className="text-xs text-slate-600">
          Dirección: <code className="break-all rounded bg-slate-100 px-2 py-1 font-mono text-xs">{wallet.substring(0, 32)}...</code>
        </p>
        <p className="text-xs text-slate-600">
          Verificable en:{' '}
          <a
            href={`https://supportxmr.com/miner/${wallet}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 hover:underline"
          >
            SupportXMR Stats
          </a>
        </p>
        {lastUpdate && (
          <p className="mt-2 text-xs text-slate-500">Actualizado: {lastUpdate.toLocaleTimeString('es-ES')}</p>
        )}
      </div>

      {!confirmed ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Esperando confirmación del pool</p>
          <p className="mt-1">
            El navegador puede estar minando o enviando shares, pero este bloque solo sube cuando SupportXMR publica datos verificables para esta dirección.
          </p>
        </div>
      ) : null}

      <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4">
        <p className="mb-2 text-xs font-bold text-emerald-900">Cómo funciona la minería comunitaria</p>
        <ul className="space-y-1 text-xs text-emerald-800">
          <li>Comunidad elige iniciar minería para este proyecto</li>
          <li>Cada participante aporta poder de cómputo (App o Navegador)</li>
          <li>SupportXMR acumula hashes y paga en XMR automáticamente</li>
          <li>XMR va directamente a dirección del investigador</li>
          <li>PROYECTA solo registra, nunca custodia fondos</li>
        </ul>
      </div>
    </div>
  )
}
