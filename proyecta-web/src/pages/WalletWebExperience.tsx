import { useMemo } from 'react'
import { ExternalLink, Globe2, Lock, ShieldCheck } from 'lucide-react'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'

const DEFAULT_MONERO_WEB_URL = 'https://monero-web.com'

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    return new URL(trimmed).toString()
  } catch {
    return ''
  }
}

export function WalletWebExperience() {
  const { user } = useTraditionalAuth()

  const configuredUrl = user?.walletMode === 'monero_web' ? user.walletWebUrl || '' : ''
  const fallbackUrl = ((import.meta as any).env?.VITE_MONERO_WEB_URL || '').trim() || DEFAULT_MONERO_WEB_URL

  const safeUrl = useMemo(() => normalizeUrl(configuredUrl || fallbackUrl), [configuredUrl, fallbackUrl])
  const usingMoneroWebMode = user?.walletMode === 'monero_web'

  return (
    <div className="space-y-8">
      <div className="nova-card space-y-4 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Wallet aislada</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Monero Web real</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Este panel carga una wallet real y no custodiada en una ruta aparte. Las llaves se generan y se usan dentro del navegador del usuario; PROYECTA solo guarda la preferencia y la dirección pública asociada al proyecto.
            </p>
          </div>
          <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-700">
            <Globe2 className="h-6 w-6" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">
            <div className="mb-2 flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4" /> Consentimiento
            </div>
            Solo se abre si el usuario eligió Monero Web en su perfil. Si no, el portal mantiene la dirección externa como opción principal.
          </div>
          <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
            <div className="mb-2 flex items-center gap-2 font-bold text-slate-900">
              <Lock className="h-4 w-4" /> Aislamiento
            </div>
            El panel se renderiza en una ruta aparte para separar la experiencia de wallet del resto del portal.
          </div>
          <div className="rounded-[18px] border border-fuchsia-200 bg-fuchsia-50 p-4 text-sm leading-7 text-fuchsia-800">
            <div className="mb-2 flex items-center gap-2 font-bold text-fuchsia-900">
              <ExternalLink className="h-4 w-4" /> Fuente real
            </div>
            La interfaz se conecta a una instancia real de Monero Web. No hay llaves ni seeds simuladas en PROYECTA.
          </div>
        </div>
      </div>

      {!safeUrl ? (
        <div className="nova-card space-y-4 p-8">
          <h2 className="text-xl font-bold text-slate-900">Monero Web no está configurado</h2>
          <p className="text-sm leading-7 text-slate-600">
            Activa el modo <strong>Monero Web</strong> en tu perfil y guarda la URL del panel. Si no tienes una personalizada, usa la instancia pública o la URL que definas con <code>VITE_MONERO_WEB_URL</code>.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>{usingMoneroWebMode ? 'Panel aislado de Monero Web vinculado a tu perfil' : 'Panel aislado de Monero Web con URL de respaldo'}</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="break-all text-xs text-slate-500">{safeUrl}</span>
              <a href={safeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-fuchsia-700 hover:underline">
                Abrir en pestaña aparte
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <iframe
            title="Monero Web"
            src={safeUrl}
            className="h-[78vh] w-full bg-white"
            sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-same-origin"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  )
}
