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
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">¿Cómo quieres minar?</h2>
            <p className="text-sm opacity-90 mt-1">
              Elige el nivel de participación que te convenga
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción A: Navegador */}
            <div
              className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                selectedTab === 'browser'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-gray-50'
              }`}
              onClick={() => setSelectedTab('browser')}
            >
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-bold">Opción A: Navegador</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded text-sm">
                  <p className="font-bold text-blue-900">Para participación simbólica</p>
                  <p className="text-gray-600 mt-1">Ideal si quieres aportar sin instalar nada</p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">
                      <strong>Sin instalar nada</strong> — funciona directamente en el navegador
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">
                      <strong>Hashrate:</strong> ~20–60 H/s (multi-hilo, todos tus núcleos)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">
                      <strong>RandomX real,</strong> verificado contra Monero oficial
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">⚠</span>
                    <span className="text-gray-700">
                      <strong>Participación simbólica</strong> — para demostración y prueba de concepto
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">⚠</span>
                    <span className="text-gray-700">
                      <strong>Lento</strong> — ~50–200× menos que minería nativa real
                    </span>
                  </li>
                </ul>

                <div className="bg-blue-100 border border-blue-300 rounded p-3 text-xs text-blue-900">
                  <p className="font-bold mb-1">Cuándo elegir esto:</p>
                  <p>Quieres contribuir sin complicaciones. La prueba de concepto RandomX es real.</p>
                </div>
              </div>
            </div>

            {/* Opción B1: App Tauri + xmrig */}
            <div
              className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                selectedTab === 'app'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 bg-gray-50'
              }`}
              onClick={() => setSelectedTab('app')}
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
                <h3 className="text-xl font-bold">Opción B1: App profesional</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded text-sm">
                  <p className="font-bold text-purple-900">Para recaudación real</p>
                  <p className="text-gray-600 mt-1">Si quieres donar cómputo en serio</p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">
                      <strong>Minería nativa real</strong> — xmrig compilado y optimizado
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">
                      <strong>Hashrate:</strong> ~2.000–10.000+ H/s (depende de tu CPU)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">
                      <strong>100× más potente</strong> que el navegador
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">
                      <strong>Interfaz gráfica</strong> integrada con PROYECTA
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">⚠</span>
                    <span className="text-gray-700">
                      <strong>Instalar una vez</strong> (~50 MB) — app de escritorio ligera
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">⚠</span>
                    <span className="text-gray-700">
                      <strong>Requiere que dejes corriendo</strong> la app en tu PC
                    </span>
                  </li>
                </ul>

                <div className="bg-purple-100 border border-purple-300 rounded p-3 text-xs text-purple-900">
                  <p className="font-bold mb-1">Cuándo elegir esto:</p>
                  <p>Quieres recaudar XMR real para el proyecto. Tu PC está encendido y disponible.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-bold mb-4">Comparación rápida</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-bold">Criterio</th>
                    <th className="border border-gray-300 p-3 text-center font-bold">Navegador (A)</th>
                    <th className="border border-gray-300 p-3 text-center font-bold">App (B1)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Instalación</td>
                    <td className="border border-gray-300 p-3 text-center">❌ Cero</td>
                    <td className="border border-gray-300 p-3 text-center">✅ Una sola vez</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Hashrate</td>
                    <td className="border border-gray-300 p-3 text-center">~20–60 H/s</td>
                    <td className="border border-gray-300 p-3 text-center">~2.000–10.000 H/s</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Velocidad relativa</td>
                    <td className="border border-gray-300 p-3 text-center">1×</td>
                    <td className="border border-gray-300 p-3 text-center">100–200×</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Recurso de CPU</td>
                    <td className="border border-gray-300 p-3 text-center">Configurable</td>
                    <td className="border border-gray-300 p-3 text-center">Dedicado</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Cierra el navegador</td>
                    <td className="border border-gray-300 p-3 text-center">⛏️ Se detiene</td>
                    <td className="border border-gray-300 p-3 text-center">✅ Sigue minando</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Interfaz</td>
                    <td className="border border-gray-300 p-3 text-center">PROYECTA web</td>
                    <td className="border border-gray-300 p-3 text-center">App + PROYECTA web</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                Minar en el navegador
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
