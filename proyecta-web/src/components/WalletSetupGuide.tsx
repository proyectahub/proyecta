import { useState } from 'react'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'

export function WalletSetupGuide() {
  const { user, linkWallet } = useTraditionalAuth()
  const [mainAddress, setMainAddress] = useState('')
  const [viewKey, setViewKey] = useState('')
  const [step, setStep] = useState<'intro' | 'download' | 'setup' | 'copy' | 'link' | 'success'>('intro')
  const [error, setError] = useState<string | null>(null)

  const handleLinkWallet = async () => {
    setError(null)
    if (!mainAddress.trim()) {
      setError('Dirección principal requerida')
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
      <div className="nova-card space-y-4 bg-emerald-50 p-6">
        <h3 className="text-lg font-bold text-emerald-900">Wallet personal vinculada</h3>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Dirección principal:</strong> {user.moneroWallet.mainAddress.slice(0, 20)}...
          </p>
          <p className="text-sm text-emerald-700">
            Vinculada el {new Date(user.moneroWallet.linkedAt).toLocaleDateString()}
          </p>
        </div>
        <p className="text-sm leading-7 text-emerald-800">
          Esta wallet es la que administras tú y la que se puede usar después al crear proyectos.
        </p>
        <button className="nova-button-soft text-sm">Desvincular wallet</button>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className="nova-card space-y-4 p-6">
        <h3 className="text-lg font-bold">Wallet personal del usuario</h3>
        <p className="text-slate-600">
          Vincula tu wallet personal para usarla como dirección del proyecto cuando publiques investigación.
        </p>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>- Recibir donaciones en XMR</li>
          <li>- Mantener control sin custodia</li>
          <li>- Usarla como wallet del proyecto</li>
        </ul>
        <button onClick={() => setStep('download')} className="nova-button-solid w-full">
          Comenzar
        </button>
      </div>
    )
  }

  if (step === 'download') {
    return (
      <div className="nova-card space-y-4 p-6">
        <h3 className="text-lg font-bold">Paso 1: Preparar tu wallet personal</h3>

        <div className="space-y-3">
          <div className="space-y-2 rounded bg-blue-50 p-4">
            <p className="font-bold text-blue-900">Feather Wallet (recomendado)</p>
            <a href="https://featherwallet.org" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
              Descargar Feather Wallet
            </a>
          </div>

          <div className="space-y-2 rounded bg-purple-50 p-4">
            <p className="font-bold text-purple-900">MyMonero (web)</p>
            <a href="https://mymonero.com" target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 underline">
              Ir a MyMonero
            </a>
          </div>

          <div className="space-y-2 rounded bg-amber-50 p-4">
            <p className="font-bold text-amber-900">Importante</p>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>- Guarda tu mnemonic (12-24 palabras)</li>
              <li>- Nunca compartas mnemonic o private key</li>
              <li>- La view key sí es pública</li>
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
      <div className="nova-card space-y-4 p-6">
        <h3 className="text-lg font-bold">Paso 2: Copiar tu información</h3>

        <div className="space-y-3 rounded bg-slate-50 p-4">
          <p className="font-bold text-slate-900">En Feather Wallet:</p>
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>1.</strong> Abre Feather</p>
            <p><strong>2.</strong> Crea o importa tu wallet</p>
            <p><strong>3.</strong> Guarda tu mnemonic con cuidado</p>
            <p><strong>4.</strong> Espera la sincronización</p>
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
      <div className="nova-card space-y-4 p-6">
        <h3 className="text-lg font-bold">Paso 3: Copiar datos públicos</h3>

        <div className="space-y-3 rounded bg-blue-50 p-4 text-sm text-blue-800">
          <div>
            <p className="font-bold">Dirección principal</p>
            <p className="text-xs">Settings → Wallet → copia la dirección (95 caracteres)</p>
          </div>
          <div className="border-t pt-3">
            <p className="font-bold">View key pública</p>
            <p className="text-xs">Settings → Wallet → copia la view key pública (64 caracteres)</p>
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
      <div className="nova-card space-y-4 p-6">
        <h3 className="text-lg font-bold">Paso 4: Vincular wallet al perfil</h3>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-sm font-bold">Dirección principal</label>
            <input
              type="text"
              value={mainAddress}
              onChange={(e) => setMainAddress(e.target.value)}
              placeholder="44yrux72BYfaVJVkugoCFpdgTYXWPtqr..."
              className="nova-field font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold">View key pública</label>
            <input
              type="text"
              value={viewKey}
              onChange={(e) => setViewKey(e.target.value)}
              placeholder="0123456789abcdef..."
              className="nova-field font-mono text-xs"
            />
          </div>

          {error ? (
            <div className="rounded border border-red-300 bg-red-100 p-2 text-xs text-red-800">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep('copy')} className="nova-button-soft flex-1">Volver</button>
          <button onClick={handleLinkWallet} className="nova-button-solid flex-1">Guardar vínculo</button>
        </div>
      </div>
    )
  }

  return (
    <div className="nova-card space-y-3 bg-emerald-50 p-6">
      <h3 className="text-lg font-bold text-emerald-900">Wallet personal vinculada</h3>
      <p className="text-sm leading-7 text-emerald-800">
        Ya puedes usar esta dirección cuando crees proyectos. Será la wallet administrada por ti y la que se vincule a la recaudación.
      </p>
    </div>
  )
}
