import { useEffect, useMemo, useState } from 'react'
import { Link2, ShieldCheck, Wallet } from 'lucide-react'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'

const MONERO_ADDRESS_RE = /^[48][a-zA-Z0-9]{94}$/
const DEFAULT_MONERO_WEB_URL = ((import.meta as any).env?.VITE_MONERO_WEB_URL || '').trim()

type WalletMode = 'external' | 'monero_web'

export function WalletSetupGuide() {
  const { user, linkWallet, updateProfile } = useTraditionalAuth()
  const [mainAddress, setMainAddress] = useState(user?.moneroWallet?.mainAddress || '')
  const [walletMode, setWalletMode] = useState<WalletMode>(user?.walletMode || 'external')
  const [walletWebUrl, setWalletWebUrl] = useState(user?.walletWebUrl || DEFAULT_MONERO_WEB_URL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMainAddress(user?.moneroWallet?.mainAddress || '')
    setWalletMode(user?.walletMode || 'external')
    setWalletWebUrl(user?.walletWebUrl || DEFAULT_MONERO_WEB_URL)
  }, [user])

  const linkedWallet = user?.moneroWallet
  const shortAddress = useMemo(() => {
    if (!linkedWallet?.mainAddress) return ''
    return `${linkedWallet.mainAddress.slice(0, 18)}...${linkedWallet.mainAddress.slice(-10)}`
  }, [linkedWallet?.mainAddress])

  const handleSaveWallet = async () => {
    setError(null)
    setSaved(false)

    const normalizedAddress = mainAddress.trim()
    const normalizedWalletWebUrl = walletWebUrl.trim()

    if (!normalizedAddress) {
      setError('La dirección principal es obligatoria.')
      return
    }
    if (!MONERO_ADDRESS_RE.test(normalizedAddress)) {
      setError('La dirección Monero no tiene un formato válido.')
      return
    }
    if (walletMode === 'monero_web' && !normalizedWalletWebUrl) {
      setError('Agrega la URL del panel Monero Web o vuelve a modo externo.')
      return
    }

    setLoading(true)
    try {
      await linkWallet(normalizedAddress, walletMode, normalizedWalletWebUrl)
      await updateProfile({
        walletMode,
        walletWebUrl: walletMode === 'monero_web' ? normalizedWalletWebUrl : '',
      })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible guardar la wallet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="nova-card space-y-6 p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Wallet personal</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Registrar dirección Monero personal</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Esta dirección queda guardada en tu perfil y se usará como destino al crear proyectos. PROYECTA no custodia la wallet; tú la administras.
          </p>
        </div>
        <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-700">
          <Wallet className="h-6 w-6" />
        </div>
      </div>

      {linkedWallet ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Dirección registrada</p>
              <p className="mt-2 text-sm font-semibold text-emerald-950">{shortAddress}</p>
            </div>
            <button
              type="button"
              onClick={() => setMainAddress(linkedWallet.mainAddress)}
              className="nova-button-soft text-sm"
            >
              Cargar vínculo actual
            </button>
          </div>
          <p className="mt-3 text-sm leading-7 text-emerald-800">
            Vinculada el {new Date(linkedWallet.linkedAt).toLocaleDateString()}. Esta es la dirección que se usa al crear proyectos y recibir fondos.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-5 rounded-[20px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold">Elegir modo de wallet</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setWalletMode('external')}
              className={`rounded-[18px] border-2 p-4 text-left transition ${
                walletMode === 'external'
                  ? 'border-fuchsia-500 bg-fuchsia-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-black text-slate-900">Dirección externa</p>
              <p className="mt-2 text-xs leading-6 text-slate-600">Guardas solo tu dirección Monero personal para recibir fondos sin panel adicional.</p>
            </button>
            <button
              type="button"
              onClick={() => setWalletMode('monero_web')}
              className={`rounded-[18px] border-2 p-4 text-left transition ${
                walletMode === 'monero_web'
                  ? 'border-fuchsia-500 bg-fuchsia-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-black text-slate-900">Monero Web</p>
              <p className="mt-2 text-xs leading-6 text-slate-600">Administra la wallet desde un panel aislado, con consentimiento explícito y control del usuario.</p>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Dirección principal de Monero</label>
            <input
              type="text"
              value={mainAddress}
              onChange={(e) => setMainAddress(e.target.value)}
              placeholder="4AWcSZ..."
              className="nova-field font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-slate-500">Dirección pública de 95 caracteres para recibir XMR.</p>
          </div>

          {walletMode === 'monero_web' ? (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">URL del panel Monero Web</label>
              <input
                type="url"
                value={walletWebUrl}
                onChange={(e) => setWalletWebUrl(e.target.value)}
                placeholder="https://..."
                className="nova-field text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-slate-500">Se guarda en tu perfil para abrir el panel aislado cuando quieras administrar la wallet.</p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {saved ? (
            <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Wallet vinculada correctamente.
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={handleSaveWallet} disabled={loading} className="nova-button-solid w-full py-3 disabled:opacity-60">
              {loading ? 'Guardando...' : 'Guardar wallet'}
            </button>
            <button type="button" onClick={() => window.location.assign('/wallet-web')} className="nova-button-soft w-full py-3">
              Abrir Monero Web
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-[20px] border border-fuchsia-200 bg-gradient-to-br from-white via-fuchsia-50/50 to-orange-50/40 p-5">
          <div className="flex items-center gap-2 text-fuchsia-700">
            <Link2 className="h-4 w-4" />
            <p className="text-sm font-bold">Qué pasa después</p>
          </div>
          <ul className="space-y-3 text-sm leading-7 text-slate-700">
            <li>Se guarda en tu perfil como wallet personal del investigador.</li>
            <li>Al crear un proyecto, esa dirección puede usarse como recaudación principal.</li>
            <li>Si activas Monero Web, también queda guardada la URL del panel para acceder luego desde el perfil.</li>
          </ul>
          <div className="rounded-[18px] border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
            Si todavía no tienes wallet, crea una con Feather Wallet o MyMonero y vuelve aquí para registrar solo la dirección.
          </div>
          <div className="rounded-[18px] border border-fuchsia-200 bg-fuchsia-50/70 p-4 text-sm leading-7 text-fuchsia-800">
            Monero Web queda aparte, con aislamiento y consentimiento explícito, para quienes prefieren administrar su wallet dentro del portal.
          </div>
        </div>
      </div>
    </section>
  )
}
