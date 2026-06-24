import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'

export function LoginWithEmailExperience() {
  const navigate = useNavigate()
  const { login, loading, error: authError } = useTraditionalAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email requerido')
      return
    }

    if (!password.trim()) {
      setError('Password requerida')
      return
    }

    try {
      await login(email, password)
      setStep('success')
      setTimeout(() => navigate('/profile'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en login')
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl">OK</div>
            <h2 className="text-3xl font-bold text-emerald-900">Bienvenido!</h2>
            <p className="text-emerald-700">Redirigiendo a tu perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">PROYECTA</h1>
          <p className="text-slate-600">Inicia sesion en tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="nova-card p-8 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="nova-field"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu password"
              className="nova-field"
              disabled={loading}
            />
          </div>

          {(error || authError) && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-800 text-sm">
              {error || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="nova-button-solid w-full py-3"
          >
            {loading ? 'Iniciando sesion...' : 'Inicia sesion'}
          </button>

          <p className="text-sm text-slate-600 text-center">
            No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-blue-600 underline"
            >
              Registrate aqui
            </button>
          </p>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-bold mb-2">Acceso a PROYECTA:</p>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>Explorar proyectos de investigacion</li>
            <li>Apoyar con donaciones o validaciones</li>
            <li>Publicar tus propios proyectos</li>
            <li>Conectar wallet Monero (opcional)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
