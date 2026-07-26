import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, Zap, Monitor, ThermometerSun, X } from 'lucide-react'

interface MiningOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectOption: (option: 'browser' | 'app') => void
}

export function MiningOptionsModal({
  isOpen,
  onClose,
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
    <div className="fixed inset-0 flex items-end justify-center p-2 sm:items-center sm:p-4" style={{ zIndex: 2147483647 }}>
      <div className="absolute inset-0 bg-black/65" onClick={onClose} aria-hidden="true" />

      <div role="dialog" aria-modal="true" className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/10 sm:max-h-[90vh] sm:rounded-xl">
        <div className="z-10 flex shrink-0 items-start justify-between gap-3 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 text-white [&>div>h2]:text-xl [&>div>h2]:leading-tight [&>div>p]:text-xs [&>div>p]:leading-5 sm:items-center sm:p-6 sm:[&>div>h2]:text-3xl sm:[&>div>p]:text-sm">
          <div>
            <h2 className="text-3xl font-bold">⛏️ Aporta cómputo para esta investigación</h2>
            <p className="mt-1 text-sm opacity-90">
              Tu poder de procesamiento se convierte en XMR para el proyecto. Elige cómo quieres participar.
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar opciones de minería" className="shrink-0 rounded p-2 hover:bg-white/20">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 pb-6 sm:space-y-8 sm:p-8">
          <div className="space-y-3 rounded-lg border-2 border-blue-300 bg-blue-50 p-4 sm:p-6">
            <p className="font-bold text-blue-900">Tu aporte es cómputo = XMR para investigación</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>1.</strong> Activas minería en tu navegador o descargas la app</li>
              <li><strong>2.</strong> Tu CPU calcula hashes RandomX</li>
              <li><strong>3.</strong> Los XMR se envían a la dirección del investigador</li>
              <li><strong>4.</strong> PROYECTA no custodia nada: va directo a la blockchain</li>
            </ul>
          </div>

          <div className="sm:hidden rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950">
            <div className="flex items-start gap-3">
              <ThermometerSun className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
              <div className="space-y-2 text-sm leading-6">
                <p className="font-bold">Cuida tu celular durante la minería web</p>
                <p>La minería usa el procesador y puede calentar el equipo. Empieza con 30% o 50% de CPU, evita 100% y deja el teléfono en una superficie firme y ventilada.</p>
                <p className="font-semibold">Detén la minería si notas calor excesivo, batería baja o lentitud.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">📊 Comparación: tu aporte</h3>
            <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:px-0">
              <table className="min-w-[620px] border-collapse text-sm sm:min-w-full">
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
                        App nativa
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-purple-300 p-4 font-bold text-slate-900">Configuración</td>
                    <td className="border border-purple-300 p-4 text-center bg-white">Sin instalar</td>
                    <td className="border border-purple-300 p-4 text-center bg-white">Una descarga</td>
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
                    <td className="border border-purple-300 p-4 text-center">Se pausa</td>
                    <td className="border border-purple-300 p-4 text-center">Continúa en segundo plano</td>
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
            <p className="font-bold text-emerald-900">Nuestro consejo</p>
            <p className="text-slate-700">
              Si tu PC estará disponible más de 1 hora al día, la app nativa recauda mucho más XMR. Solo se descarga una vez y trabaja mientras usas la computadora normalmente.
            </p>
            <p className="text-sm text-emerald-800">
              El navegador es perfecto para probar, pero la app es donde ocurre el verdadero financiamiento de la investigación.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Elige tu forma de aportar</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
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
                  <p className="text-sm font-bold text-purple-900">Financiamiento continuo para investigación</p>
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
            <p className="mb-2 font-bold text-amber-900">Transparencia total</p>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>✓ El código de PROYECTA es abierto (open source)</li>
              <li>✓ Los XMR van directo a la billetera del proyecto: PROYECTA nunca los toca</li>
              <li>✓ Puedes verificar hashrate, shares y pagos reportados por SupportXMR</li>
              <li>✓ No hay intermediarios: dinero directo a investigación</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:gap-4 sm:pt-6">
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
