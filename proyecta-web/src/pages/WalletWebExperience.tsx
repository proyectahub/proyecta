import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Globe2, Lock, ShieldCheck, Copy, ClipboardPaste } from 'lucide-react'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'

const DEFAULT_MONERO_WEB_URL = 'https://monero-web.com'
const PENDING_MONERO_ADDRESS_KEY = 'proyecta_pending_monero_address'
const PENDING_MONERO_MODE_KEY = 'proyecta_pending_monero_mode'
const PENDING_MONERO_WEB_URL_KEY = 'proyecta_pending_monero_web_url'

const MONERO_ADDRESS_RE = /^[48][a-zA-Z0-9]{94}$/

type CaptureTarget = 'mainAddress' | ''

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    return new URL(trimmed).toString()
  } catch {
    return ''
  }
}

function readPendingAddress() {
  try {
    return window.localStorage.getItem(PENDING_MONERO_ADDRESS_KEY) || ''
  } catch {
    return ''
  }
}

function savePendingAddress(address: string, walletWebUrl: string) {
  try {
    window.localStorage.setItem(PENDING_MONERO_ADDRESS_KEY, address)
    window.localStorage.setItem(PENDING_MONERO_MODE_KEY, 'monero_web')
    window.localStorage.setItem(PENDING_MONERO_WEB_URL_KEY, walletWebUrl)
  } catch {
    // ignore storage failures
  }
}

function clearPendingAddress() {
  try {
    window.localStorage.removeItem(PENDING_MONERO_ADDRESS_KEY)
    window.localStorage.removeItem(PENDING_MONERO_MODE_KEY)
    window.localStorage.removeItem(PENDING_MONERO_WEB_URL_KEY)
  } catch {
    // ignore storage failures
  }
}

async function pasteFromClipboard() {
  const text = await navigator.clipboard.readText()
  return text.trim()
}

