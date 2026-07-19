import { ArrowRight, ExternalLink, ShieldCheck, Sparkles, Wallet, Repeat2, BadgeDollarSign } from 'lucide-react'

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
      'Aquí solo estás entrando al panel. Verifica el dominio y después pulsa Open Wallet. No copies nada todavía.',
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
      'Lo esencial es guardar la seed phrase fuera del navegador, en papel o en un lugar secreto. La dirección pública se copia al perfil; las claves privadas solo se conservan si sabes por qué las necesitas.',
  },
  {
    step: '04',
    title: 'Abrir el dashboard',
    text: 'La cuarta captura enseña el wallet dashboard: balance, enviar, recibir y red. Ese es el panel que confirma que la cartera quedó lista.',
    image: '/page-assets/banners/monero-web-guide-dashboard.png',
    alt: 'Wallet dashboard de Monero Web con balance, enviar y recibir',
    detail:
      'Aquí no necesitas copiar nada nuevo. Solo confirma que ves tu dirección, el saldo y los accesos de enviar o recibir. Desde PROYECTA, lo que te interesa conservar es la dirección pública.',
  },
]

const swapCards = [
  {
    title: 'Abrir Swap crypto',
    image: '/page-assets/banners/monero-web-swap-nav.png',
    alt: 'Menú de Monero Web con la opción Swap crypto',
    text:
      'Desde el menú principal entras a Swap crypto para cambiar Monero por otro activo o preparar una conversión posterior.',
  },
  {
    title: 'Elegir el modo Swap',
    image: '/page-assets/banners/monero-web-swap-exchange.png',
    alt: 'Modal de intercambio con pestaña Swap activa',
    text:
      'En la pestaña Swap eliges lo que envías y lo que recibes. Revisa siempre el mínimo, las comisiones y el destino antes de continuar.',
  },
  {
    title: 'Usar Buy/Sell',
    image: '/page-assets/banners/monero-web-swap-buy-sell.png',
    alt: 'Modal de intercambio con pestaña Buy/Sell activa',
    text:
      'La pestaña Buy/Sell sirve para convertir Monero a otra moneda o para retirar valor en un proveedor externo. Verifica el método y el destino final.',
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

      <div className="grid gap-4 rounded-[24px] border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-white to-rose-50 p-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-2">
          <p className="text-sm font-bold text-fuchsia-900">Antes de empezar</p>
          <p className="text-sm leading-7 text-slate-700">
            Usa Monero Web solo como panel aislado para crear o revisar la wallet. La dirección pública es la que vuelve a PROYECTA; la seed phrase y las claves privadas se quedan fuera del portal.
          </p>
        </div>
        <div className="rounded-[20px] border border-fuchsia-200 bg-white/90 p-4 text-sm leading-7 text-fuchsia-900 shadow-sm">
          <strong className="block text-fuchsia-950">Seguridad primero</strong>
          La seed phrase no se pega en el portal. Se guarda en papel o en un lugar seguro y solo la dirección pública se vincula al perfil.
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

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
        <p className="font-bold text-slate-900">Qué hace el botón “Abrir panel aislado”</p>
        <p className="mt-2">
          Abre Monero Web en una pestaña separada para que puedas crear o revisar la wallet con tranquilidad. Después vuelves a PROYECTA y pegas la dirección pública en el perfil o en el proyecto.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {guideSteps.map((item) => (
          <article key={item.step} className="overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Paso {Number(item.step)}</p>
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

        <div className="space-y-4 rounded-[24px] border-2 border-fuchsia-300 bg-fuchsia-50 p-5 shadow-[0_18px_50px_rgba(192,38,211,0.12)]">
          <div className="flex items-center gap-2 text-fuchsia-900">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-black uppercase tracking-[0.14em]">Seguridad de la wallet</p>
          </div>
          <ul className="space-y-2 text-sm leading-7 text-fuchsia-950">
            <li>No compartas la seed phrase ni la clave privada.</li>
            <li>Guarda la frase de recuperación fuera del navegador.</li>
            <li>La dirección pública sí puede copiarse al perfil.</li>
            <li>Si usas una wallet nueva, verifica bien antes de guardar.</li>
          </ul>
          <div className="rounded-[18px] border border-fuchsia-200 bg-white/80 p-4 text-sm leading-7 text-fuchsia-900">
            <strong className="block text-fuchsia-950">Regla práctica</strong>
            En PROYECTA solo necesitamos la dirección pública y la preferencia del modo. La seed phrase y las claves privadas se conservan fuera del portal, en un lugar seguro.
          </div>
          <div className="rounded-[18px] border border-fuchsia-200 bg-white/80 p-4 text-sm leading-7 text-fuchsia-900">
            <strong className="block text-fuchsia-950">Resumen del flujo</strong>
            Entra al sitio, crea la wallet, guarda la semilla, copia la dirección pública y vuelve al perfil para vincularla al proyecto.
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
          <div className="flex items-center gap-2 text-xs text-fuchsia-800">
            <ArrowRight className="h-4 w-4" />
            Puedes volver a esta guía cuando necesites verificar el proceso completo o explicar el flujo a otra persona.
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-2 text-fuchsia-700">
          <Repeat2 className="h-4 w-4" />
          <p className="text-sm font-bold">Swap crypto</p>
        </div>
        <p className="text-sm leading-7 text-slate-600">
          Si necesitas convertir Monero a otra moneda o preparar una salida a efectivo, estas pantallas muestran el flujo de intercambio. Revisa siempre comisión, mínimo y destino antes de confirmar.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {swapCards.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-black text-slate-900">{item.title}</p>
              </div>
              <img src={item.image} alt={item.alt} className="w-full object-cover" />
              <div className="space-y-2 p-4">
                <p className="text-sm leading-7 text-slate-600">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <BadgeDollarSign className="h-4 w-4" />
            Consejos para convertir Monero
          </div>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Usa solo servicios que entiendas y que te muestren el destino final antes de confirmar.</li>
            <li>Verifica el monto mínimo, la comisión y el tiempo estimado.</li>
            <li>No compartas tu seed phrase en ningún servicio externo.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
