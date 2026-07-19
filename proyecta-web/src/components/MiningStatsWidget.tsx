import { useEffect, useState } from 'react'
import { RefreshCw, Zap, Target } from 'lucide-react'
import { resolveMiningApiBase } from '../lib/api'
import { normalizeSupportXMRStats } from '../lib/supportxmr'
import { useMoneroPrice } from '../hooks/useMoneroPrice'

interface MiningStats {
  hashrate: number
  totalHashes: number
  balance: number
  totalPaid: number
  lastHash: number
  minPayout: number
  confirmedBalance?: number
  localBalance?: number
  visibleBalance?: number
  localHashrate?: number
  localTotalHashes?: number
  visibleHashrate?: number
  visibleTotalHashes?: number
  isLocalActive?: boolean
  isPoolConfirmed?: boolean
  status?: string
  confirmedValidShares?: number
  confirmedInvalidShares?: number
  externalMiningActive?: boolean
  miningIntent?: boolean
  browserMiningSelected?: boolean
  nativeMiningSelected?: boolean
  poolIdentifier?: string | null
  localMiners?: number
  localBrowserMiners?: number
  localNativeMiners?: number
  localBrowserHashrate?: number
  localNativeHashrate?: number
  localTelemetryUnverified?: boolean
}

interface MiningStatsWidgetProps {
  wallet: string
  fundingGoal: number
  projectTitle: string
  projectId?: string
  selectedMiningOption?: 'browser' | 'app' | null
}

function hasVisibleMiningData(stats: MiningStats | null) {
  if (!stats) return false
  return Boolean(stats.localBalance || stats.localHashrate || stats.localTotalHashes || stats.isLocalActive || stats.localMiners)
}

function formatXmr(value: number, decimals = 4) {
  return value.toFixed(decimals)
}

