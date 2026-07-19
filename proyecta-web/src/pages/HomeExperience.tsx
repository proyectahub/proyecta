import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Cpu,
  ExternalLink,
  FlaskConical,
  Network,
  Search,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'

import { ProyectaBrandLockup, ProyectaMark } from '../components/brand/ProyectaBrand'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { useMoneroPrice } from '../hooks/useMoneroPrice'
import { PROJECTS_API_BASE } from '../lib/api'
import { normalizeProjects } from '../utils/projectWallet'

type Project = {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  fundraisingAddress: string
  authorName?: string
  raised: number
  status: string
  coverImage?: string
  createdAt: number
}

const categoryLabels: Record<string, string> = {
  biology: 'Biología',
  chemistry: 'Química',
  physics: 'Física',
  mathematics: 'Matemáticas',
  medicine: 'Medicina',
  'computer-science': 'Informática',
  ecology: 'Ecología',
  other: 'Otra área',
}

const processSteps = [
  {
    title: 'Elige una investigación',
    copy: 'Consulta su objetivo, meta en XMR y dirección pública antes de aportar.',
    icon: Search,
  },
  {
    title: 'Aporta CPU voluntariamente',
    copy: 'Usa la opción web o el minero nativo con el porcentaje de CPU que decidas.',
    icon: Cpu,
  },
  {
    title: 'RandomX trabaja en comunidad',
    copy: 'El puente coordina jobs reales con SupportXMR y registra cada proyecto por separado.',
    icon: Network,
  },
  {
    title: 'XMR llega a la wallet',
    copy: 'El pool paga a la dirección pública del investigador; PROYECTA no custodia fondos.',
    icon: WalletCards,
  },
]

