import { useState } from 'react'
import { Square, Zap, AlertCircle, CheckCircle2, Download } from 'lucide-react'
import { useValidateMoneroAddress } from '../hooks/useMoneroMining'
import { useRandomXMining } from '../hooks/useRandomXMining'
import { useSupportXMRStats } from '../hooks/useSupportXMRMining'
import { MiningOptionsModal } from './MiningOptionsModal'

interface ProjectMiningWidgetProps {
  projectMoneroAddress: string
  projectTitle: string
  projectId?: string
}

export function ProjectMiningWidget({ projectMoneroAddress, projectTitle }: ProjectMiningWidgetProps) {
  const [miningMode, setMiningMode] = useState<'browser' | 'app' | null>(null)
  const [showOptionsModal, setShowOptionsModal] = useState(true)
  const [miningEnabled, setMiningEnabled] = useState(false)
  const [cpuPercentage, setCpuPercentage] = useState(50)

  const isValidAddress = useValidateMoneroAddress(projectMoneroAddress)

  const { stats, error: miningError, poolUrl } = useRandomXMining(
    projectMoneroAddress,
    miningEnabled && isValidAddress && miningMode === 'browser',
    cpuPercentage
  )

  const { poolStats } = useSupportXMRStats(projectMoneroAddress)

  if (!isValidAddress) {
    return (
      <div className="nova-card p-6 bg-amber-50 border border-amber-200">
        <p className="text-amber-800 text-sm">
          ⚠️ Este proyecto no tiene una dirección Monero válida, por lo que no se puede minar.
          Edita el proyecto y vincula tu wallet real para habilitar minería verificable.
        </p>
      </div>
    )
  }

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

  return (
    <>
      <MiningOptionsModal
        isOpen={showOptionsModal && !miningMode}
        onClose={() => setShowOptionsModal(false)}
        projectWallet={projectMoneroAddress}
        onSelectOption={handleSelectOption}
      />

      <div className="nova-card p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">⚙️ Minar para este proyecto</h3>
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
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 text-center space-y-3">
            <p className="text-slate-700">
              👆 Arriba aparecen opciones de minería. Elige cómo contribuir.
            </p>
          </div>
        )}

        {miningMode === 'browser' && (
          <>
            {miningEnabled ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-600 uppercase">Hashes</p>
                    <p className="text-2xl font-black text-blue-600 mt-2">
                      {stats.totalHashes.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-600 uppercase">H/s</p>
                    <p className="text-2xl font-black text-purple-600 mt-2">{stats.hashRate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-bold text-slate-600 uppercase">Tiempo</p>
                    <p className="text-2xl font-black text-emerald-600 mt-2">
                      {formatTime(stats.elapsedSeconds)}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-slate-700">Shares aceptados por el pool</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">{stats.acceptedShares}</span>
                </div>

                <div className="bg-white rounded-lg p-3 text-xs">
                  <p className="font-bold text-slate-600 mb-1">Minando para:</p>
                  <code className="break-all font-mono text-slate-700">{projectMoneroAddress}</code>
                </div>

                <button
                  onClick={() => setMiningEnabled(false)}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600"
                >
                  <Square className="h-5 w-5" />
                  Detener minería
                </button>
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg p-4 space-y-2 text-sm border-l-4 border-blue-600">
                  <p className="font-bold text-blue-900">💻 Opción A: Minería en navegador</p>
                  <p className="text-slate-700">✅ RandomX real en WASM</p>
                  <p className="text-slate-700">✅ Multi-hilo (todos tus núcleos)</p>
                  <p className="text-slate-600 text-xs mt-2">
                    ⚠️ ~20–60 H/s (participación simbólica)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700">Intensidad de CPU</label>
                  <div className="flex gap-2">
                    {[30, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setCpuPercentage(pct)}
                        className={`flex-1 py-2 rounded-lg font-bold transition ${
                          cpuPercentage === pct
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setMiningEnabled(true)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700"
                >
                  <Zap className="h-5 w-5" />
                  Comenzar a minar
                </button>
              </>
            )}

            <div
              className={`rounded-lg p-3 text-sm flex gap-2 transition-all ${
                stats.poolConnected
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                  : 'bg-blue-100 border border-blue-300 text-blue-800'
              }`}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">
                  {stats.poolConnected ? '✅ Pool conectado' : `🔄 ${stats.status}`}
                </p>
                <p className="text-xs font-mono">{poolUrl}</p>
              </div>
            </div>

            {poolStats && (
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
                <p>
                  <strong>Stats:</strong> {(poolStats.totalHashes || 0).toLocaleString()} hashes ·{' '}
                  {((poolStats.balance || 0) > 0 ? poolStats.balance.toFixed(12) : '0')} XMR
                </p>
              </div>
            )}

            {miningError && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-800 text-sm">
                ⚠️ {miningError}
              </div>
            )}
          </>
        )}

        {miningMode === 'app' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-300 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-purple-600" />
                <h4 className="text-lg font-bold text-purple-900">Opción B1: Minería profesional</h4>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <p>Descarga la app ligera Tauri + xmrig para minar en serio.</p>

                <div className="bg-white rounded-lg p-4 space-y-2 text-xs">
                  <p className="font-bold text-slate-900">⚡ Ventajas:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>100–200× más rápido (~2.000–10.000 H/s)</li>
                    <li>Sigue minando sin navegador abierto</li>
                    <li>Optimizado a nivel nativo</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-purple-200">
                <p className="text-xs font-bold text-slate-600">Compilar para tu SO (instrucciones):</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <a
                    href="https://github.com/PROYECTA/proyecta/blob/main/proyecta-desktop/QUICK_START.md#pasos-rápidos-windows"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Windows
                  </a>
                  <a
                    href="https://github.com/PROYECTA/proyecta/blob/main/proyecta-desktop/QUICK_START.md#pasos-rápidos-macos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    macOS
                  </a>
                  <a
                    href="https://github.com/PROYECTA/proyecta/blob/main/proyecta-desktop/QUICK_START.md#pasos-rápidos-linux"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Linux
                  </a>
                </div>
                <p className="text-xs text-slate-500 bg-blue-50 rounded p-2 border border-blue-200">
                  <strong>Próximamente:</strong> Los instaladores compilados estarán disponibles en GitHub Releases. Por ahora, descarga el código fuente y compila localmente en 2 comandos.
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 text-xs text-slate-600 space-y-1 border-l-4 border-purple-600">
                <p>
                  <strong>Dirección:</strong>{' '}
                  <code className="font-mono text-xs break-all">{projectMoneroAddress}</code>
                </p>
                <p>
                  <strong>Pool:</strong> SupportXMR
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowOptionsModal(true)}
              className="w-full px-6 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
            >
              ← Cambiar opción
            </button>
          </div>
        )}
      </div>
    </>
  )
}
