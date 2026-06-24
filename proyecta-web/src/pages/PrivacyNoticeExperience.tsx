import { Coins, Scale, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { ProyectaBrandLockup, ProyectaMark } from "../components/brand/ProyectaBrand"

const privacySections = [
  {
    title: "Responsable y alcance",
    body: [
      "Proyecta opera este aviso como version predespliegue para el acceso, la gestión de cuentas y la actividad comunitaria dentro de la plataforma.",
      "Este texto funciona como aviso operativo inicial. Antes del lanzamiento público debe completarse con la razon social o nombre de la persona responsable, domicilio para oir y recibir notificaciones, y canal formal para derechos ARCO.",
    ],
  },
  {
    title: "Datos que tratamos",
    body: [
      "Tratamos datos de identificación y contacto como nombre, correo electrónico y contraseña; datos de perfil como imagen, afiliación, bio, ubicación y ORCID si la persona decide vincularlo; y datos de actividad dentro de Proyecta como publicaciones, comentarios, revisiónes, votos y saldo interno CRÉDITOS.",
      "No solicitamos datos personales sensibles de forma intencional. Te pedimos no incluirlos en textos, figuras o archivos que publiques, salvo que exista una base legitima, autorizacion expresa y una razon científica clara.",
    ],
  },
  {
    title: "Finalidades primarias",
    body: [
      "Usamos tus datos para crear y administrar tu cuenta, autenticar tu acceso, mostrar tu perfil, permitir publicaciones, revisiónes, comentarios, votos, sincronización opcional con ORCID, moderación comunitaria, prevención de abuso y funcionamiento del saldo interno CRÉDITOS.",
      "También tratamos la información para atender solicitudes relacionadas con tu cuenta, continuidad técnica del servicio, seguridad operativa y cumplimiento de obligaciones aplicables.",
    ],
  },
  {
    title: "Finalidades secundarias y transferencias",
    body: [
      "Proyecta puede usar datos agregados o minimizados para medir uso del producto, mejorar experiencia, analítica interna y ajustes editoriales. No usaremos tus datos para publicidad ajena a la plataforma sin consentimiento adicional.",
      "Solo transferiremos información cuando sea necesario por mandato legal, para infraestructura y proveedores tecnológicos que apoyen la operación, o cuando la persona usuaria active integraciones como ORCID. No comercializamos bases de datos personales.",
    ],
  },
  {
    title: "Derechos ARCO, revocacion y cambios",
    body: [
      "La persona titular podr solicitar acceso, rectificacion, cancelacion u oposicion respecto de sus datos, asi como pedir la revocacion del consentimiento en los casos permitidos. El canal formal para ello debera publicarse junto con la identidad legal del responsable antes del despliegue público.",
      "Si Proyecta actualiza este aviso, lo comunicar en esta misma ruta y dentro de la experiencia de acceso cuando el cambio sea relevante para la persona usuaria.",
    ],
  },
]

const termsSections = [
  {
    title: "Responsabilidad editorial del autor",
    body: [
      "Cada autora o autor es responsable del contenido que publica, incluidas afirmaciones científicas, figuras, imagenes, citas, datasets, anexos y cualquier material subido a la plataforma.",
      "El equipo creador, editor o moderador de Proyecta no asume como propia la exactitud, originalidad, legalidad ni licitud de cada publicación por el solo hecho de aparecer en el portal. La plataforma podr moderar, retirar o limitar contenido cuando detecte incumplimientos ticos, legales, comunitarios o editoriales.",
    ],
  },
  {
    title: "Reglas de respeto, tica y filosofia de divulgación",
    body: [
      "La plataforma espera una divulgación seria, amable y profesional. Se discuten ideas, métodos, evidencia y argumentos; no se toleran ataques personales, hostigamiento, doxing, discriminación, suplantación ni difusión irresponsable de información sensible o no atribuida.",
      "Las figuras e imagenes deben ser preferentemente originales o contar con atribucin, permiso o base legitima para su uso. La persona autora declara tener derechos suficientes sobre el contenido que comparte.",
    ],
  },
  {
    title: "Cuenta CRÉDITOS",
    body: [
      "CRÉDITOS Fase 1 funciona hoy como incentivo interno verificable dentro de Proyecta. Su saldo no equivale automáticamente a dinero, rendimiento garantizado, instrumento de inversión ni participación societaria.",
      "La asignación, ajuste, congelamiento o pérdida de CRÉDITOS puede depender de reglas de integridad editorial, prevención de fraude, revisiónes internas y futuras actualizaciones del ecosistema. Si en el futuro existiera una migración on-chain o una wallet externa, se requerirá una aceptación específica adicional.",
    ],
  },
]

export default function PrivacyNoticeExperience() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
      <section className="space-y-6">
        <div className="nova-card overflow-hidden p-7 md:p-9">
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <ProyectaBrandLockup
                markSize={56}
                className="max-w-2xl"
                subtitle="Aviso de privacidad y condiciones de cuenta"
                tagline="Marco operativo para datos personales, publicación responsable y CRÉDITOS Fase 1."
              />
              <div className="rounded-[24px] border border-fuchsia-100 bg-fuchsia-50 px-4 py-3 text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-600">
                  Ultima actualizacion
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">21 de abril de 2026</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-amber-200 bg-amber-50/85 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
                Antes del deploy público
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Este aviso ya sirve para el flujo de registro y consentimiento, pero todav?a debe
                completarse con la identidad legal del responsable, domicilio y canal formal para
                derechos ARCO antes del lanzamiento abierto.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                  <ShieldCheck size={20} />
                </div>
                <p className="mt-4 font-bold text-slate-900">Datos tratados con criterio</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Cuenta, perfil, actividad comunitaria y ORCID opcional.
                </p>
              </div>

              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                  <Scale size={20} />
                </div>
                <p className="mt-4 font-bold text-slate-900">Publicación responsable</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Cada autor responde por lo que publica y por los derechos de uso del material.
                </p>
              </div>

              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                  <Coins size={20} />
                </div>
                <p className="mt-4 font-bold text-slate-900">CRÉDITOS Fase 1</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Incentivo interno verificable, no promesa de rendimiento ni instrumento financiero.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section id="privacidad" className="nova-card p-7 md:p-9">
          <div className="space-y-6">
            <div>
              <p className="nova-eyebrow text-fuchsia-600">Privacidad</p>
              <h1 className="nova-title mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
                Aviso de privacidad operativo para Proyecta
              </h1>
            </div>

            <div className="space-y-6">
              {privacySections.map((section) => (
                <article key={section.title} className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6">
                  <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                  <div className="mt-3 space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-8 text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="condiciones" className="nova-card p-7 md:p-9">
          <div className="space-y-6">
            <div>
              <p className="nova-eyebrow text-fuchsia-600">Condiciones editoriales y CRÉDITOS</p>
              <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
                Publicar en Proyecta implica responsabilidad, trazabilidad y criterio
              </h2>
            </div>

            <div className="space-y-6">
              {termsSections.map((section) => (
                <article key={section.title} className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6">
                  <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                  <div className="mt-3 space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-8 text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f172a,#17306c_55%,#255cff)] p-6 text-white shadow-2xl shadow-slate-900/20">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <p className="nova-eyebrow text-white/70">Resumen de aceptación</p>
              <ProyectaMark size={52} glow={false} />
            </div>
            <h2 className="nova-title text-4xl font-extrabold leading-tight">
              Lo que acepta cada persona antes de crear cuenta.
            </h2>
            <div className="space-y-3 text-sm leading-7 text-white/80">
              <p>1. Tratamiento de datos para cuenta, perfil y actividad comunitaria.</p>
              <p>2. Reglas ticas de publicación, comentario y revisión.</p>
              <p>3. Responsabilidad del autor sobre contenido, figuras y afirmaciones.</p>
              <p>4. Funcionamiento interno y no financiero de CRÉDITOS Fase 1.</p>
            </div>
          </div>
        </section>

        <section className="nova-card p-6">
          <div className="space-y-4">
            <p className="nova-eyebrow">Ruta recomendada</p>
            <h3 className="nova-title text-2xl font-extrabold text-slate-900">
              Leer el aviso y volver al registro
            </h3>
            <p className="text-sm leading-7 text-slate-500">
              Las casillas de aceptación en el registro deben quedar sin marcar por defecto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="nova-button-solid">
                Volver a registro
              </Link>
              <Link to="/" className="nova-button-soft">
                Volver al feed
              </Link>
            </div>
          </div>
        </section>

        <section className="nova-card p-6">
          <div className="space-y-4">
            <p className="nova-eyebrow">Checklist legal mínimo</p>
            <div className="space-y-3 text-sm leading-7 text-slate-600">
              <div className="rounded-[22px] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Identidad y domicilio del responsable</p>
                <p className="mt-2">Pendiente de completar con los datos reales antes del deploy.</p>
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Canal ARCO y revocacion</p>
                <p className="mt-2">Debe publicarse un correo o mecanismo formal verificable.</p>
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Versiones y evidencia de aceptación</p>
                <p className="mt-2">El registro ya deja constancia de la fecha y version aceptada.</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  )
}
