import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const SESSION_STORAGE_KEY = 'proyecta-session-token'

export default function OrcidCallback() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      toast.error('No fue posible completar el acceso con ORCID.')
      navigate('/login')
      return
    }

    if (!token) {
      toast.error('ORCID no envió una sesión válida.')
      navigate('/login')
      return
    }

    const sessionToken = token

    async function completeOAuthLogin() {
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionToken)
      await refreshUser()
      toast.success('Sesión iniciada con ORCID.')
      navigate('/profile')
    }

    void completeOAuthLogin()
  }, [navigate, refreshUser])

  return (
    <div className="nova-card mx-auto mt-10 max-w-xl p-8 text-center">
      <p className="nova-eyebrow">ORCID</p>
      <h1 className="nova-title mt-3 text-3xl font-extrabold text-slate-900">Conectando tu identidad...</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        Estamos finalizando tu acceso seguro para entrar a Proyecta.
      </p>
    </div>
  )
}
