import { useEffect, useState } from 'react'
import { Activity, Cpu, ExternalLink, Radio, RefreshCw, Target, WalletCards, Zap } from 'lucide-react'
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
  confirmedTotalPaid?: number
  confirmedValidShares?: number
  confirmedInvalidShares?: number
  localHashrate?: number
  localTotalHashes?: number
  localMiners?: number
  localBrowserMiners?: number
  localNativeMiners?: number
  localBrowserHashrate?: number
  localNativeHashrate?: number
  isLocalActive?: boolean
  isPoolConfirmed?: boolean
  miningIntent?: boolean
  browserMiningSelected?: boolean
  bridgeConnected?: boolean
  bridgeMiners?: number
  poolDifficulty?: number
  expectedShareSeconds?: number | null
  shareProbability95Seconds?: number | null
  nonceCoordinationActive?: boolean
  baselineCapturedAt?: number | null
  poolDataConfirmed?: boolean
  poolPendingBalance?: number
  poolTotalPaid?: number
  poolHashrate?: number
  poolTotalHashes?: number
  poolValidShares?: number
  poolInvalidShares?: number
  poolWorkers?: string[]
  poolWorkerCount?: number
  poolLastHash?: number
}

interface MiningStatsWidgetProps {
  wallet: string
  fundingGoal: number
  projectTitle: string
  projectId?: string
  selectedMiningOption?: 'browser' | 'app' | null
}

function createEmptyProjectStats(): MiningStats {
  return {
    hashrate: 0,
    totalHashes: 0,
    balance: 0,
    totalPaid: 0,
    lastHash: 0,
    minPayout: 0.1,
  }
}

function formatXmr(value: number, decimals = 8) {
  return Math.max(0, value).toFixed(decimals)
}

function formatHashrate(value: number) {
  return `${Math.max(0, value).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} H/s`
}

function formatHashes(value: number) {
  return Math.max(0, Math.trunc(value)).toLocaleString('es-MX')
}

function formatDuration(value: number | null | undefined) {
  const seconds = Number(value || 0)
  if (!Number.isFinite(seconds) || seconds <= 0) return 'calculando...'
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} s`
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`
  return `${(seconds / 3600).toFixed(1)} h`
}

function formatLastShare(lastHash: number) {
  if (!lastHash) return 'Sin dato reciente'
  const seconds = Math.max(0, Math.round((Date.now() - lastHash * 1000) / 1000))
  if (seconds < 60) return `Hace ${seconds} s`
  if (seconds < 3600) return `Hace ${Math.round(seconds / 60)} min`
  return `Hace ${(seconds / 3600).toFixed(1)} h`
}

