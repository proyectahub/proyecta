import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 2147483647 }}
    >
      <div
        className="absolute inset-0 bg-black/65"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div>
            <h2 className="text-3xl font-bold">⛏️ Aporta cómputo para esta investigación</h2>
            <p className="mt-1 text-sm opacity-90">
              Tu poder de procesamiento se convierte directamente en XMR para el proyecto. Elige tu nivel de participación.
            </p>
          </div>
          <button onClick={onClose} className="rounded p-2 hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-8 space-y-8">
          <div className="space-y-3 rounded-lg border-2 border-blue-300 bg-blue-50 p-6">
            <p className="font-bold text-blue-900">⛏️ Tu aporte es cómputo = XMR para investigación</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>1.</strong> Activas minería en tu navegador o descargas la app</li>
              <li><strong>2.</strong> Tu CPU calcula hashes RandomX (es la forma de generar XMR)</li>
              <li><strong>3.</strong> Los XMR se envían automáticamente a la dirección del investigador</li>
              <li><strong>4.</strong> PROYECTA no custodia nada: 100% directo a la blockchain</li>
            </ul>
          </div>

          <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">📊 Comparación: tu aporte</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="border border-purple-300 p-4 text-left font-bold">Aspecto</th>
                    <th className="border border-purple-300 p-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Navegador (prueba)
                      </div>
                    </th>
                    <th className="border border-purple-300 p-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5" />
                        App nativa (real)
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
                      <span className="text-lg">⬇️</span> Una descarga
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Potencia (H/s)</td>
                    <td className="border border-purple-300 p-4 text-center font-bold text-blue-700">20-60 H/s</td>
                    <td className="border border-purple-300 p-4 text-center font-bold text-purple-700">2.000-10.000 H/s</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Multiplicador</td>
                    <td className="border border-purple-300 p-4 text-center bg-blue-50">
                      <span className="text-xl font-black text-blue-600">1×</span>
                    </td>
                    <td className="border border-purple-300 p-4 text-center bg-purple-50">
                      <span className="text-xl font-black text-purple-600">50-500×</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">CPU dedicado</td>
                    <td className="border border-purple-300 p-4 text-center">Flexible (compartes)</td>
                    <td className="border border-purple-300 p-4 text-center">Total (tú decides)</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Cierra navegador</td>
                    <td className="border border-purple-300 p-4 text-center">⏸️ Se pausa</td>
                    <td className="border border-purple-300 p-4 text-center">✅ Continúa en segundo plano</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Inicio minería</td>
                    <td className="border border-purple-300 p-4 text-center text-green-600 font-bold">Inmediato</td>
                    <td className="border border-purple-300 p-4 text-center text-green-600 font-bold">~2 minutos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 space-y-3">
            <p className="font-bold text-emerald-900">💡 Nuestro consejo</p>
            <p className="text-slate-700">
              Si tu PC estará disponible <strong>más de 1 hora al día</strong>, la <strong>App nativa</strong> recauda <strong>50-500× más</strong> XMR. Solo se descarga una vez y trabaja mientras usas la computadora normalmente.
            </p>
            <p className="text-sm text-emerald-800">
              El navegador es perfecto para probar, pero la app es donde ocurre el verdadero financiamiento de la investigación.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">📋 Elige tu forma de aportar</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                className={`cursor-pointer rounded-lg border-2 p-6 transition ${
                  selectedTab === 'browser'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setSelectedTab('browser')}
              >
                <div className="mb-4 flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-blue-600" />
                  <h3 className="text-lg font-bold">Navegador</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-blue-900">Prueba rápida y sin compromiso</p>
                  <p className="text-xs text-gray-600">Perfecto para entender cómo funciona PROYECTA</p>
                  <div className="space-y-2 border-t pt-3 text-sm">
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-green-600">✓</span><span>Empieza en segundos</span></div>
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-green-600">✓</span><span>Funciona dentro de esta página</span></div>
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-orange-600">⚠</span><span>Aporte simbólico (20-60 H/s)</span></div>
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-orange-600">⚠</span><span>Se detiene si cierras el navegador</span></div>
                  </div>
                </div>
              </div>

              <div
                className={`relative cursor-pointer rounded-lg border-2 p-6 transition ${
                  selectedTab === 'app'
                    ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
                onClick={() => setSelectedTab('app')}
              >
                <div className="absolute right-3 top-3 rounded-full bg-purple-600 px-2 py-1 text-xs font-bold text-white">
                  RECOMENDADO
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <Zap className="h-8 w-8 text-purple-600" />
                  <h3 className="text-lg font-bold">App nativa</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-purple-900">Financiamiento real para investigación</p>
                  <p className="text-xs text-gray-600">El corazón de la red PROYECTA</p>
                  <div className="space-y-2 border-t pt-3 text-sm">
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-green-600">✓</span><span>Minería nativa + profesional</span></div>
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-green-600">✓</span><span>50-500× más poder (2.000-10.000+ H/s)</span></div>
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-green-600">✓</span><span>Funciona en segundo plano</span></div>
                    <div className="flex gap-2"><span className="flex-shrink-0 font-bold text-green-600">✓</span><span>Controla CPU al 100% desde tu PC</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
            <p className="mb-2 font-bold text-amber-900">🔒 Transparencia total</p>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>✓ El código de PROYECTA es abierto (open source)</li>
              <li>✓ Los XMR van directo a la billetera del proyecto: PROYECTA nunca los toca</li>
              <li>✓ Puedes ver en tiempo real en cualquier explorador de Monero</li>
              <li>✓ No hay intermediarios: dinero directo a investigación</li>
            </ul>
          </div>

          <div className="flex gap-4 border-t pt-6">
            <button onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-100">
              Cancelar
            </button>
            {selectedTab === 'browser' && (
              <button
                onClick={() => {
                  onSelectOption('browser')
                  onClose()
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
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
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-bold text-white hover:bg-purple-700"
              >
                <Download className="h-5 w-5" />
                Descargar app
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
