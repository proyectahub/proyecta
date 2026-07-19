import { CheckCircle2, Cpu, ShieldCheck, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const principles = [
  ['Consentimiento explícito', 'La minería solo comienza después de elegir un proyecto y pulsar iniciar.'],
  ['Destino verificable', 'Cada proyecto muestra la dirección pública Monero que recibe los pagos del pool.'],
  ['Control del participante', 'Puedes ajustar el uso de CPU y detener el proceso en cualquier momento.'],
  ['Datos confirmados', 'El avance financiero usa únicamente saldos confirmados por SupportXMR.'],
]

export function ComputeDonationExperience() {
  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-[34px] border border-rose-100 bg-gradient-to-br from-[#21131f] via-[#7a1e6e] to-[#c026d3] px-8 py-12 text-white shadow-2xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="nova-eyebrow text-rose-100">Minería comunitaria Monero</p>
          <h1 className="nova-title mt-3 text-4xl font-extrabold md:text-5xl">Aporta cómputo a un proyecto verificable</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-rose-50/90">
            Elige una investigación, revisa su dirección pública y decide si quieres aportar RandomX desde el navegador o mediante la aplicación nativa.
          </p>
          <Link to="/projects" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-fuchsia-700 transition hover:bg-rose-50">
            <Zap className="h-4 w-4" /> Ver proyectos
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {principles.map(([title, description], index) => (
          <article key={title} className="nova-card p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-700">
                {index === 0 ? <CheckCircle2 /> : index === 1 ? <ShieldCheck /> : index === 2 ? <Cpu /> : <Users />}
              </span>
              <div><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{description}</p></div>
            </div>
          </article>
        ))}
      </section>

      <section className="nova-card border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950">
        Los hashes locales son telemetría, no dinero. PROYECTA muestra XMR recaudado solo cuando SupportXMR confirma el saldo o las shares del pool.
      </section>
    </div>
  )
}
