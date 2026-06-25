import { useState } from 'react'
import { Download, Zap, Monitor, X } from 'lucide-react'

interface MiningOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  projectWallet: string
  onSelectOption: (option: 'browser' | 'app') => void
}

export function MiningOptionsModal({
  isOpen,
  onClose,
  projectWallet,
  onSelectOption,
}: MiningOptionsModalProps) {
  const [selectedTab, setSelectedTab] = useState<'browser' | 'app' | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">¿Cómo quieres minar?</h2>
            <p className="text-sm opacity-90 mt-1">
              Elige el nivel de participación que te convenga
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Tabla de Comparación - PROMINENTE */}
          <div className="border-2 border-purple-300 rounded-xl p-8 bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">📊 Comparación rápida</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="border border-purple-300 p-4 text-left font-bold">Criterio</th>
                    <th className="border border-purple-300 p-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Navegador (A)
                      </div>
                    </th>
                    <th className="border border-purple-300 p-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5" />
                        App (B1)
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Instalación</td>
                    <td className="border border-purple-300 p-4 text-center bg-white">
                      <span className="text-lg">❌</span> Cero
                    </td>
                    <td className="border border-purple-300 p-4 text-center bg-white">
                      <span className="text-lg">✅</span> Una sola vez
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Hashrate</td>
                    <td className="border border-purple-300 p-4 text-center text-blue-700 font-bold">
                      ~20–60 H/s
                    </td>
                    <td className="border border-purple-300 p-4 text-center text-purple-700 font-bold">
                      ~2.000–10.000 H/s
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Velocidad relativa</td>
                    <td className="border border-purple-300 p-4 text-center bg-blue-50">
                      <span className="text-2xl font-black text-blue-600">1×</span>
                    </td>
                    <td className="border border-purple-300 p-4 text-center bg-purple-50">
                      <span className="text-2xl font-black text-purple-600">100–200×</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Recurso de CPU</td>
                    <td className="border border-purple-300 p-4 text-center">Configurable</td>
                    <td className="border border-purple-300 p-4 text-center">Dedicado</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Cierra navegador</td>
                    <td className="border border-purple-300 p-4 text-center">
                      <span className="text-lg">⛏️</span> Se detiene
                    </td>
                    <td className="border border-purple-300 p-4 text-center">
                      <span className="text-lg">✅</span> Sigue minando
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Interfaz</td>
                    <td className="border border-purple-300 p-4 text-center">PROYECTA web</td>
                    <td className="border border-purple-300 p-4 text-center">App + PROYECTA web</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Tiempo hasta minería real</td>
                    <td className="border border-purple-300 p-4 text-center">
                      <span className="font-bold text-green-600">Inmediato</span>
                    </td>
                    <td className="border border-purple-300 p-4 text-center">
                      <span className="font-bold text-green-600">~2 minutos</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recomendación */}
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-300 rounded-lg p-6">
            <p className="text-slate-700">
              <span className="font-bold text-emerald-900">💡 Recomendación:</span> Si tu PC está disponible más de 30 minutos al día,
              <span className="font-bold text-purple-600"> la Opción B1 recauda 100× más</span> para el proyecto sin instalar nada complicado.
            </p>
          </div>

          {/* Opciones detalladas */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">📋 Detalles de cada opción</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opción A: Navegador */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                  selectedTab === 'browser'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
                onClick={() => setSelectedTab('browser')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="h-8 w-8 text-blue-600" />
                  <h3 className="text-lg font-bold">Opción A: Navegador</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-blue-900">Para participación simbólica</p>
                  <p className="text-xs text-gray-600">Ideal si quieres aportar sin instalar nada</p>

                  <ul className="space-y-2 text-sm mt-4">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Sin instalar nada</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Hashrate: ~20–60 H/s</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">⚠</span>
                      <span>Participación simbólica</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Opción B1: App */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                  selectedTab === 'app'
                    ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
                onClick={() => setSelectedTab('app')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                  <h3 className="text-lg font-bold">Opción B1: App</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-purple-900">Para recaudación real</p>
                  <p className="text-xs text-gray-600">Si quieres donar cómputo en serio</p>

                  <ul className="space-y-2 text-sm mt-4">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Minería nativa real</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Hashrate: ~2.000–10.000+ H/s</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>100× más potente</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            {selectedTab === 'browser' && (
              <button
                onClick={() => {
                  onSelectOption('browser')
                  onClose()
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Monitor className="h-5 w-5" />
                Minar en navegador
              </button>
            )}
            {selectedTab === 'app' && (
              <button
                onClick={() => {
                  onSelectOption('app')
                  onClose()
                }}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Descargar app profesional
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
