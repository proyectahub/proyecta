import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { API_BASE } from "../lib/api"

const SESSION_STORAGE_KEY = "proyecta-session-token"

export default function OrcidCallback() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const code = params.get("code")
    const error = params.get("error")

    if (error) {
      toast.error("No fue posible completar el acceso con ORCID.")
      navigate("/login")
      return
    }

    if (!token && code) {
      const backendUrl = new URL(`${API_BASE}/api/oauth/orcid/callback`)
      for (const [key, value] of params.entries()) {
        backendUrl.searchParams.set(key, value)
      }
      window.location.replace(backendUrl.toString())
      return
    }

    if (!token) {
      toast.error("ORCID no envio una sesion valida.")
      navigate("/login")
      return
    }

    async function completeOAuthLogin() {
      window.localStorage.setItem(SESSION_STORAGE_KEY, token)
      await refreshUser()
      const response = await fetch(`${API_BASE}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      toast.success("Sesion iniciada con ORCID.")
      if (data.user?.id) {
        navigate(`/profile/${data.user.id}`)
        return
      }

      navigate("/")
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
