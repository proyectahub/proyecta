import { FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react"
import { toast } from "react-hot-toast"
import { ProyectaMark } from "../components/brand/ProyectaBrand"
import { API_BASE, normalizeApiError, parseApiJson } from "../lib/api"

export default function PasswordRecoveryExperience() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewResetLink, setPreviewResetLink] = useState("")

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Escribe el correo de tu cuenta.")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Buscando tu cuenta...")

    try {
      const response = await fetch(`${API_BASE}/api/password/forgot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await parseApiJson(response)

      if (!response.ok) {
        throw new Error(data.error || "No fue posible iniciar la recuperación.")
      }

      setPreviewResetLink(String(data.previewResetLink ?? ""))
      toast.success(
        data.message ||
          "Si el correo existe en Proyecta, enviaremos un enlace temporal para restablecer la contraseña.",
        { id: toastId },
      )
    } catch (error) {
      toast.error(normalizeApiError(error).message, { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_460px]">
      <section className="nova-shell hidden h-full overflow-hidden lg:block">
        <div className="grid h-full grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between bg-[linear-gradient(135deg,#10224f,#17306c_52%,#255cff)] p-10 text-white">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                <KeyRound size={14} />
                Recuperacion segura
              </div>
              <div className="space-y-4">
                <h1 className="nova-title max-w-xl text-5xl font-extrabold tracking-tight">
                  Recuperar tu acceso también debe sentirse claro y confiable.
                </h1>
                <p className="max-w-xl text-base leading-8 text-white/80">
                  Si ya construiste una cuenta en Proyecta, también debes poder volver a ella
                  sin fricción. Aquí protegemos tu acceso con un enlace temporal y una recuperación
                  pensada para una comunidad verificable.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                  Paso 1
                </p>
                <h2 className="mt-3 text-xl font-bold">Escribe tu correo</h2>
                <p className="mt-2 text-sm leading-7 text-white/75">
                  Buscamos la cuenta asociada y preparamos un enlace temporal de recuperación.
                </p>
              </article>
              <article className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                  Paso 2
                </p>
                <h2 className="mt-3 text-xl font-bold">Restablece y vuelve</h2>
                <p className="mt-2 text-sm leading-7 text-white/75">
                  Creas una nueva contraseña y recuperas tu perfil, tus publicaciones y tu
                  trayectoria en la comunidad.
                </p>
              </article>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-white/75 p-8">
            <div className="space-y-4">
              <p className="nova-eyebrow">Que cuidamos aqu</p>
              <article className="rounded-[24px] bg-white/90 p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="font-bold text-slate-900">Enlace temporal y un solo uso</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  La recuperación usa un enlace limitado en el tiempo para reducir riesgos y cuidar
                  el acceso a tu cuenta.
                </p>
              </article>
              <article className="rounded-[24px] bg-white/90 p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                  <Mail size={18} />
                </div>
                <h2 className="font-bold text-slate-900">Correo como canal principal</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  El acceso principal de Proyecta sigue siendo por correo. ORCID permanece como
                  sincronización opcional para enriquecer tu perfil.
                </p>
              </article>
            </div>

            <p className="nova-editorial text-2xl italic text-slate-500">
              "Una comunidad confiable también cuida el regreso de quienes la construyen."
            </p>
          </div>
        </div>
      </section>

      <section className="nova-card mx-auto w-full max-w-[460px] p-7 md:p-9">
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <ProyectaMark size={72} className="mx-auto" />
            <div className="space-y-2">
              <p className="nova-eyebrow">Recuperar acceso</p>
              <h1 className="nova-title text-3xl font-extrabold text-slate-900">
                Olvidaste tu contraseña
              </h1>
              <p className="text-sm leading-7 text-slate-500">
                Escribe el correo con el que entraste a Proyecta. Si esa cuenta existe,
                enviaremos un enlace temporal para restablecer tu acceso.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">Correo de tu cuenta</span>
              <input
                type="email"
                placeholder="tu@universidad.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="nova-field rounded-[20px]"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="nova-button-solid w-full justify-center disabled:opacity-60"
            >
              Enviar enlace de recuperación
              <ArrowRight size={16} />
            </button>
          </form>

          {previewResetLink ? (
            <div className="rounded-[22px] border border-fuchsia-100 bg-fuchsia-50/80 p-4 text-sm leading-7 text-slate-600">
              <p className="font-semibold text-slate-900">Enlace temporal de prueba</p>
              <p className="mt-2">
                Como el servidor actual no tiene correo configurado, puedes continuar la prueba con
                este enlace:
              </p>
              <a
                href={previewResetLink}
                className="mt-3 block break-all font-semibold text-fuchsia-600 hover:text-fuchsia-700"
              >
                {previewResetLink}
              </a>
            </div>
          ) : null}

          <div className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-500">
            Si no recuerdas si ya te registraste, puedes intentar con tu correo principal. Por
            seguridad, Proyecta no confirma públicamente si una cuenta existe o no.
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
