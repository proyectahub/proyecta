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
    if (!mainAddress.trim()) return setError('Dirección Monero requerida')
    if (!viewKey.trim()) return setError('View key requerida')
    try {
      await loginWithWallet(mainAddress, viewKey)
      setStep('success')
      setTimeout(() => navigate('/complete-profile'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión')
    }
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-4 text-center">
            <div className="text-5xl">🔐</div>
            <h1 className="text-4xl font-bold text-slate-900">PROYECTA</h1>
            <p className="text-lg text-slate-600">Apoyo mutuo y comunitario para la ciencia</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="nova-card space-y-2 p-4"><p className="text-2xl">🔑</p><p className="font-bold text-slate-900">Tu control</p><p className="text-sm text-slate-600">Sin passwords, sin custodia. Solo tu wallet Monero.</p></div>
            <div className="nova-card space-y-2 p-4"><p className="text-2xl">💰</p><p className="font-bold text-slate-900">Transparencia</p><p className="text-sm text-slate-600">Todo se verifica en blockchain Monero.</p></div>
            <div className="nova-card space-y-2 p-4"><p className="text-2xl">⚡</p><p className="font-bold text-slate-900">Participación</p><p className="text-sm text-slate-600">Tu apoyo ayuda a validar proyectos científicos.</p></div>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 space-y-3">
            <h3 className="font-bold text-emerald-900">🛡️ Seguridad: Sin custodia</h3>
            <ul className="space-y-2 text-sm text-emerald-800"><li>✅ PROYECTA nunca toca tu dinero</li><li>✅ Tu view key es pública y no revela fondos</li><li>✅ Tu main address es donde recibes XMR</li><li>✅ Todo verificable en blockchain Monero</li></ul>
          </div>
          <button onClick={() => setStep('form')} className="w-full nova-button-solid py-4 text-lg">Conectar wallet Monero →</button>
        </div>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2"><h2 className="text-3xl font-bold text-slate-900">Conectar wallet</h2><p className="text-slate-600">Ingresa tu dirección Monero y tu view key.</p></div>
          <form onSubmit={handleLogin} className="nova-card space-y-6 p-8">
            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">Dirección Monero principal (95 caracteres)</label><input type="text" value={mainAddress} onChange={(e) => setMainAddress(e.target.value)} placeholder="4AWcSZ..." className="nova-field font-mono text-sm" disabled={loading} /><p className="text-xs text-slate-500">Esta es tu dirección pública para recibir XMR.</p></div>
            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">View key (64 caracteres hexadecimales)</label><input type="password" value={viewKey} onChange={(e) => setViewKey(e.target.value)} placeholder="abcd1234..." className="nova-field font-mono text-sm" disabled={loading} /><p className="text-xs text-slate-500">No requiere el mnemonic, solo la view key pública.</p></div>
            {(error || authError) && <div className="rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-800">{error || authError}</div>}
            <div className="flex gap-3"><button type="button" onClick={() => setStep('intro')} className="nova-button-soft flex-1" disabled={loading}>Volver</button><button type="submit" className="nova-button-solid flex-1" disabled={loading}>{loading ? 'Conectando...' : 'Conectar'}</button></div>
          </form>
        </div>
      </div>
    )
  }

  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 p-4"><div className="w-full max-w-lg space-y-6 text-center"><div className="space-y-4"><div className="text-6xl animate-bounce">✅</div><h2 className="text-3xl font-bold text-emerald-900">¡Conectado!</h2><p className="text-emerald-700">Tu wallet está lista. Redirigiendo...</p></div></div></div>
}
