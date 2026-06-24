import { FormEvent, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react"
import { toast } from "react-hot-toast"
import { ProyectaMark } from "../components/brand/ProyectaBrand"
import { API_BASE, normalizeApiError, parseApiJson } from "../lib/api"

type TokenStatus = "checking" | "valid" | "invalid"

export default function PasswordResetExperience() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = String(searchParams.get("token") ?? "").trim()
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>(token ? "checking" : "invalid")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const validateToken = async () => {
      if (!token) {
        setTokenStatus("invalid")
        return
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/password/reset/validate?token=${encodeURIComponent(token)}`,
        )
        const data = await parseApiJson(response)

        if (!response.ok || !data.valid) {
          throw new Error(data.error || "El enlace ya no es valido.")
        }

        if (isMounted) {
          setTokenStatus("valid")
        }
      } catch {
        if (isMounted) {
          setTokenStatus("invalid")
        }
      }
    }

    void validateToken()

    return () => {
      isMounted = false
    }
  }, [token])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Completa ambos campos.")
      return
    }

    if (password.length < 6) {
      toast.error("La nueva contraseña debe tener mínimo 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Actualizando contraseña...")

    try {
      const response = await fetch(`${API_BASE}/api/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await parseApiJson(response)

      if (!response.ok) {
        throw new Error(data.error || "No fue posible restablecer tu contraseña.")
      }

      toast.success(
        data.message ||
          "Tu contraseña ya fue actualizada. Ahora puedes iniciar sesión con la nueva clave.",
        { id: toastId },
      )
      navigate("/login")
    } catch (error) {
      toast.error(normalizeApiError(error).message, { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
      <section className="nova-shell hidden h-full overflow-hidden lg:block">
        <div className="flex h-full flex-col justify-between bg-[linear-gradient(135deg,#10224f,#17306c_52%,#255cff)] p-10 text-white">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
              <KeyRound size={14} />
              Restablecer acceso
            </div>
            <div className="space-y-4">
              <h1 className="nova-title max-w-xl text-5xl font-extrabold tracking-tight">
                Vuelve a tu cuenta y sigue construyendo tu lugar en Proyecta.
              </h1>
              <p className="max-w-xl text-base leading-8 text-white/80">
                Restablecer la contraseña es volver al feed, a tus publicaciones, a tus revisiónes
                y a tu perfil dentro de la comunidad. El enlace es temporal para proteger tu cuenta
                y mantener una recuperación responsable.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                Cuenta protegida
              </p>
              <h2 className="mt-3 text-xl font-bold">Enlace temporal</h2>
              <p className="mt-2 text-sm leading-7 text-white/75">
                Cada enlace de recuperación tiene vigencia limitada para cuidar el acceso a tu
                perfil y tu historial editorial.
              </p>
            </article>
            <article className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                Regreso rapido
              </p>
              <h2 className="mt-3 text-xl font-bold">Nueva contraseña</h2>
              <p className="mt-2 text-sm leading-7 text-white/75">
                En cuanto la actualices, podrás entrar de nuevo y seguir publicando, leyendo y
                revisando dentro de Proyecta.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="nova-card mx-auto w-full max-w-[460px] p-7 md:p-9">
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <ProyectaMark size={72} className="mx-auto" />
            <div className="space-y-2">
              <p className="nova-eyebrow">Restablecer contraseña</p>
              <h1 className="nova-title text-3xl font-extrabold text-slate-900">
                Crea una nueva clave
              </h1>
              <p className="text-sm leading-7 text-slate-500">
                Elige una nueva contraseña para volver a tu cuenta y retomar tu actividad dentro de
                la comunidad.
              </p>
            </div>
          </div>

          {tokenStatus === "checking" ? (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-500">
              Estamos vávalidando tu enlace de recuperación...
            </div>
          ) : null}

          {tokenStatus === "invalid" ? (
            <div className="space-y-4 rounded-[24px] border border-amber-100 bg-amber-50/80 p-5 text-sm leading-7 text-slate-600">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">El enlace ya no es valido</p>
                <p className="mt-2">
                  Puede haber expirado o ya fue usado. Solicita una recuperación nueva para seguir.
                </p>
              </div>
              <Link to="/recuperar-contraseña" className="nova-button-soft justify-center">
                Solicitar un nuevo enlace
              </Link>
            </div>
          ) : null}

          {tokenStatus === "valid" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">
                  Nueva contraseña
                </span>
                <input
                  type="password"
                  placeholder="Mnimo 6 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="nova-field rounded-[20px]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">
                  Confirmar contraseña
                </span>
                <input
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="nova-field rounded-[20px]"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="nova-button-solid w-full justify-center disabled:opacity-60"
              >
                Actualizar contraseña
                <ArrowRight size={16} />
              </button>
            </form>
          ) : null}

          <div className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-500">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                <CheckCircle2 size={16} />
              </span>
              <p>
                Cuando cambies tu contraseña cerraremos las sesiónes anteriores para proteger mejor
                tu cuenta.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700">
              Volver al acceso
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