export default function HomeExperience() {
  const { user, initialized } = useTraditionalAuth()
  const { xmrPrice } = useMoneroPrice()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProjects() {
      try {
        const response = await fetch(`${PROJECTS_API_BASE}/projects`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('No fue posible cargar los proyectos.')
        }

        const payload = await response.json()
        const normalized = normalizeProjects(Array.isArray(payload) ? payload : []) as Project[]
        if (!controller.signal.aborted) {
          setProjects(normalized.filter((project) => project.status !== 'archived'))
          setLoadError('')
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : 'No fue posible cargar los proyectos.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadProjects()
    return () => controller.abort()
  }, [])

  const visibleProjects = useMemo(
    () => [...projects].sort((left, right) => right.createdAt - left.createdAt).slice(0, 3),
    [projects],
  )
  const totalRaised = projects.reduce((sum, project) => sum + Number(project.raised || 0), 0)
  const totalGoal = projects.reduce((sum, project) => sum + Number(project.fundingGoal || 0), 0)
  const isAuthenticated = initialized && Boolean(user)

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[38px] border border-rose-100 bg-slate-950 text-white shadow-[0_36px_90px_-48px_rgba(92,20,78,0.75)]">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(244,114,182,0.28),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(14,165,233,0.2),transparent_30%),linear-gradient(135deg,#170f1b_0%,#481441_48%,#0f172a_100%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.08]" />
        <div className="relative grid min-h-[520px] gap-10 p-7 md:p-11 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-end">
          <div className="space-y-7">
            <ProyectaBrandLockup compact markSize={52} tone="light" />
            <div className="max-w-4xl space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-100 backdrop-blur">
                <Cpu size={15} /> Crowdfunding científico con minería Monero
              </p>
              <h1 className="nova-title text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
                Muchas computadoras. Una investigación que puede avanzar.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
                PROYECTA convierte aportes voluntarios de CPU en minería RandomX para financiar proyectos científicos. Cada proyecto publica su wallet y recibe XMR directamente desde el pool.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/projects" className="nova-button-solid px-6 py-3">
                Explorar proyectos <ArrowRight size={17} />
              </Link>
              <Link to={isAuthenticated ? '/create-project' : '/login?intent=publish'} className="nova-button-soft border-white/20 bg-white/10 px-6 py-3 text-white hover:bg-white/20">
                Publicar investigación
              </Link>
            </div>
          </div>

          <aside className="rounded-[30px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200">Estado público</p>
                <p className="mt-2 text-2xl font-black">Red abierta</p>
              </div>
              <ProyectaMark size={54} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-950/35 p-4">
                <p className="text-3xl font-black">{projects.length}</p>
                <p className="mt-1 text-xs text-slate-300">proyectos visibles</p>
              </div>
              <div className="rounded-2xl bg-slate-950/35 p-4">
                <p className="text-3xl font-black">{totalGoal.toFixed(2)}</p>
                <p className="mt-1 text-xs text-slate-300">XMR en metas</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-100"><ShieldCheck size={17} /> Sin custodia</p>
                <p className="mt-2 text-xs leading-6 text-emerald-50/75">Las claves privadas nunca entran al portal. Solo se registra la dirección pública elegida por el investigador.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="nova-shell p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="nova-eyebrow">Proyectos reales</p>
            <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Investigación que busca poder computacional</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Estos datos vienen de la base compartida del portal, no de artículos de demostración.</p>
          </div>
          <Link to="/projects" className="nova-button-soft">Ver todos <ArrowRight size={16} /></Link>
        </div>

        {loading ? (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-sm text-slate-600">Cargando proyectos...</div>
        ) : loadError ? (
          <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm text-red-700">{loadError}</div>
        ) : visibleProjects.length ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {visibleProjects.map((project) => {
              const goal = Number(project.fundingGoal || 0)
              const raised = Number(project.raised || 0)
              const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
              return (
                <article key={project.id} className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_55px_-38px_rgba(15,23,42,0.5)] transition hover:-translate-y-1 hover:border-fuchsia-200">
                  {project.coverImage ? <img src={project.coverImage} alt="" className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-[linear-gradient(135deg,#fdf2f8,#eef2ff)] text-fuchsia-600"><FlaskConical size={42} /></div>}
                  <div className="space-y-5 p-5">
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        <span>{categoryLabels[project.category] || project.category}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <h3 className="nova-title mt-3 text-2xl font-extrabold text-slate-900">{project.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{project.description}</p>
                    </div>
                    <div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500" style={{ width: `${progress}%` }} /></div>
                      <div className="mt-3 flex items-center justify-between text-sm"><span className="font-bold text-slate-900">{raised.toFixed(4)} XMR</span><span className="text-slate-500">Meta {goal.toFixed(2)} XMR</span></div>
                    </div>
                    <Link to={`/projects/${project.id}`} className="nova-button-soft w-full justify-center">Abrir proyecto <ArrowRight size={16} /></Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-bold text-slate-900">Aún no hay proyectos publicados.</p>
            <Link to={isAuthenticated ? '/create-project' : '/login?intent=publish'} className="nova-button-solid mt-5 inline-flex">Publicar el primero</Link>
          </div>
        )}
      </section>

      <section className="nova-card p-6 md:p-8">
        <p className="nova-eyebrow">Flujo verificable</p>
        <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900">Del CPU a la wallet del investigador</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <article key={step.title} className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-fuchsia-600 shadow-sm"><Icon size={20} /></span><span className="text-xs font-black text-slate-300">0{index + 1}</span></div>
                <h3 className="mt-5 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.copy}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
        <div className="nova-card p-6 md:p-8">
          <p className="nova-eyebrow">Transparencia operativa</p>
          <h2 className="nova-title mt-2 text-3xl font-extrabold text-slate-900">Qué confirma el portal y qué no inventa</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {['Saldo confirmado por SupportXMR', 'Hashes y shares reportados por el pool', 'Telemetría local separada del saldo', 'Dirección pública visible por proyecto'].map((item) => <div key={item} className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-800">✓ {item}</div>)}
            {['No convierte hashes locales a XMR', 'No genera wallets ni conserva seeds'].map((item) => <div key={item} className="rounded-2xl bg-slate-100 px-4 py-4 text-sm font-semibold text-slate-700">• {item}</div>)}
          </div>
        </div>
        <aside className="nova-card flex flex-col justify-between p-6 md:p-8">
          <div>
            <p className="nova-eyebrow">Resumen</p>
            <p className="nova-title mt-4 text-5xl font-black text-slate-900">{totalRaised.toFixed(4)}</p>
            <p className="mt-2 text-sm text-slate-500">XMR registrados como recaudados</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">{xmrPrice === null ? 'Conversión USD no disponible' : `≈ $${(totalRaised * xmrPrice).toFixed(2)} USD al precio actual`}</p>
          </div>
          <div className="mt-8 space-y-3">
            <Link to="/sobre-monero" className="nova-button-soft w-full justify-center">Conocer Monero <ExternalLink size={15} /></Link>
            <Link to="/computacion-donada" className="nova-button-solid w-full justify-center">Cómo aportar CPU</Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