export function MiningStatsWidget({ wallet, fundingGoal, projectTitle, projectId, selectedMiningOption = null }: MiningStatsWidgetProps) {
  const { xmrPrice } = useMoneroPrice()
  const [stats, setStats] = useState<MiningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchMiningStats = async () => {
    setError(null)
    try {
      const encodedWallet = encodeURIComponent(wallet)
      const urls = projectId
        ? [`${resolveMiningApiBase()}/project-stats/${encodeURIComponent(projectId)}/${encodedWallet}`]
        : [
            `${resolveMiningApiBase()}/pool-stats/${encodedWallet}`,
            `https://www.supportxmr.com/api/miner/${encodedWallet}/stats`,
          ]

      for (const url of urls) {
        try {
          const response = await fetch(url, { headers: { Accept: 'application/json' } })
          if (!response.ok) continue
          setStats(normalizeSupportXMRStats(await response.json()))
          setLastUpdate(new Date())
          return
        } catch {
          continue
        }
      }

      setStats((current) => current ?? createEmptyProjectStats())
      setError('No fue posible consultar SupportXMR en este momento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchMiningStats()
    const interval = window.setInterval(() => void fetchMiningStats(), 10_000)
    return () => window.clearInterval(interval)
  }, [wallet, projectId])

  if (loading && !stats) {
    return (
      <div className="nova-card space-y-3 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Zap className="h-5 w-5 text-purple-600" />
            Minería comunitaria
          </h3>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
        </div>
        <p className="text-sm text-slate-600">Consultando los datos del wallet en SupportXMR...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="nova-card space-y-4 border-2 border-amber-200 bg-amber-50 p-5">
        <h3 className="flex items-center gap-2 font-bold text-amber-950">
          <Zap className="h-5 w-5" />
          Minería comunitaria
        </h3>
        <p className="text-sm leading-6 text-amber-900">No fue posible leer SupportXMR. La minería puede continuar mientras se restablece la consulta.</p>
        <button onClick={() => void fetchMiningStats()} className="text-sm font-bold text-amber-900 hover:underline">Reintentar</button>
      </div>
    )
  }

  const projectValidShares = Number(stats.confirmedValidShares ?? 0)
  const projectInvalidShares = Number(stats.confirmedInvalidShares ?? 0)
  const poolConfirmed = Boolean(stats.poolDataConfirmed ?? stats.isPoolConfirmed)
  const poolPending = Number(stats.poolPendingBalance ?? stats.balance ?? 0)
  const poolPaid = Number(stats.poolTotalPaid ?? stats.totalPaid ?? 0)
  const poolHashrate = Number(stats.poolHashrate ?? stats.hashrate ?? 0)
  const poolTotalHashes = Number(stats.poolTotalHashes ?? stats.totalHashes ?? 0)
  const poolValidShares = Number(stats.poolValidShares ?? stats.confirmedValidShares ?? 0)
  const poolInvalidShares = Number(stats.poolInvalidShares ?? stats.confirmedInvalidShares ?? 0)
  const poolWorkers = Array.isArray(stats.poolWorkers) ? stats.poolWorkers : []
  const poolWorkerCount = Number(stats.poolWorkerCount ?? poolWorkers.length)
  const poolLastHash = Number(stats.poolLastHash ?? stats.lastHash ?? 0)
  const walletObservedTotal = poolPending + poolPaid
  const progressPercent = fundingGoal > 0 ? Math.min((walletObservedTotal / fundingGoal) * 100, 100) : 0
  const remaining = Math.max(fundingGoal - walletObservedTotal, 0)
  const usdValue = xmrPrice === null ? null : walletObservedTotal * xmrPrice
  const localMiners = Number(stats.localMiners ?? 0)
  const localBrowserMiners = Number(stats.localBrowserMiners ?? 0)
  const localNativeMiners = Number(stats.localNativeMiners ?? 0)
  const localBrowserHashrate = Number(stats.localBrowserHashrate ?? 0)
  const localNativeHashrate = Number(stats.localNativeHashrate ?? 0)
  const communityHashrate = localBrowserHashrate + localNativeHashrate
  const localActive = Boolean(stats.isLocalActive || localMiners > 0)
  const miningSelected = selectedMiningOption !== null || Boolean(stats.browserMiningSelected || stats.miningIntent)
  const supportXmrUrl = `https://www.supportxmr.com/?addr=${encodeURIComponent(wallet)}`

  return (
    <section className="nova-card space-y-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-5 shadow-[0_22px_55px_-36px_rgba(88,28,135,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-purple-600">SupportXMR en vivo</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-black text-slate-950">
            <Zap className="h-5 w-5 text-purple-600" />
            Minería comunitaria
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Los valores del wallet coinciden con SupportXMR. La telemetría web o app se informa por separado y no altera estos totales.
          </p>
        </div>
        <button
          onClick={() => void fetchMiningStats()}
          className="shrink-0 rounded-xl border border-purple-100 bg-white p-2.5 text-slate-500 transition hover:border-purple-300 hover:text-purple-700"
          title="Actualizar desde SupportXMR"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${poolConfirmed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
        <Radio className="h-3.5 w-3.5" />
        {poolConfirmed ? 'Datos confirmados por el pool' : 'Esperando respuesta del pool'}
      </div>

      <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-lg shadow-slate-900/10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">XMR pendiente</p>
            <p className="mt-1 text-2xl font-black tabular-nums">{formatXmr(poolPending)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">XMR pagado</p>
            <p className="mt-1 font-bold tabular-nums">{formatXmr(poolPaid)}</p>
          </div>
        </div>
        <p className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">Último share: {formatLastShare(poolLastHash)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <Activity className="h-4 w-4 text-orange-500" />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Tu hashrate</p>
          <p className="mt-1 text-lg font-black text-slate-950">{formatHashrate(poolHashrate)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <Target className="h-4 w-4 text-blue-600" />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Total hashes</p>
          <p className="mt-1 text-lg font-black text-slate-950">{formatHashes(poolTotalHashes)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <Zap className="h-4 w-4 text-emerald-600" />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Shares</p>
          <p className="mt-1 text-lg font-black text-slate-950">{formatHashes(poolValidShares)} / {formatHashes(poolInvalidShares)}</p>
          <p className="mt-1 text-[11px] text-slate-500">válidos / inválidos</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <Cpu className="h-4 w-4 text-purple-600" />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Workers</p>
          <p className="mt-1 text-lg font-black text-slate-950">{poolWorkerCount}</p>
          <p className="mt-1 truncate text-[11px] text-slate-500" title={poolWorkers.join(', ')}>{poolWorkers.length ? poolWorkers.join(', ') : 'Sin identificador'}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-black text-slate-950">{formatXmr(walletObservedTotal)} XMR</span>
          <span className="text-xs text-slate-600">de {fundingGoal.toFixed(2)} XMR</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between gap-3 text-[11px] text-slate-600">
          <span>{usdValue === null ? 'USD no disponible' : `$${usdValue.toFixed(4)} USD`}</span>
          <span>Falta {remaining.toFixed(6)} XMR</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Actividad atribuida desde la vinculación</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-slate-500">Hashes</p><p className="font-black text-slate-950">{formatHashes(stats.totalHashes)}</p></div>
          <div><p className="text-slate-500">Shares</p><p className="font-black text-slate-950">{formatHashes(projectValidShares)} / {formatHashes(projectInvalidShares)}</p></div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-slate-500">Este diferencial conserva la línea base del proyecto. El panel superior siempre muestra los totales completos del pool.</p>
      </div>

      <div className={`rounded-2xl border p-4 ${localActive || miningSelected ? 'border-cyan-200 bg-cyan-50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">Telemetría local sin acreditar</p>
            <p className="mt-1 text-xl font-black text-slate-950">{formatHashrate(communityHashrate)}</p>
          </div>
          <Cpu className="h-5 w-5 text-cyan-700" />
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">{localMiners} equipo(s): {localBrowserMiners} web / {localNativeMiners} app. No equivale a XMR.</p>
        {stats.nonceCoordinationActive && communityHashrate > 0 ? (
          <p className="mt-2 border-t border-cyan-200 pt-2 text-xs leading-5 text-cyan-900">
            Nonces coordinados. Tiempo estadístico medio por share: {formatDuration(stats.expectedShareSeconds)}; 95% de probabilidad en {formatDuration(stats.shareProbability95Seconds)}.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-900"><WalletCards className="h-4 w-4 text-purple-600" /> Wallet del proyecto</div>
        <code className="mt-2 block break-all rounded-lg bg-slate-50 p-2 font-mono text-[10px]">{wallet}</code>
        <a href={supportXmrUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline">
          Abrir esta dirección en SupportXMR <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {error ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>{projectTitle}</span>
        <span>{lastUpdate ? `Actualizado ${lastUpdate.toLocaleTimeString('es-MX')}` : 'Sin actualizar'}</span>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-black text-emerald-950">Cómo funciona</p>
        <p className="mt-2 text-xs leading-5 text-emerald-900">SupportXMR acredita shares y paga XMR directamente al wallet del investigador. PROYECTA muestra los datos del pool y la telemetría local, pero no custodia fondos.</p>
      </div>
    </section>
  )
}