export function WalletWebExperience() {
  const { user } = useTraditionalAuth()
  const search = useMemo(() => new URLSearchParams(window.location.search), [])
  const captureTarget = (search.get('capture') || '') as CaptureTarget
  const returnTo = search.get('returnTo') || '/profile'
  const walletWebUrlParam = search.get('walletWebUrl') || ''

  const configuredUrl = walletWebUrlParam || (user?.walletMode === 'monero_web' ? user.walletWebUrl || '' : '')
  const fallbackUrl = ((import.meta as any).env?.VITE_MONERO_WEB_URL || '').trim() || DEFAULT_MONERO_WEB_URL

  const safeUrl = useMemo(() => normalizeUrl(configuredUrl || fallbackUrl), [configuredUrl, fallbackUrl])
  const usingMoneroWebMode = user?.walletMode === 'monero_web'
  const [addressDraft, setAddressDraft] = useState(readPendingAddress())
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!addressDraft) {
      setAddressDraft(readPendingAddress())
    }
  }, [addressDraft])

  const handleSaveAddress = () => {
    setError(null)
    const normalized = addressDraft.trim()
    if (!MONERO_ADDRESS_RE.test(normalized)) {
      setError('Pega una dirección Monero válida antes de guardar.')
      return
    }

    savePendingAddress(normalized, safeUrl || fallbackUrl)
    setSaved(true)

    try {
      window.opener?.postMessage(
        {
          type: 'proyecta-monero-address',
          address: normalized,
          walletWebUrl: safeUrl || fallbackUrl,
        },
        window.location.origin,
      )
    } catch {
      // ignore postMessage failures
    }
  }

  const handleCopyMoneroWeb = async () => {
    try {
      await navigator.clipboard.writeText(safeUrl || fallbackUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('No fue posible copiar la URL del panel.')
    }
  }

  const handlePaste = async () => {
    try {
      const text = await pasteFromClipboard()
      if (!text) return
      setAddressDraft(text)
    } catch {
      setError('No fue posible leer el portapapeles.')
    }
  }

  const openMoneroWeb = () => {
    if (!safeUrl) return
    window.open(safeUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-8">
      <div className="nova-card space-y-4 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Wallet aislada</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Monero Web real</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Abre el panel real de Monero Web, genera o restaura tu wallet y copia la dirección pública para asociarla al perfil.
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
            Solo se usa cuando el perfil eligió Monero Web. La dirección final sigue siendo la que tú guardes en tu cuenta.
          </div>
          <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
            <div className="mb-2 flex items-center gap-2 font-bold text-slate-900">
              <Lock className="h-4 w-4" /> Aislamiento
            </div>
            La wallet se administra en un panel aparte y el portal solo conserva la dirección pública y la preferencia de modo.
          </div>
          <div className="rounded-[18px] border border-fuchsia-200 bg-fuchsia-50 p-4 text-sm leading-7 text-fuchsia-800">
            <div className="mb-2 flex items-center gap-2 font-bold text-fuchsia-900">
              <ExternalLink className="h-4 w-4" /> Fuente real
            </div>
            No inventamos wallets ni seeds. El panel abre una instancia real de Monero Web y luego puedes registrar la dirección en el perfil.
          </div>
        </div>
      </div>

      {!safeUrl ? (
        <div className="nova-card space-y-4 p-8">
          <h2 className="text-xl font-bold text-slate-900">Monero Web no está configurado</h2>
          <p className="text-sm leading-7 text-slate-600">
            Activa el modo <strong>Monero Web</strong> en tu perfil y guarda la URL del panel. Si no tienes una personalizada, usa la instancia pública o define <code>VITE_MONERO_WEB_URL</code>.
          </p>
        </div>
      ) : (
        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-sm text-slate-600">
            <span>{usingMoneroWebMode ? 'Puente aislado de Monero Web vinculado a tu perfil' : 'Puente aislado de Monero Web con URL de respaldo'}</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="break-all text-xs text-slate-500">{safeUrl}</span>
              <button type="button" onClick={handleCopyMoneroWeb} className="inline-flex items-center gap-2 font-semibold text-fuchsia-700 hover:underline">
                <Copy className="h-4 w-4" />
                {copied ? 'URL copiada' : 'Copiar URL'}
              </button>
              <button type="button" onClick={openMoneroWeb} className="inline-flex items-center gap-2 font-semibold text-fuchsia-700 hover:underline">
                Abrir Monero Web
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                El navegador puede bloquear paneles externos dentro de un `iframe`. Por eso este flujo abre Monero Web en una pestaña aparte y luego regresas con la dirección pública.
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <p className="font-bold text-slate-900">Flujo recomendado</p>
                <ol className="mt-2 list-decimal space-y-2 pl-5">
                  <li>Abre Monero Web en pestaña aparte.</li>
                  <li>Genera o restaura tu wallet dentro de ese panel.</li>
                  <li>Copia la dirección pública de recepción.</li>
                  <li>Pega la dirección aquí para guardarla en el perfil.</li>
                </ol>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={openMoneroWeb} className="nova-button-solid px-4 py-2 text-sm">
                  Abrir Monero Web
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddressDraft(readPendingAddress())
                    setError(null)
                    setSaved(false)
                  }}
                  className="nova-button-soft px-4 py-2 text-sm"
                >
                  Cargar dirección pendiente
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-[20px] border border-fuchsia-200 bg-fuchsia-50/70 p-4">
              <p className="text-sm font-bold text-fuchsia-900">Seguridad de la wallet</p>
              <ul className="space-y-2 text-sm leading-7 text-fuchsia-900/90">
                <li>No compartas la seed phrase ni la clave privada.</li>
                <li>Guarda la frase de recuperación fuera del navegador.</li>
                <li>La dirección pública sí puede copiarse al perfil.</li>
                <li>Si usas una wallet nueva, verifica bien antes de guardar.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {captureTarget === 'mainAddress' ? (
        <div className="nova-card space-y-4 p-8">
          <div className="flex items-center gap-2 text-fuchsia-700">
            <ClipboardPaste className="h-4 w-4" />
            <p className="text-sm font-bold">Registrar dirección generada</p>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            Copia la dirección pública que generaste en Monero Web, pégala aquí y la guardaremos en el perfil para usarla como destino del proyecto.
          </p>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Dirección pública Monero</label>
            <textarea
              value={addressDraft}
              onChange={(event) => setAddressDraft(event.target.value)}
              placeholder="Pega aquí la dirección pública de 95 caracteres"
              className="nova-field min-h-[120px] w-full font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handlePaste} className="nova-button-soft px-4 py-2 text-sm">
              Pegar del portapapeles
            </button>
            <button type="button" onClick={handleSaveAddress} className="nova-button-solid px-4 py-2 text-sm">
              Guardar dirección y volver
            </button>
            <button
              type="button"
              onClick={() => {
                clearPendingAddress()
                window.location.assign(returnTo)
              }}
              className="nova-button-soft px-4 py-2 text-sm"
            >
              Volver sin guardar
            </button>
          </div>
          {saved ? (
            <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Dirección lista para copiar en el perfil.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          <p className="text-xs leading-6 text-slate-500">
            Una vez guardada, el perfil podrá leerla automáticamente y colocarla en la barra de dirección principal.
          </p>
        </div>
      ) : null}
    </div>
  )
}

