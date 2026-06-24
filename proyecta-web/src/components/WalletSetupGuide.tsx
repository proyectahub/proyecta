import { useState } from 'react'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'

export function WalletSetupGuide() {
  const { user, linkWallet } = useTraditionalAuth()
  const [mainAddress, setMainAddress] = useState('')
  const [viewKey, setViewKey] = useState('')
  const [step, setStep] = useState('intro')
  const [error, setError] = useState(null)

  const handleLinkWallet = async () => {
    setError(null)
    if (!mainAddress.trim()) {
      setError('Main Address requerida')
      return
    }
    try {
      await linkWallet(mainAddress, viewKey)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  if (user?.moneroWallet) {
    return (
      <div className="nova-card p-6 bg-emerald-50 space-y-4">
        <h3 className="font-bold text-lg text-emerald-900">Wallet Vinculado</h3>
        <div className="space-y-2">
          <p className="text-sm"><strong>Address:</strong> {user.moneroWallet.mainAddress.slice(0, 20)}...</p>
          <p className="text-sm text-emerald-700">Vinculado el {new Date(user.moneroWallet.linkedAt).toLocaleDateString()}</p>
        </div>
        <button className="nova-button-soft text-sm">Desvincula wallet</button>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className="nova-card p-6 space-y-4">
        <h3 className="font-bold text-lg">Vincular Wallet Monero</h3>
        <p className="text-slate-600">Conecta tu wallet para:</p>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>- Recibir donaciones en XMR</li>
          <li>- Recibir VITA automaticamente</li>
          <li>- Manejo sin custodia (TU controlas)</li>
        </ul>
        <button
          onClick={() => setStep('download')}
          className="nova-button-solid w-full"
        >
          Comenzar
        </button>
      </div>
    )
  }

  if (step === 'download') {
    return (
      <div className="nova-card p-6 space-y-4">
        <h3 className="font-bold text-lg">Paso 1: Descargar Wallet</h3>

        <div className="space-y-3">
          <div className="bg-blue-50 rounded p-4 space-y-2">
            <p className="font-bold text-blue-900">Feather Wallet (Recomendado)</p>
            <a
              href="https://featherwallet.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              Descargar Feather Wallet
            </a>
          </div>

          <div className="bg-purple-50 rounded p-4 space-y-2">
            <p className="font-bold text-purple-900">MyMonero (Web)</p>
            <a
              href="https://mymonero.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline text-sm"
            >
              Ir a MyMonero
            </a>
          </div>

          <div className="bg-amber-50 rounded p-4 space-y-2">
            <p className="font-bold text-amber-900">Importante</p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>- Guarda tu mnemonic (12-24 palabras)</li>
              <li>- NUNCA compartas mnemonic o private key</li>
              <li>- El view key SI es publico</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep('intro')} className="nova-button-soft flex-1">Volver</button>
          <button onClick={() => setStep('setup')} className="nova-button-solid flex-1">Siguiente</button>
        </div>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="nova-card p-6 space-y-4">
        <h3 className="font-bold text-lg">Paso 2: Crear Wallet</h3>

        <div className="bg-slate-50 rounded p-4 space-y-3">
          <p className="font-bold text-slate-900">En Feather Wallet:</p>

          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <p className="font-bold">1. Abre Feather</p>
            </div>
            <div>
              <p className="font-bold">2. Click en New Wallet</p>
            </div>
            <div>
              <p className="font-bold">3. Guarda tu Mnemonic</p>
              <p className="text-xs">COPIA las 25 palabras en lugar seguro</p>
            </div>
            <div>
              <p className="font-bold">4. Espera sincronizacion</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep('download')} className="nova-button-soft flex-1">Volver</button>
          <button onClick={() => setStep('copy')} className="nova-button-solid flex-1">Siguiente</button>
        </div>
      </div>
    )
  }

  if (step === 'copy') {
    return (
      <div className="nova-card p-6 space-y-4">
        <h3 className="font-bold text-lg">Paso 3: Copiar Datos</h3>

        <div className="bg-blue-50 rounded p-4 space-y-3">
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-bold">Main Address</p>
              <p className="text-xs">Settings → Wallet → Copia Address (95 caracteres)</p>
            </div>

            <div className="border-t pt-3">
              <p className="font-bold">View Key</p>
              <p className="text-xs">En Settings → Wallet → Copia View Key (64 caracteres)</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep('setup')} className="nova-button-soft flex-1">Volver</button>
          <button onClick={() => setStep('link')} className="nova-button-solid flex-1">Siguiente</button>
        </div>
      </div>
    )
  }

  if (step === 'link') {
    return (
      <div className="nova-card p-6 space-y-4">
        <h3 className="font-bold text-lg">Paso 4: Vincular</h3>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-sm font-bold">Main Address</label>
            <input
              type="text"
              value={mainAddress}
              onChange={(e) => setMainAddress(e.target.value)}
              placeholder="40..."
              className="nova-field font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold">View Key</label>
            <input
              type="text"
              value={viewKey}
              onChange={(e) => setViewKey(e.target.value)}
              placeholder="0123456789abcdef..."
              className="nova-field font-mono text-xs"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 rounded p-2 text-red-800 text-xs">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep('copy')} className="nova-button-soft flex-1">Volver</button>
          <button
            onClick={handleLinkWallet}
            className="nova-button-solid flex-1"
          >
            Vincular
          </button>
        </div>
      </div>
    )
  }

  return null
}
