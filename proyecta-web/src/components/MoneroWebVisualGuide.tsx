import { ArrowRight, ExternalLink, ShieldCheck, Sparkles, Wallet } from 'lucide-react'

type MoneroWebVisualGuideProps = {
  onOpenMoneroWeb: () => void
  onOpenVerification: () => void
  onScrollToCapture?: () => void
}

const guideSteps = [
  {
    step: '01',
    title: 'Abrir la cartera',
    text: 'Pulsa Open Wallet para entrar al flujo principal. Esta es la pantalla de inicio: desde aquí empiezas la cartera que funcionará dentro del navegador.',
    image: '/page-assets/banners/monero-web-guide-hero.png',
    alt: 'Pantalla inicial de Monero Web con el botón Open Wallet',
    detail:
      'Aquí solo estás entrando al panel. No copies nada todavía. Lo importante es que verifiques el dominio y después pulses Open Wallet.',
  },
  {
    step: '02',
    title: 'Crear una wallet nueva',
    text: 'En la segunda pantalla eliges Create New y el idioma de la semilla. Después pulsas Generate New Wallet para generar una cartera nueva.',
    image: '/page-assets/banners/monero-web-guide-create.png',
    alt: 'Pantalla de creación de wallet nueva en Monero Web',
    detail:
      'Si ya tenías una wallet, aquí también puedes restaurarla o importar una clave privada. Para empezar desde cero, lo normal es Create New.',
  },
  {
    step: '03',
    title: 'Guardar la semilla y claves',
    text: 'La tercera captura muestra la seed phrase, la dirección pública, la clave privada de gasto y la clave privada de vista.',
    image: '/page-assets/banners/monero-web-guide-seed.png',
    alt: 'Pantalla con seed phrase, dirección y claves privadas de Monero Web',
    detail:
      'Lo esencial es guardar la seed phrase fuera del navegador, en papel o en un lugar secreto. La dirección pública se copia al perfil; las claves privadas se guardan solo si sabes exactamente por qué las necesitas.',
  },
  {
    step: '04',
    title: 'Abrir el dashboard',
    text: 'La cuarta captura enseña el wallet dashboard: balance, enviar, recibir y red. Ese es el panel que confirma que la cartera quedó lista.',
    image: '/page-assets/banners/monero-web-guide-dashboard.png',
    alt: 'Wallet dashboard de Monero Web con balance, enviar y recibir',
    detail:
      'Aquí no necesitas copiar nada nuevo. Solo confirmar que ves tu dirección, el saldo y los accesos de enviar o recibir. Desde PROYECTA, lo que te interesa conservar es la dirección pública.',
  },
]

export function MoneroWebVisualGuide({
  onOpenMoneroWeb,
  onOpenVerification,
  onScrollToCapture,
}: MoneroWebVisualGuideProps) {
  return (
    <section
      id="guia-visual"
      className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-600">Guía visual</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Monero Web paso a paso dentro de PROYECTA
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Esta guía está pensada para que el flujo se entienda sin confusión: entras a Monero Web, creas la wallet, guardas la semilla y después llevas la dirección pública de vuelta al perfil.
          </p>
        </div>
        <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-700">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onOpenMoneroWeb} className="nova-button-solid px-4 py-2 text-sm">
          Abrir Monero Web
        </button>
        <button type="button" onClick={onOpenVerification} className="nova-button-soft px-4 py-2 text-sm">
          Verificación
        </button>
        {onScrollToCapture ? (
          <button type="button" onClick={onScrollToCapture} className="nova-button-soft px-4 py-2 text-sm">
            Ir al paso de captura
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {guideSteps.map((item) => (
          <article key={item.step} className="overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Captura {item.step}
              </p>
            </div>
            <img src={item.image} alt={item.alt} className="h-auto w-full bg-[#fff7fb] object-cover" />
            <div className="space-y-3 p-4 md:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-100 text-sm font-black text-fuchsia-700">
                  {item.step}
                </div>
                <h3 className="text-base font-black text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm leading-7 text-slate-600">{item.text}</p>
              <div className="rounded-[18px] border border-fuchsia-200 bg-fuchsia-50/80 p-4 text-sm leading-7 text-fuchsia-900">
                <strong className="block text-fuchsia-900">Qué debes hacer aquí</strong>
                {item.detail}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[24px] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 p-5">
          <div className="flex items-center gap-2 text-fuchsia-700">
            <Wallet className="h-4 w-4" />
            <p className="text-sm font-bold">Qué copiar y qué guardar</p>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">1</span>
              <span>
                <strong className="text-slate-900">Seed phrase.</strong> Guárdala fuera del navegador. Es la forma principal de recuperar la wallet en otro equipo o más adelante.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">2</span>
              <span>
                <strong className="text-slate-900">Dirección pública.</strong> Esta sí se copia al perfil de PROYECTA y es la que usarán los proyectos para enviarte XMR.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">3</span>
              <span>
                <strong className="text-slate-900">Clave privada de gasto y de vista.</strong> Son datos sensibles. Solo guárdalos si entiendes que sirven para recuperación avanzada o gestión específica.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">4</span>
              <span>
                <strong className="text-slate-900">Dashboard.</strong> Confirma que ves el balance, recibir y enviar. No hace falta copiar nada nuevo aquí.
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold">Regla práctica</p>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            En PROYECTA solo necesitamos la dirección pública y la preferencia del modo. La seed phrase y las claves privadas se conservan fuera del portal, en un lugar seguro.
          </p>
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            <strong className="block text-slate-900">Resumen del flujo</strong>
            Entra al sitio, crea la wallet, guarda la semilla, copia la dirección pública y vuelve al perfil para vincularla al proyecto.
          </div>
          <div className="rounded-[18px] border border-fuchsia-200 bg-fuchsia-50/70 p-4 text-sm leading-7 text-fuchsia-800">
            Si cambias de dispositivo, la seed phrase te permite recuperar la wallet y el dashboard volverá a mostrar el mismo balance cuando sincronices de nuevo.
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onOpenMoneroWeb} className="nova-button-solid px-4 py-2 text-sm">
              Abrir panel aislado
            </button>
            <button type="button" onClick={onOpenVerification} className="nova-button-soft px-4 py-2 text-sm inline-flex items-center gap-2">
              Ver guía externa
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ArrowRight className="h-4 w-4" />
            Puedes volver a esta guía cuando necesites verificar el proceso completo o explicar el flujo a otra persona.
          </div>
        </div>
      </div>
    </section>
  )
}
