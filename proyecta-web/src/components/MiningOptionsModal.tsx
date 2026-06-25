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
            <h2 className="text-3xl font-bold">⛏️ Aporta cómputo para esta investigación</h2>
            <p className="text-sm opacity-90 mt-1">
              Tu poder de procesamiento se convierte directamente en XMR para el proyecto. Elige tu nivel de participación.
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Explicación clara del modelo */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 space-y-3">
            <p className="font-bold text-blue-900">🤝 ¿Cómo funciona?</p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li><strong>1.</strong> Activas minería en tu navegador o descarga la app</li>
              <li><strong>2.</strong> Tu computadora calcula hashes RandomX (prueba de trabajo real)</li>
              <li><strong>3.</strong> Los XMR que genera se envían DIRECTAMENTE a la billetera del proyecto</li>
              <li><strong>4.</strong> PROYECTA nunca toca los fondos — es 100% no custodial</li>
            </ul>
          </div>

          {/* Tabla de Comparación - PROMINENTE */}
          <div className="border-2 border-purple-300 rounded-xl p-8 bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">📊 Comparación: tu aporte</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="border border-purple-300 p-4 text-left font-bold">Aspecto</th>
                    <th className="border border-purple-300 p-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Navegador (Prueba)
                      </div>
                    </th>
                    <th className="border border-purple-300 p-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5" />
                        App Nativa (Real)
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Configuración</td>
                    <td className="border border-purple-300 p-4 text-center bg-white">
                      <span className="text-lg">⚡</span> Sin instalar
                    </td>
                    <td className="border border-purple-300 p-4 text-center bg-white">
                      <span className="text-lg">⬇️</span> Un descarga
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Potencia (H/s)</td>
                    <td className="border border-purple-300 p-4 text-center text-blue-700 font-bold">
                      20–60 H/s
                    </td>
                    <td className="border border-purple-300 p-4 text-center text-purple-700 font-bold">
                      2.000–10.000 H/s
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Multiplicador</td>
                    <td className="border border-purple-300 p-4 text-center bg-blue-50">
                      <span className="text-xl font-black text-blue-600">1×</span>
                    </td>
                    <td className="border border-purple-300 p-4 text-center bg-purple-50">
                      <span className="text-xl font-black text-purple-600">50–500×</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">CPU dedicado</td>
                    <td className="border border-purple-300 p-4 text-center">Flexible (compartes)</td>
                    <td className="border border-purple-300 p-4 text-center">Total (tú decides)</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Cierra navegador</td>
                    <td className="border border-purple-300 p-4 text-center">
                      ⏸️ Se pausa
                    </td>
                    <td className="border border-purple-300 p-4 text-center">
                      ✅ Continúa en segundo plano
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Inicio minería</td>
                    <td className="border border-purple-300 p-4 text-center text-green-600 font-bold">
                      Inmediato
                    </td>
                    <td className="border border-purple-300 p-4 text-center text-green-600 font-bold">
                      ~2 minutos
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recomendación estratégica */}
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-300 rounded-lg p-6 space-y-3">
            <p className="font-bold text-emerald-900">💡 Nuestro consejo</p>
            <p className="text-slate-700">
              Si tu PC estará disponible <strong>más de 1 hora al día</strong>, la <strong>App Nativa</strong> recauda <strong>50–500× más</strong> XMR. Solo se descarga una vez y trabaja mientras usas la computadora normalmente.
            </p>
            <p className="text-sm text-emerald-800">
              El navegador es perfecto para probar, pero la app es donde ocurre el verdadero financiamiento de la investigación.
            </p>
          </div>

          {/* Opciones detalladas */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">📋 Elige tu forma de aportar</h3>
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
                  <h3 className="text-lg font-bold">Navegador</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-blue-900">Prueba rápida y sin compromiso</p>
                  <p className="text-xs text-gray-600">Perfecto para entender cómo funciona PROYECTA</p>

                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Empieza en segundos</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Funciona dentro de esta página</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-orange-600 font-bold flex-shrink-0">⚠</span>
                      <span>Aporte simbólico (20–60 H/s)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-orange-600 font-bold flex-shrink-0">⚠</span>
                      <span>Se detiene si cierras el navegador</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opción B1: App */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition relative ${
                  selectedTab === 'app'
                    ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
                onClick={() => setSelectedTab('app')}
              >
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  RECOMENDADO
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                  <h3 className="text-lg font-bold">App Nativa</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-purple-900">Financiamiento real para investigación</p>
                  <p className="text-xs text-gray-600">El corazón de la red PROYECTA</p>

                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Minería nativa + profesional</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>50–500× más poder (2.000–10.000+ H/s)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Funciona en segundo plano</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                      <span>Controla CPU al 100% desde tu PC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad y transparencia */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6">
            <p className="font-bold text-amber-900 mb-2">🔒 Transparencia total</p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>✓ El código de PROYECTA es abierto (open source)</li>
              <li>✓ Los XMR van DIRECTO a la billetera del proyecto — PROYECTA nunca los toca</li>
              <li>✓ Puedes ver en tiempo real en cualquier explorador de Monero</li>
              <li>✓ No hay intermediarios — dinero directo a investigación</li>
            </ul>
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
                Probar en navegador
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
                Descargar app nativa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
