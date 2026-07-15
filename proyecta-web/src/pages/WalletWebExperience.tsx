import { useMemo } from 'react'
import { ExternalLink, ShieldCheck, Lock, Globe2 } from 'lucide-react'

const MONERO_WEB_URL = ((import.meta as any).env?.VITE_MONERO_WEB_URL || '').trim()

export function WalletWebExperience() {
  const hasUrl = MONERO_WEB_URL.length > 0
  const safeUrl = useMemo(() => {
    if (!hasUrl) return ''
    try {
      const parsed = new URL(MONERO_WEB_URL)
      return parsed.toString()
    } catch {
      return ''
    }
  }, [hasUrl])

  return (
    <div className="space-y-8">
      <div className="nova-card space-y-4 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Wallet aislada</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Monero Web</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Este espacio está separado del resto del portal para reducir exposición de datos.
              No comparte estado con la página principal y solo debe usarse con tu consentimiento explícito.
            </p>
          </div>
          <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-700">
            <Globe2 className="h-6 w-6" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">
            <div className="mb-2 flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4" /> Privacidad
            </div>
            La sesión de la wallet vive en una ruta aparte y no debe reutilizar cookies de trabajo ni el contexto del editor.
          </div>
          <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
            <div className="mb-2 flex items-center gap-2 font-bold text-slate-900">
              <Lock className="h-4 w-4" /> Aislamiento
            </div>
            El contenedor usa sandbox y no se le concede acceso a la ventana principal del portal.
          </div>
          <div className="rounded-[18px] border border-fuchsia-200 bg-fuchsia-50 p-4 text-sm leading-7 text-fuchsia-800">
            <div className="mb-2 flex items-center gap-2 font-bold text-fuchsia-900">
              <ExternalLink className="h-4 w-4" /> Control
            </div>
            Solo procede si tú decides usar este modo. La wallet externa sigue siendo la opción por defecto.
          </div>
        </div>
      </div>

      {!hasUrl ? (
        <div className="nova-card p-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Monero Web no está configurado</h2>
          <p className="text-sm leading-7 text-slate-600">
            Agrega `VITE_MONERO_WEB_URL` para conectar el panel aislado de wallet. Mientras tanto, la dirección externa sigue funcionando normal.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>Panel aislado de Monero Web</span>
            <a href={safeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-fuchsia-700 hover:underline">
              Abrir en pestaña aparte
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <iframe
            title="Monero Web"
            src={safeUrl}
            className="h-[78vh] w-full bg-white"
            sandbox="allow-scripts allow-forms allow-popups"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  )
}