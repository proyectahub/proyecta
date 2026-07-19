import { useState } from 'react'
import { Square, Zap, AlertCircle, CheckCircle2, Download } from 'lucide-react'
import { isValidProjectWalletAddress } from '../utils/projectWallet'
import { useRandomXMining } from '../hooks/useRandomXMining'
import { useSupportXMRStats } from '../hooks/useSupportXMRMining'
import { MiningOptionsModal } from './MiningOptionsModal'

interface ProjectMiningWidgetProps {
  projectMoneroAddress: string
  projectTitle: string
  projectId?: string
  initialMiningMode?: 'browser' | 'app' | null
}

function hasVisibleCommunityState(poolStats: any) {
  if (!poolStats) return false
  return Boolean(poolStats.visibleBalance || poolStats.confirmedBalance || poolStats.localBalance || poolStats.isLocalActive || poolStats.isPoolConfirmed)
}

function formatAmount(value: unknown) {
  const numeric = Number(value || 0)
  return Number.isFinite(numeric) ? numeric.toFixed(4) : '0.0000'
}

export function ProjectMiningWidget({ projectMoneroAddress, projectTitle, projectId, initialMiningMode = null }: ProjectMiningWidgetProps) {
  const [miningMode, setMiningMode] = useState<'browser' | 'app' | null>(initialMiningMode)
  const [showOptionsModal, setShowOptionsModal] = useState(!initialMiningMode)
  const [miningEnabled, setMiningEnabled] = useState(false)
  const [cpuPercentage, setCpuPercentage] = useState(50)

  const isValidAddress = isValidProjectWalletAddress(projectMoneroAddress)

  const { stats, error: miningError, poolUrl } = useRandomXMining(
    projectMoneroAddress,
    miningEnabled && isValidAddress && miningMode === 'browser',
    cpuPercentage,
    projectId,
  )

  const { poolStats } = useSupportXMRStats(projectMoneroAddress, projectId)
  const localActive = Boolean(poolStats?.isLocalActive)
  const poolConfirmed = Boolean(poolStats?.isPoolConfirmed)
  const visibleBalance = Number(poolStats?.confirmedBalance ?? 0)
  const visibleHashes = Number(poolStats?.confirmedTotalHashes ?? 0)
  const confirmedValidShares = Number(poolStats?.confirmedValidShares ?? poolStats?.validShares ?? 0)
  const displayedAcceptedShares = Math.max(stats.acceptedShares, confirmedValidShares)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  const handleSelectOption = (option: 'browser' | 'app') => {
    setMiningMode(option)
    setShowOptionsModal(false)
  }

  if (!isValidAddress) {
    return (
      <div className="nova-card border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm text-amber-800">
          Este proyecto no tiene una dirección Monero válida, por lo que no se puede minar.
          Edita el proyecto y vincula una wallet válida para habilitar la minería verificable.
        </p>
      </div>
    )
  }

  const communityLabel = poolConfirmed && localActive
    ? 'Pool confirmado + telemetría local'
    : poolConfirmed
      ? 'Pool confirmado'
      : localActive
        ? 'Telemetría local sin acreditar'
        : 'Esperando confirmación del pool'

  return (
    <>
      <MiningOptionsModal
        isOpen={showOptionsModal && !miningMode}
        onClose={() => setShowOptionsModal(false)}
        onSelectOption={handleSelectOption}
      />

      <div className="nova-card space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">⛏️ Minar para este proyecto</h3>
          <p className="text-slate-600">
            Dona tu poder de cómputo a <span className="font-bold">{projectTitle}</span>
          </p>
          {miningMode && (
            <button
              onClick={() => setShowOptionsModal(true)}
              className="text-xs text-blue-600 underline hover:text-blue-700"
            >
              Cambiar opción de minería
            </button>
          )}
        </div>

        {!miningMode && (
          <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 text-center text-sm text-slate-700">
            Elige una forma de aporte para comenzar.
          </div>
        )}

        {miningMode === 'browser' && (
          <>
            {miningEnabled ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-600">Hashes</p>
                    <p className="mt-2 text-2xl font-black text-blue-600">{stats.totalHashes.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-600">H/s</p>
                    <p className="mt-2 text-2xl font-black text-purple-600">{stats.hashRate}</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-600">Tiempo</p>
                    <p className="mt-2 text-2xl font-black text-emerald-600">{formatTime(stats.elapsedSeconds)}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-slate-700">Shares aceptados por el pool</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600">{displayedAcceptedShares.toLocaleString('es-ES')}</span>
                  </div>
                </div>

                <div className={`rounded-lg border p-3 text-sm ${poolConfirmed ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : localActive ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="font-bold">{communityLabel}</p>
                  </div>
                  <p className="mt-1 text-xs leading-6">
                    {poolConfirmed && localActive
                      ? 'SupportXMR ya confirmó la dirección. La actividad local se muestra aparte y no incrementa el saldo.'
                      : poolConfirmed
                        ? 'SupportXMR ya confirmó actividad para esta dirección.'
                        : localActive
                          ? 'El navegador sigue calculando RandomX. Los hashes locales no son XMR ni recaudación hasta que el pool los acredite.'
                          : 'El navegador puede iniciar una prueba local mientras llega la confirmación del pool.'}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3 text-xs">
                  <p className="font-bold text-slate-600 mb-1">Minando para:</p>
                  <code className="break-all font-mono text-slate-700">{projectMoneroAddress}</code>
                </div>

                <button
                  onClick={() => setMiningEnabled(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-3 font-bold text-white hover:bg-red-600"
                >
                  <Square className="h-5 w-5" />
                  Detener minería
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2 rounded-lg border-l-4 border-blue-600 bg-white p-6 text-sm">
                  <p className="font-bold text-blue-900">💻 Opción A: Minería en navegador</p>
                  <p className="text-slate-700">RandomX en WASM, útil para prueba local y aportes pequeños.</p>
                  <p className="text-xs text-slate-600">Aporte simbólico aproximado: 20-60 H/s.</p>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700">Intensidad de CPU</label>
                  <div className="flex gap-2">
                    {[30, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setCpuPercentage(pct)}
                        className={`flex-1 rounded-lg border py-2 font-bold transition ${
                          cpuPercentage === pct
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setMiningEnabled(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700"
                >
                  <Zap className="h-5 w-5" />
                  Comenzar a minar
                </button>
              </>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p className="font-bold text-slate-700">
                {stats.poolConnected ? 'Puente conectado' : miningEnabled ? 'Esperando reconexión del puente' : `Estado: ${stats.status}`}
              </p>
              <p className="mt-1 font-mono">{poolUrl}</p>
            </div>

            {hasVisibleCommunityState(poolStats) ? (
              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <p>
                  <strong>Confirmado por el pool:</strong> {formatAmount(visibleHashes / 1e6)}M hashes · {formatAmount(visibleBalance)} XMR
                </p>
                <p className="mt-1">
                  Telemetría local: {stats.hashRate.toFixed(2)} H/s · {stats.totalHashes.toLocaleString('es-ES')} hashes · {communityLabel}
                </p>
              </div>
            ) : null}

            {miningError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-bold">Estado de minería</p>
                <p className="mt-1">{miningError}</p>
              </div>
            ) : null}
          </>
        )}

        {miningMode === 'app' && (
          <div className="space-y-4">
            <div className="space-y-4 rounded-lg border border-purple-300 bg-gradient-to-r from-purple-100 to-purple-50 p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-purple-600" />
                <h4 className="text-lg font-bold text-purple-900">Opción B1: Minería profesional</h4>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  Minero de alto rendimiento sin instalar nada. Descarga el minero oficial automáticamente y mina para el proyecto.
                </p>

                <div className="space-y-2 rounded-lg bg-white p-4 text-xs">
                  <p className="font-bold text-slate-900">Ventajas:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>100-1000× más rápido (~2.000-4.000 H/s)</li>
                    <li>Un solo paso: descomprime y doble clic</li>
                    <li>RandomX nativo (AES-NI + huge pages)</li>
                    <li>Sigue minando sin navegador abierto</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2 border-t border-purple-200 pt-4">
                <p className="text-xs font-bold text-slate-600">Descarga el minero para tu sistema:</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <a
                    href="https://github.com/proyectahub/proyecta/releases/latest/download/PROYECTA-Miner.exe"
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Windows
                  </a>
                  <a
                    href="https://github.com/proyectahub/proyecta/releases/latest/download/PROYECTA-Miner-macOS.command"
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4" />
                    macOS
                  </a>
                  <a
                    href="https://github.com/proyectahub/proyecta/releases/latest/download/PROYECTA-Miner-Linux.sh"
                    className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700"
                  >
                    <Download className="h-4 w-4" />
                    Linux
                  </a>
                </div>
                <div className="space-y-1 rounded border border-blue-200 bg-blue-50 p-3 text-xs text-slate-600">
                  <p className="font-bold">Cómo usar:</p>
                  <ol className="list-inside list-decimal space-y-0.5">
                    <li><strong>Windows:</strong> doble clic en <code className="font-mono">PROYECTA-Miner.exe</code></li>
                    <li>
                      <strong>macOS:</strong> en Terminal: <code className="font-mono">chmod +x PROYECTA-Miner-macOS.command</code> y luego doble clic (o{' '}
                      <code className="font-mono">./PROYECTA-Miner-macOS.command</code>)
                    </li>
                    <li><strong>Linux:</strong> <code className="font-mono">chmod +x PROYECTA-Miner-Linux.sh && ./PROYECTA-Miner-Linux.sh</code></li>
                  </ol>
                  <p className="pt-1 text-slate-500">Descarga el minero oficial automáticamente y empieza a minar. Sin instalar nada más.</p>
                </div>
                <div className="space-y-1 rounded border border-amber-300 p-3 text-xs" style={{ backgroundColor: '#FFFBEB', borderColor: '#FCD34D', color: '#92400E' }}>
                  <p className="font-bold">Aviso: tu antivirus puede marcarlo</p>
                  <p>
                    El motor de minado es <strong>software libre y de código abierto, no un virus</strong>. Algunos antivirus marcan cualquier minero por precaución. Si te lo bloquea, permítelo o agrégalo a excepciones.
                  </p>
                </div>
              </div>

              <div className="space-y-1 rounded-lg border border-purple-600 bg-white p-3 text-xs text-slate-600">
                <p>
                  <strong>Dirección:</strong> <code className="break-all font-mono text-xs">{projectMoneroAddress}</code>
                </p>
                <p><strong>Pool:</strong> SupportXMR</p>
              </div>
            </div>

            <button
              onClick={() => setShowOptionsModal(true)}
              className="w-full rounded-lg border border-slate-300 px-6 py-2 font-bold text-slate-700 hover:bg-slate-50"
            >
              ← Cambiar opción
            </button>
          </div>
        )}
      </div>
    </>
  )
}
