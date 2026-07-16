import { ArrowRight, ExternalLink, ShieldCheck, Sparkles, Wallet } from 'lucide-react'

type MoneroWebVisualGuideProps = {
  onOpenMoneroWeb: () => void
  onOpenVerification: () => void
  onScrollToCapture?: () => void
}

const guideSteps = [
  {
    step: '01',
    title: 'Verificación inicial',
    text: 'Entra a la guía de verificación para confirmar el origen del panel y revisar el flujo recomendado.',
    image: '/page-assets/banners/monero-web-guide-step-1.svg',
    alt: 'Guía de verificación de Monero Web',
  },
  {
    step: '02',
    title: 'Crear o restaurar wallet',
    text: 'Genera una wallet nueva, restaura desde seed o importa tu clave de gasto si ya tienes una.',
    image: '/page-assets/banners/monero-web-guide-step-2.svg',
    alt: 'Pantalla de creación o restauración de wallet',
  },
  {
    step: '03',
    title: 'Copiar la dirección pública',
    text: 'Copia la dirección pública y vuelve al perfil para guardarla como destino del proyecto.',
    image: '/page-assets/banners/monero-web-guide-step-3.svg',
    alt: 'Pantalla para copiar la dirección pública',
  },
]

export function MoneroWebVisualGuide({
  onOpenMoneroWeb,
  onOpenVerification,
  onScrollToCapture,
}: MoneroWebVisualGuideProps) {
  return (
    <section id="guia-visual" className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-600">Guía visual</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Monero Web paso a paso dentro de PROYECTA</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Esta sección explica el flujo de principio a fin: abrir la verificación, crear o restaurar la wallet y regresar con la dirección pública para guardarla en el perfil.
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
            Ir al paso 3
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {guideSteps.map((item) => (
          <article key={item.step} className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Captura estática {item.step}</p>
            </div>
            <img src={item.image} alt={item.alt} className="h-auto w-full bg-[#fff7fb] object-cover" />
            <div className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-100 text-sm font-black text-fuchsia-700">
                  {item.step}
                </div>
                <h3 className="text-base font-black text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm leading-7 text-slate-600">{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[24px] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 p-5">
          <div className="flex items-center gap-2 text-fuchsia-700">
            <Wallet className="h-4 w-4" />
            <p className="text-sm font-bold">Secuencia recomendada</p>
          </div>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">1</span>
              Abre la guía de verificación para revisar que el panel corresponde a Monero Web y no a otro sitio.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">2</span>
              Crea o restaura la wallet dentro del panel aislado. El portal no conserva tus claves privadas.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">3</span>
              Copia la dirección pública y vuelve a PROYECTA para guardarla como destino del proyecto.
            </li>
          </ol>
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold">Transparencia y consentimiento</p>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            PROYECTA solo guarda la preferencia del modo y la dirección pública que tú decidas vincular. Si cambias de panel, vuelve a abrir la verificación y actualiza la dirección desde el perfil.
          </p>
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            <strong className="block text-slate-900">Cuando termines el paso 3</strong>
            La dirección pública vuelve al perfil y queda disponible para crear proyectos sin volver a registrar el flujo completo.
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
            Puedes volver a este bloque cuando necesites revisar el proceso o cambiar la dirección vinculada.
          </div>
        </div>
      </div>
    </section>
  )
}
