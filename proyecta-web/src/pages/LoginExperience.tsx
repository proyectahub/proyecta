import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useWalletAuth } from '../context/WalletAuthContext'

export function LoginExperience() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginWithWallet, loading, error: authError } = useWalletAuth()

  const intent = searchParams.get('intent') || 'browse'

  const [mainAddress, setMainAddress] = useState('')
  const [viewKey, setViewKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!mainAddress.trim()) {
      setError('Dirección Monero requerida')
      return
    }

    if (!viewKey.trim()) {
      setError('View key requerida')
      return
    }

    try {
      await loginWithWallet(mainAddress, viewKey)
      setStep('success')

      // Redirigir a completar perfil después de 2 segundos
      setTimeout(() => {
        navigate('/complete-profile')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  // ====== STEP 1: INTRO ======
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8">
          {/* Logo/Header */}
          <div className="text-center space-y-4">
            <div className="text-5xl">🔐</div>
            <h1 className="text-4xl font-bold text-slate-900">PROYECTA</h1>
            <p className="text-lg text-slate-600">
              Apoyo mutuo y comunitario para la ciencia
            </p>
          </div>

          {/* Intención de usuario */}
          {intent === 'publish' && (
            <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-blue-900 font-bold">📢 Modo: Publicar proyecto</p>
              <p className="text-sm text-blue-800 mt-2">
                Conecta tu wallet Monero para publicar tu proyecto de investigación
              </p>
            </div>
          )}

          {intent === 'support' && (
            <div className="bg-emerald-100 border-l-4 border-emerald-600 p-4 rounded">
              <p className="text-emerald-900 font-bold">💚 Modo: Apoyar investigación</p>
              <p className="text-sm text-emerald-800 mt-2">
                Conecta tu wallet para ver proyectos y donar XMR
              </p>
            </div>
          )}

          {/* Tarjetas explicativas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="nova-card p-4 space-y-2">
              <p className="text-2xl">🔑</p>
              <p className="font-bold text-slate-900">Tu control</p>
              <p className="text-sm text-slate-600">
                Sin passwords, sin custodias. Solo tu wallet Monero
              </p>
            </div>

            <div className="nova-card p-4 space-y-2">
              <p className="text-2xl">💰</p>
              <p className="font-bold text-slate-900">Transparencia</p>
              <p className="text-sm text-slate-600">
                Todas las transacciones en blockchain, auditable por todos
              </p>
            </div>

            <div className="nova-card p-4 space-y-2">
              <p className="text-2xl">⚡</p>
              <p className="font-bold text-slate-900">VITA = Voz</p>
              <p className="text-sm text-slate-600">
                Tu apoyo genera VITA para validar proyectos
              </p>
            </div>
          </div>

          {/* Información de seguridad */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 space-y-3">
            <h3 className="font-bold text-emerald-900">🛡️ Seguridad: Sin custodia</h3>

            <ul className="space-y-2 text-sm text-emerald-800">
              <li>✅ PROYECTA nunca toca tu dinero</li>
              <li>✅ Tu view key es públicamente conocida (no revela fondos)</li>
              <li>✅ Tu main address es donde recibes XMR</li>
              <li>✅ Todo verificable en blockchain Monero</li>
            </ul>

            <p className="text-xs text-emerald-600 italic mt-4">
              "No confíes, verifica" — todos los datos son auditable públicamente
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep('form')}
            className="w-full nova-button-solid py-4 text-lg"
          >
            Conectar wallet Monero →
          </button>

          {/* Info adicional */}
          <div className="text-center space-y-2 text-sm text-slate-600">
            <p>¿No tienes wallet Monero?</p>
            <a
              href="https://www.monero.how/monero-gui-wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Descarga Feather o MyMonero →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ====== STEP 2: FORM ======
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Conectar wallet</h2>
            <p className="text-slate-600">
              Ingresa tu dirección Monero y tu view key
            </p>
          </div>

          <form onSubmit={handleLogin} className="nova-card p-8 space-y-6">
            {/* Main Address */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Dirección Monero principal (95 caracteres)
              </label>
              <input
                type="text"
                value={mainAddress}
                onChange={(e) => setMainAddress(e.target.value)}
                placeholder="4AWcSZ..."
                className="nova-field font-mono text-sm"
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                Esta es tu dirección pública para recibir XMR
              </p>
            </div>

            {/* View Key */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                View key (64 caracteres hexadecimales)
              </label>
              <input
                type="password"
                value={viewKey}
                onChange={(e) => setViewKey(e.target.value)}
                placeholder="abcd1234..."
                className="nova-field font-mono text-sm"
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                No requiere el mnemonic, solo la view key pública
              </p>
            </div>

            {/* Errores */}
            {(error || authError) && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-800 text-sm">
                {error || authError}
              </div>
            )}

            {/* Info de seguridad */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-bold mb-2">ℹ️ Nota de seguridad:</p>
              <ul className="space-y-1 list-disc list-inside text-xs">
                <li>Tu view key es pública y no revela fondos</li>
                <li>PROYECTA solo verifica transacciones en blockchain</li>
                <li>Tus fondos nunca dejan Monero</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('intro')}
                className="nova-button-soft flex-1"
                disabled={loading}
              >
                Volver
              </button>
              <button
                type="submit"
                className="nova-button-solid flex-1"
                disabled={loading}
              >
                {loading ? 'Conectando...' : 'Conectar'}
              </button>
            </div>
          </form>

          {/* Ayuda */}
          <div className="text-center space-y-2 text-sm text-slate-600">
            <p>¿Dónde encuentro mi dirección y view key?</p>
            <details className="inline-block">
              <summary className="text-blue-600 cursor-pointer underline">
                Ver instrucciones
              </summary>
              <div className="mt-3 bg-white p-4 rounded-lg text-left space-y-2 text-xs">
                <p className="font-bold">Feather Wallet:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Settings → Wallet → View keys</li>
                  <li>Copia tu Main Address y View key</li>
                </ol>
                <p className="font-bold mt-3">MyMonero:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Account info → View keys</li>
                  <li>Copia dirección y view key</li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      </div>
    )
  }

  // ====== STEP 3: SUCCESS ======
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">✅</div>
            <h2 className="text-3xl font-bold text-emerald-900">¡Conectado!</h2>
            <p className="text-emerald-700">
              Tu wallet está listo. Redirigiendo...
            </p>
          </div>

          <div className="nova-card p-6 space-y-3 text-left">
            <p className="text-sm font-bold text-slate-900">Lo que puedes hacer ahora:</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {intent === 'publish' && (
                <>
                  <li>📢 Publicar tu proyecto de investigación</li>
                  <li>💰 Recibir donaciones XMR directas</li>
                  <li>⚡ Generar VITA con tu obra científica</li>
                </>
              )}
              {intent === 'support' && (
                <>
                  <li>👁️ Explorar proyectos de investigación</li>
                  <li>💚 Donar XMR directamente a proyectos</li>
                  <li>⚡ Ganar VITA validando investigación</li>
                </>
              )}
              {!intent && (
                <>
                  <li>👁️ Explorar y apoyar investigación</li>
                  <li>📢 Publicar tus propios proyectos</li>
                  <li>⚡ Participar en la comunidad PROYECTA</li>
                </>
              )}
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Redirigiendo en 2 segundos...
          </p>
        </div>
      </div>
    )
  }

  return null
}
