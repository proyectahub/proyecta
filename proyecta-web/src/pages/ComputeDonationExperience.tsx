import { useState } from 'react';
import { ChevronDown, CheckCircle, Cpu, HelpCircle, Shield, Users, Zap } from 'lucide-react';
import { useComputeDonation } from '../hooks/useComputeDonation';
import { ComputeDonationPopup } from '../components/ComputeDonationPopup';
import { DirectDonation } from '../components/DirectDonation';

export function ComputeDonationExperience() {
  const { getDonationStatus } = useComputeDonation();
  const donationStatus = getDonationStatus();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const isAlreadyDonating = donationStatus.enabled && donationStatus.percentage > 0;

  const faqItems = [
    {
      question: '¿Por qué una computadora puede ayudar a financiar ciencia?',
      answer:
        'Porque el poder de cómputo puede realizar cálculos verificables que generan una recompensa pequeña. Una sola computadora aporta poco; muchas computadoras conectadas por una causa pueden crear un fondo útil para proyectos reales.',
    },
    {
      question: '¿Esto usa mi dinero?',
      answer:
        'No. No hay cobros, suscripciones ni cargos ocultos. El aporte es una fracción de la capacidad de tu CPU, siempre con tu autorización.',
    },
    {
      question: '¿Puedo controlar cuánto aporto?',
      answer:
        'Sí. Tú eliges el porcentaje de CPU disponible y puedes pausarlo o detenerlo cuando quieras desde el widget flotante.',
    },
    {
      question: '¿Qué datos se recopilan?',
      answer:
        'El sistema trabaja con capacidad de cómputo y métricas técnicas anónimas. No necesita leer archivos, contraseñas, historial de navegación ni información personal.',
    },
    {
      question: '¿Mi computadora se va a poner lenta?',
      answer:
        'Puede sentirse más activa si eliges porcentajes altos. Por eso Proyecta permite empezar bajo, observar el comportamiento y ajustar el porcentaje a lo que te resulte cómodo.',
    },
    {
      question: '¿Por qué se necesita mucha gente?',
      answer:
        'La minería comunitaria funciona como una red: cada equipo suma una parte pequeña. El impacto aparece cuando muchas personas sostienen el mismo proyecto durante tiempo suficiente.',
    },
  ];

  const steps = [
    {
      title: 'Eliges una causa',
      desc: 'La comunidad identifica proyectos de investigación que necesitan apoyo y seguimiento público.',
    },
    {
      title: 'Autorizas tu aporte',
      desc: 'Decides si quieres donar dinero directo o prestar una fracción del cómputo de tu equipo.',
    },
    {
      title: 'Tu CPU suma a la red',
      desc: 'Tu computadora realiza cálculos mientras tú mantienes el control del porcentaje y la duración.',
    },
    {
      title: 'El esfuerzo se acumula',
      desc: 'Muchas contribuciones pequeñas pueden convertirse en financiamiento útil para investigación real.',
    },
  ];

  const trustCards = [
    { icon: Shield, title: 'Consentimiento primero', desc: 'Nada inicia sin que tú lo autorices.' },
    { icon: Cpu, title: 'Control de CPU', desc: 'Puedes empezar bajo, ajustar o detener.' },
    { icon: Users, title: 'Impacto colectivo', desc: 'El valor aparece cuando muchas personas participan.' },
    { icon: CheckCircle, title: 'Transparencia', desc: 'La explicación y el estado del aporte están visibles.' },
  ];

  return (
    <>
      <ComputeDonationPopup
        visible={showPopup}
        triggerSource="interactions"
        onClose={() => setShowPopup(false)}
        onDonate={() => undefined}
      />

      <div className="space-y-10 pb-16">
        <section className="overflow-hidden rounded-[34px] border border-rose-100 bg-gradient-to-br from-[#21131f] via-[#7a1e6e] to-[#c026d3] px-8 py-12 text-white shadow-2xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="nova-eyebrow text-rose-100">Apoyo comunitario para investigación</p>
            <h1 className="nova-title mt-3 text-4xl font-extrabold md:text-5xl">
              Tu computadora puede sumar a una causa científica.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-rose-50/90">
              Proyecta propone una forma cálida y colectiva de sostener ciencia: muchas personas
              aportan un poco de capacidad de cómputo o apoyo directo para que proyectos reales
              tengan más caminos de financiamiento.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DirectDonation />

          <section className="nova-card border-rose-100 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-700">
                <Cpu className="h-5 w-5" />
              </span>
              <div>
                <p className="nova-eyebrow text-fuchsia-600">Aporte con cómputo</p>
                <h2 className="nova-title text-2xl font-extrabold text-slate-900">Prestar capacidad, no pagar</h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Donar cómputo significa permitir que una parte de tu CPU realice cálculos que se suman
              a una red de apoyo. No reemplaza el financiamiento público ni una donación directa,
              pero puede abrir una vía complementaria cuando muchas personas participan.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Tú decides si participas y qué porcentaje aportar.
              </li>
              <li className="flex gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Puedes detenerlo en cualquier momento.
              </li>
              <li className="flex gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                El impacto depende del apoyo colectivo y sostenido.
              </li>
            </ul>

            {isAlreadyDonating ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700">
                <CheckCircle className="h-4 w-4" />
                Estás aportando {donationStatus.percentage}% de tu CPU.
              </div>
            ) : (
              <button
                onClick={() => setShowPopup(true)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-black text-white transition hover:bg-fuchsia-700"
              >
                <Zap className="h-4 w-4" />
                Empezar con cómputo
              </button>
            )}
          </section>
        </div>

        <section>
          <h2 className="nova-title text-3xl font-extrabold text-slate-900">Cómo se convierte en apoyo real</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className="nova-card p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {trustCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="nova-card p-5">
                <Icon className="h-7 w-7 text-fuchsia-600" />
                <h3 className="mt-4 font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.desc}</p>
              </article>
            );
          })}
        </section>

        <section className="nova-card border-rose-100 bg-gradient-to-r from-rose-50 to-fuchsia-50 p-7">
          <h2 className="nova-title text-2xl font-extrabold text-slate-900">La clave es la escala comunitaria</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            Una computadora aislada no financia una investigación completa. Cientos o miles de equipos,
            conectados por una causa común, sí pueden construir una base de apoyo medible. Proyecta
            existe para explicar ese proceso, hacerlo voluntario y vincularlo con proyectos reales.
          </p>
        </section>

        <section>
          <h2 className="nova-title text-3xl font-extrabold text-slate-900">Preguntas frecuentes</h2>
          <div className="mt-6 space-y-2">
            {faqItems.map((item, idx) => (
              <div key={item.question} className="nova-card p-5">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <HelpCircle className="h-4 w-4 shrink-0 text-fuchsia-500" />
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-gradient-to-r from-[#21131f] via-[#7a1e6e] to-[#c026d3] px-8 py-10 text-center text-white">
          <h2 className="nova-title text-3xl font-extrabold">Participar también es cuidar la ciencia</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-rose-50/90">
            El financiamiento comunitario no depende de una sola persona. Depende de una red que decide
            sostener preguntas, datos, experimentos y conocimiento útil para su propia comunidad.
          </p>
          {!isAlreadyDonating && (
            <button
              onClick={() => setShowPopup(true)}
              className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-bold text-fuchsia-700 transition hover:bg-rose-50"
            >
              Empezar a aportar cómputo
            </button>
          )}
        </section>
      </div>
    </>
  );
}
