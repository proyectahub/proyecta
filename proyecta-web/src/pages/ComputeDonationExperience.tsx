import { useState } from 'react';
import { ChevronDown, Cpu, Shield, Zap, HelpCircle, TrendingUp, CheckCircle } from 'lucide-react';
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
      question: '¿Cuánta energía consume',
      answer:
        'CoinImp usa únicamente CPU disponible sin usar. Si tu computadora está en reposo, el impacto es mínimo. Puedes controlar el porcentaje exacto desde el popup.',
    },
    {
      question: '¿Mi computadora se va a ralentizar',
      answer:
        'No. Cuando usas el navegador activamente (leyendo, buscando, escribiendo), el minero se pausa automáticamente para no interferir. Solo usa recursos cuando tu sistema está inactivo.',
    },
    {
      question: '¿Qué información recopilan',
      answer:
        'CoinImp NO recopila datos personales, historial de navegación, ni información sensible. Solo monitorea recursos de CPU disponibles. Todo es anónimo.',
    },
    {
      question: '¿Es seguro ¿Es un virus',
      answer:
        'CoinImp es legítimo y usado por miles de sitios. El código es auditable. Nuestro sitio solo carga el script cuando TÚ lo autorizas voluntariamente.',
    },
    {
      question: '¿Puedo pausar o detener en cualquier momento',
      answer:
        'Sí, completamente. Puedes detenerlo desde el widget flotante que aparece en la esquina inferior derecha mientras estás donando.',
    },
    {
      question: '¿A dónde va el dinero',
      answer:
        'El 100% financia: servidores, dominio del sitio y mantenimiento de infraestructura. Esto permite que Proyecta sea gratis para todos.',
    },
    {
      question: '¿Cuánto dinero genero',
      answer:
        'Varía según tu CPU. El minero genera MintMe (MINTME), una criptomoneda CPU-mineable. El valor acumulado se puede monitorear en el dashboard de CoinImp (coinimp.com) y convertir a dinero real cuando alcanza el mínimo de pago.',
    },
    {
      question: '¿Puedo donar menos porcentaje',
      answer:
        'Sí. Puedes elegir entre 10%, 20%, 30%... hasta 100%. Un porcentaje menor significa menos impacto en tu sistema.',
    },
  ];

  const steps = [
    {
      n: '1',
      title: 'Autorizas la donación',
      desc: 'Das click en "Donar ahora" y eliges el porcentaje de CPU',
    },
    {
      n: '2',
      title: 'Minería en segundo plano',
      desc: 'CoinImp usa tu CPU disponible para resolver cálculos criptográficos. Se pausa cuando navegas activamente.',
    },
    {
      n: '3',
      title: 'Se genera MintMe (MINTME)',
      desc: 'Criptomoneda CPU-mineable resultado de los cálculos. Una fracción por cada cálculo completado.',
    },
    {
      n: '4',
      title: 'Se vende en mercados reales',
      desc: 'El MintMe generado se puede convertir a dinero fiduciario (USD, EUR, etc.) o a otras criptomonedas.',
    },
    {
      n: '5',
      title: 'Financia Proyecta',
      desc: 'El dinero paga servidores, dominio y mantenimiento. 100% de la comunidad te beneficia.',
    },
  ];

  const infoCards = [
    { icon: Cpu, title: 'Tu CPU', desc: 'Recursos que tu equipo no está usando' },
    { icon: Zap, title: 'Minería', desc: 'Cálculos matemáticos anónimos en segundo plano' },
    { icon: TrendingUp, title: 'MintMe (MINTME)', desc: 'Criptomoneda CPU-mineable generada automáticamente' },
    { icon: Shield, title: 'Tu privacidad', desc: 'Sin datos personales, sin tracking' },
  ];

  return (
    <>
      {/* Popup */}
      <ComputeDonationPopup
        visible={showPopup}
        triggerSource="interactions"
        onClose={() => setShowPopup(false)}
      />

      <div className="space-y-10 pb-16">

        {/* Hero */}
        <div className="rounded-[34px] bg-gradient-to-br from-slate-900 via-fuchsia-950 to-slate-900 px-8 py-12 text-white text-center shadow-2xl">
          <div className="text-5xl mb-4">🔬</div>
          <h1 className="nova-title text-4xl font-extrabold mb-4">
            Dos formas de apoyar la ciencia en comunidad
          </h1>
          <p className="text-fuchsia-100 max-w-2xl mx-auto text-lg leading-relaxed">
            El apoyo mutuo sostiene la investigación. Puedes aportar de dos maneras, siempre
            <strong> voluntarias</strong>: donando <strong>dinero directo</strong> (la vía más efectiva)
            o donando <strong>poder de cómputo</strong> de tu equipo mientras navegas. Tú eliges.
          </p>
        </div>

        {/* Las dos vías del modelo híbrido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Vía 1: dinero directo (principal) */}
          <DirectDonation />

          {/* Vía 2: cómputo (complemento) */}
          <div className="nova-card border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Cpu className="h-5 w-5" />
              </span>
              <div>
                <h2 className="nova-title text-2xl font-extrabold text-slate-900">Donar cómputo</h2>
                <p className="text-sm text-slate-500">Sin gastar dinero: prestas CPU que no estás usando</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Tu navegador realiza cálculos en segundo plano que generan una pequeña recompensa
              destinada a la investigación. Es <strong>opcional</strong>, se ejecuta solo con tu
              autorización y puedes detenerlo cuando quieras.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> No se cobra nada ni se pide ningún pago.</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Eliges el porcentaje de CPU (10% – 100%).</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Anónimo: sin datos personales ni tracking.</li>
            </ul>
            {isAlreadyDonating ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-5 py-2.5 text-green-700 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Ya estás donando {donationStatus.percentage}% de tu CPU. ¡Gracias!
              </div>
            ) : (
              <button
                onClick={() => setShowPopup(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
              >
                <Zap className="h-4 w-4" />
                Empezar a donar cómputo
              </button>
            )}
            <p className="mt-3 text-center text-xs text-slate-400">
              Más abajo explicamos en detalle cómo funciona la donación de cómputo.
            </p>
          </div>
        </div>

        {/* Diferencia clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="nova-card border-red-200 bg-red-50 text-center py-8">
            <div className="text-4xl mb-3">💸</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">NO donas dinero</h3>
            <p className="text-red-700 text-sm">No se cobra nada, no se pide ningún pago, no hay suscripción.</p>
          </div>
          <div className="nova-card border-green-200 bg-green-50 text-center py-8">
            <div className="text-4xl mb-3">💻</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">SÍ donas cómputo</h3>
            <p className="text-green-700 text-sm">Usas una fracción de la CPU de tu equipo mientras navegas, sin interrupciones.</p>
          </div>
        </div>

        {/* Cómo funciona */}
        <div>
          <h2 className="nova-title text-3xl font-extrabold mb-6">¿Cómo funciona</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {infoCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="nova-card text-center py-6">
                  <Icon className="w-8 h-8 text-fuchsia-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">{card.title}</h4>
                  <p className="text-xs text-slate-500">{card.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="nova-card">
            <ol className="space-y-5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-fuchsia-600 flex items-center justify-center font-bold text-white text-sm">
                    {step.n}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-600 mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Datos & privacidad */}
        <div>
          <h2 className="nova-title text-3xl font-extrabold mb-6">¿Qué datos se recopilan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nova-card border-green-200 bg-green-50">
              <h3 className="text-base font-bold text-green-900 mb-3 flex items-center gap-2">
                <span className="text-green-600">✅</span> Esto SÍ (recursos anónimos)
              </h3>
              <ul className="space-y-1.5 text-sm text-green-800">
                <li>• Recursos de CPU disponibles</li>
                <li>• Potencia computacional del equipo</li>
                <li>• Hashes criptográficos (anónimos)</li>
                <li>• Geolocalización aproximada (país)</li>
              </ul>
            </div>
            <div className="nova-card border-red-200 bg-red-50">
              <h3 className="text-base font-bold text-red-900 mb-3 flex items-center gap-2">
                <span className="text-red-600">❌</span> Esto NO (tu privacidad es intocable)
              </h3>
              <ul className="space-y-1.5 text-sm text-red-800">
                <li>• Datos personales (nombre, email, etc.)</li>
                <li>• Historial de navegación</li>
                <li>• Contraseñas o credenciales</li>
                <li>• Tu identidad (completamente anónimo)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Control */}
        <div className="nova-card">
          <h2 className="nova-title text-2xl font-extrabold mb-4">¿Puedo pausar o detener</h2>
          <p className="text-slate-700 mb-4">
            <strong>Absolutamente sí.</strong> Cuando estás donando, aparece un widget
            en la esquina inferior derecha de la pantalla desde donde puedes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Ver hashes y velocidad en tiempo real', 'Minimizar el widget si molesta', 'Detener la donación con un click'].map((item, i) => (
              <div key={i} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Impacto */}
        <div className="nova-card bg-gradient-to-r from-fuchsia-50 to-purple-50 border-fuchsia-200">
          <h2 className="nova-title text-2xl font-extrabold mb-6 text-center">¿Cuál es el impacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-fuchsia-600 mb-1">$0.01–0.05</div>
              <p className="text-sm text-slate-600">Por hora con CPU promedio al 50%</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-purple-600 mb-1">$7–36</div>
              <p className="text-sm text-slate-600">Por mes con el equipo siempre activo</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-green-600 mb-1">100%</div>
              <p className="text-sm text-slate-600">De lo generado va a mantener Proyecta</p>
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-6 border-t border-fuchsia-200 pt-4">
            Con 1000 donantes activos: suficiente para cubrir servidores, dominio y ancho de banda. <strong>Sin publicidad.</strong>
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="nova-title text-3xl font-extrabold mb-6">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {faqItems.map((item, idx) => (
              <div key={idx} className="nova-card">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                    <HelpCircle className="w-4 h-4 text-fuchsia-500 flex-shrink-0" />
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <p className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="rounded-[28px] bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-center px-8 py-10">
          <h2 className="nova-title text-3xl font-extrabold mb-3">¿Listo para ayudar</h2>
          <p className="text-fuchsia-100 mb-6 max-w-lg mx-auto">
            Cada donante hace posible que Proyecta permanezca gratuita y sin publicidad para toda la comunidad científica.
          </p>
          {isAlreadyDonating ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-6 py-3 font-semibold">
              <CheckCircle className="w-5 h-5" />
              ¡Ya eres parte! Gracias por donar
            </div>
          ) : (
            <button
              onClick={() => setShowPopup(true)}
              className="bg-white text-fuchsia-700 font-bold py-3 px-8 rounded-full hover:bg-fuchsia-50 transition-colors text-base"
            >
              ⚡ Empezar a donar ahora
            </button>
          )}
        </div>

      </div>
    </>
  );
}
