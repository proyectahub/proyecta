import { Square, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMining } from '../context/MiningContext'

export function PersistentMiningIndicator() {
  const { session, stats, isEngineOwner, stopMining } = useMining()
  if (!session) return null

  const stateLabel = isEngineOwner
    ? (stats.poolConnected ? 'Minería web activa' : 'Reconectando con SupportXMR')
    : 'Minería activa en otra pestaña'

  return (
    <aside className="fixed bottom-4 left-4 z-50 w-[min(92vw,390px)] rounded-2xl border border-cyan-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
          <Zap className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{stateLabel}</p>
          <Link to={`/projects/${session.projectId}`} className="mt-1 block truncate font-bold text-slate-900 hover:text-cyan-700">
            {session.projectTitle}
          </Link>
          <p className="mt-1 text-xs text-slate-600">
            {stats.hashRate.toFixed(1)} H/s · {stats.totalHashes.toLocaleString('es-ES')} hashes · {session.cpuPercentage}% CPU
          </p>
        </div>
        <button
          type="button"
          onClick={stopMining}
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
          title="Detener minería web"
        >
          <Square className="h-3.5 w-3.5" />
          Detener
        </button>
      </div>
    </aside>
  )
}