function createEmptyProjectStats(): MiningStats {
  return {
    hashrate: 0,
    totalHashes: 0,
    balance: 0,
    totalPaid: 0,
    lastHash: Date.now(),
    minPayout: 0.3,
    confirmedBalance: 0,
    localBalance: 0,
    visibleBalance: 0,
    localHashrate: 0,
    localTotalHashes: 0,
    visibleHashrate: 0,
    visibleTotalHashes: 0,
    isLocalActive: false,
    isPoolConfirmed: false,
    confirmedValidShares: 0,
    confirmedInvalidShares: 0,
    localMiners: 0,
  }
}
export function MiningStatsWidget({ wallet, fundingGoal, projectTitle, projectId, selectedMiningOption = null }: MiningStatsWidgetProps) {
  const { xmrPrice } = useMoneroPrice()
  const [stats, setStats] = useState<MiningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchMiningStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrls = projectId
        ? [`${resolveMiningApiBase()}/project-stats/${encodeURIComponent(projectId)}/${wallet}`]
        : [
            `${resolveMiningApiBase()}/pool-stats/${wallet}`,
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

      setStats(projectId ? createEmptyProjectStats() : null)
      setError(projectId ? 'No fue posible consultar las estadísticas del proyecto.' : 'No fue posible consultar SupportXMR en este momento.')
    } catch (err) {
      setStats(projectId ? createEmptyProjectStats() : null)
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMiningStats()
    const interval = setInterval(fetchMiningStats, 30000)
    return () => clearInterval(interval)
  }, [wallet, projectId])

  if (loading && !stats) {
    return (
      <div className="nova-card space-y-3 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Zap className="h-5 w-5 text-purple-600" />
            Minería comunitaria
          </h3>
          <div className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
        </div>
        <p className="text-sm text-slate-600">Consultando el estado de este proyecto...</p>
      </div>
    )
  }

  const confirmedBalance = Number(stats?.confirmedBalance ?? (stats?.isPoolConfirmed ? stats?.balance ?? 0 : 0))
  const visibleBalance = confirmedBalance
  const visibleHashrate = Number(stats?.visibleHashrate ?? stats?.hashrate ?? 0)
  const visibleTotalHashes = Number(stats?.visibleTotalHashes ?? stats?.totalHashes ?? 0)
  const confirmedValidShares = Number(stats?.confirmedValidShares ?? 0)
  const confirmedInvalidShares = Number(stats?.confirmedInvalidShares ?? 0)
  const localMiners = Number(stats?.localMiners ?? 0)
  const localBrowserMiners = Number(stats?.localBrowserMiners ?? 0)
  const localNativeMiners = Number(stats?.localNativeMiners ?? 0)
  const localBrowserHashrate = Number(stats?.localBrowserHashrate ?? 0)
  const localNativeHashrate = Number(stats?.localNativeHashrate ?? 0)
  const confirmed = Boolean(stats?.isPoolConfirmed || confirmedValidShares > 0)
  const localActive = Boolean(stats?.isLocalActive)
  const webMiningSelected = selectedMiningOption === 'browser' || Boolean(stats?.browserMiningSelected || stats?.miningIntent)
  const projectHasMiningActivity = hasVisibleMiningData(stats)
  const showCommunityProgress = projectHasMiningActivity || webMiningSelected
  const progressPercent = showCommunityProgress ? Math.min((visibleBalance / fundingGoal) * 100, 100) : 0
  const remaining = Math.max(fundingGoal - visibleBalance, 0)
  const usdValue = xmrPrice === null ? null : (visibleBalance * xmrPrice).toFixed(2)
  const visibleStatusLabel = confirmed && localActive
    ? 'Confirmado + telemetría local'
    : confirmed
      ? 'Saldo confirmado por SupportXMR'
      : localActive
        ? 'Telemetría local sin acreditar'
        : webMiningSelected
          ? 'Minería web seleccionada'
          : 'Esperando confirmación del pool'

  if (stats && !showCommunityProgress) {
    return (
      <div className="nova-card space-y-4 border-2 border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Zap className="h-5 w-5 text-slate-500" />
              Minería comunitaria lista
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Aún no se ha iniciado minería para <span className="font-semibold">{projectTitle}</span>. No se muestra el historial global de la wallet como avance de este proyecto.
            </p>
          </div>
          <button
            onClick={fetchMiningStats}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-50 hover:text-purple-600"
            title="Actualizar ahora"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold text-slate-600">Recaudado por este proyecto</p>
            <p className="font-bold text-slate-900">0.0000 XMR</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold text-slate-600">Hashrate activo</p>
            <p className="font-bold text-slate-900">0.00 H/s</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold text-slate-600">Hashes del proyecto</p>
            <p className="font-bold text-slate-900">0.00M</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold text-slate-600">Estado</p>
            <p className="font-bold text-slate-900">Sin minería iniciada</p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          La dirección del investigador sigue siendo válida para recibir XMR, pero el progreso de este proyecto empieza en cero hasta que alguien elija navegador o app y aporte cómputo.
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="nova-card space-y-4 border-2 border-amber-200 bg-amber-50 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold text-amber-900">
            <Zap className="h-5 w-5" />
            Minería comunitaria
          </h3>
          <button onClick={fetchMiningStats} className="text-xs font-bold text-amber-800 hover:text-amber-900">
            Reintentar
          </button>
        </div>
        <div className="space-y-2 rounded-lg border border-amber-200 bg-white p-4 text-sm text-amber-900">
          <p className="font-bold">Esperando confirmación del pool</p>
          <p>
            No pudimos leer el resumen de minería todavía. Si la prueba local está activa, el navegador puede seguir aportando mientras el pool confirma los datos.
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
            Minería comunitaria
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {confirmed && localActive
              ? 'SupportXMR confirmó saldo y actividad. La telemetría del navegador o app se muestra por separado y no modifica la recaudación.'
              : confirmed
                ? 'SupportXMR confirmó la dirección. El saldo y el avance provienen exclusivamente del pool.'
                : localActive
                  ? 'El navegador o app reporta actividad local. Esta telemetría no es saldo ni recaudación hasta que SupportXMR la acredite.'
                  : webMiningSelected
                    ? 'La opción de minería web ya fue seleccionada. El progreso se mantiene en cero hasta que el navegador empiece a reportar hashes reales.'
                  : 'Esperando confirmación del pool. El saldo y la meta permanecen en cero hasta recibir datos acreditados.'}
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

      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${confirmed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : localActive || webMiningSelected ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
        {visibleStatusLabel}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="font-bold text-slate-900">{formatXmr(visibleBalance, 4)} XMR</span>
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
          <span>{usdValue === null ? 'Cotización USD no disponible' : `$ ${usdValue} USD`}</span>
          <span>Falta: {remaining.toFixed(4)} XMR</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Hashrate visible</p>
          <p className="font-bold text-slate-900">{visibleHashrate.toFixed(2)} H/s</p>
          <p className="mt-1 text-xs text-slate-500">solo datos confirmados por el pool</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Total de hashes</p>
          <p className="font-bold text-slate-900">{(visibleTotalHashes / 1e6).toFixed(2)}M</p>
          <p className="mt-1 text-xs text-slate-500">acreditados por el pool</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Saldo confirmado por SupportXMR</p>
          <p className="font-bold text-slate-900">{confirmedBalance.toFixed(4)} XMR</p>
          <p className="mt-1 text-xs text-slate-500">SupportXMR</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Shares confirmados</p>
          <p className="font-bold text-slate-900">{confirmedValidShares.toLocaleString('es-ES')}</p>
          <p className="mt-1 text-xs text-slate-500">{confirmedInvalidShares.toLocaleString('es-ES')} inválidos</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold text-slate-600">Telemetría sin acreditar</p>
          <p className="font-bold text-slate-900">{localMiners} equipo(s)</p>
          <p className="mt-1 text-xs text-slate-500">{localBrowserMiners} web / {localNativeMiners} app. No equivale a XMR.</p>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          <p className="text-sm font-bold text-slate-900">Estado visible de este proyecto: {visibleStatusLabel.toLowerCase()}</p>
        </div>
        <p className="text-xs text-slate-600">
          Dirección: <code className="break-all rounded bg-slate-100 px-2 py-1 font-mono text-xs">{wallet.substring(0, 32)}...</code>
        </p>
        <p className="text-xs text-slate-600">
          Verifica en SupportXMR:{' '}
          <a
            href="https://supportxmr.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 hover:underline"
          >
            Abrir SupportXMR
          </a>
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-500 md:grid-cols-2">
          <p>Web local: {localBrowserHashrate.toFixed(2)} H/s (sin acreditar)</p>
          <p>App local: {localNativeHashrate.toFixed(2)} H/s (sin acreditar)</p>
        </div>
        {lastUpdate && (
          <p className="mt-2 text-xs text-slate-500">Actualizado: {lastUpdate.toLocaleTimeString('es-ES')}</p>
        )}
      </div>

      <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4">
        <p className="mb-2 text-xs font-bold text-emerald-900">Cómo funciona la minería comunitaria</p>
        <ul className="space-y-1 text-xs text-emerald-800">
          <li>Comunidad elige iniciar minería para este proyecto</li>
          <li>Cada participante aporta poder de cómputo (App o Navegador)</li>
          <li>SupportXMR acredita shares y paga XMR según sus propios registros</li>
          <li>XMR va directamente a la dirección del investigador</li>
          <li>PROYECTA no custodia fondos ni convierte hashes locales en saldo</li>
        </ul>
      </div>
    </div>
  )
}

