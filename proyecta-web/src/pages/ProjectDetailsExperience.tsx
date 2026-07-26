import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ProjectFundraisingCard } from '../components/ProjectFundraisingCard'
import { ProjectSecurityInfo } from '../components/ProjectSecurityInfo'
import { ProjectComments } from '../components/ProjectComments'
import { MiningStatsWidget } from '../components/MiningStatsWidget'
import { DonateToProject } from '../components/DonateToProject'
import { normalizeProjectWallet } from '../utils/projectWallet'
import { PROJECTS_API_BASE } from '../lib/api'
import { sanitizeRichHtml } from '../utils/sanitizeRichHtml'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'

interface Project {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  fundraisingAddress: string
  moneroAddress?: string
  author: string
  authorName?: string
  hitos: Array<{ name: string; payout: number }>
  createdAt: number
  status: string
  raised: number
}

function formatPublishedAge(createdAt: number) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60_000))
  if (elapsedMinutes < 60) return `Publicado hace ${Math.max(1, elapsedMinutes)} min`

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `Publicado hace ${elapsedHours} ${elapsedHours === 1 ? 'hora' : 'horas'}`

  const elapsedDays = Math.floor(elapsedHours / 24)
  if (elapsedDays < 30) return `Publicado hace ${elapsedDays} ${elapsedDays === 1 ? 'día' : 'días'}`

  const elapsedMonths = Math.floor(elapsedDays / 30)
  if (elapsedMonths < 12) return `Publicado hace ${elapsedMonths} ${elapsedMonths === 1 ? 'mes' : 'meses'}`

  const elapsedYears = Math.floor(elapsedDays / 365)
  return `Publicado hace ${elapsedYears} ${elapsedYears === 1 ? 'año' : 'años'}`
}

export function ProjectDetailsExperience() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMiningOption, setSelectedMiningOption] = useState<'browser' | 'app' | null>(null)
  const { user } = useTraditionalAuth()

  useEffect(() => {
    if (!id) {
      navigate('/projects')
      return
    }

    const loadProject = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${PROJECTS_API_BASE}/projects/${id}`, { headers: { Accept: 'application/json' } })
        if (response.ok) {
          const remoteProject = normalizeProjectWallet(await response.json())
          setProject(remoteProject)
          return
        }

        setProject(null)
      } catch (err) {
        console.error('Error loading project:', err)
        setProject(null)
      } finally {
        setLoading(false)
      }
    }

    void loadProject()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex h-12 w-12 animate-spin rounded-full border-b-2 border-fuchsia-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="nova-card space-y-4 p-12 text-center">
        <p className="text-xl font-bold text-slate-900">Proyecto no encontrado</p>
        <button onClick={() => navigate('/projects')} className="nova-button-solid">
          Volver
        </button>
      </div>
    )
  }

  const isProjectAuthor = user?.id === project.author

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{project.title}</h1>
          <p className="mt-2 text-slate-600">
            {formatPublishedAge(project.createdAt)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-fuchsia-50 px-3 py-1 font-bold text-fuchsia-800">
              Autor:{' '}
              <Link to={`/profile/${project.author}`} className="hover:underline">
                {project.authorName || 'Investigador/a'}
              </Link>
            </span>
            {isProjectAuthor ? (
              <button onClick={() => navigate(`/create-project?edit=${project.id}`)} className="font-bold text-fuchsia-700 hover:text-fuchsia-900 hover:underline">
                Gestionar mi proyecto
              </button>
            ) : null}
          </div>
        </div>
        <button onClick={() => navigate('/projects')} className="nova-button-soft">
          Volver
        </button>
      </div>

      <section className="nova-card space-y-4 p-7 md:p-9">
        <p className="nova-eyebrow">Presentación del proyecto</p>
        <h2 className="nova-title text-3xl font-extrabold text-slate-950">Descripción</h2>
        <div
          className="prose prose-slate max-w-none leading-8 prose-headings:font-black prose-headings:text-slate-950 prose-a:text-fuchsia-700 prose-img:rounded-2xl prose-img:shadow-md prose-table:text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(project.description) }}
        />
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
        <main className="space-y-8">
          <ProjectFundraisingCard
            projectId={project.id}
            projectTitle={project.title}
            authorId={project.author}
            authorName={project.authorName}
            showProjectIdentity={false}
            fundraisingAddress={project.fundraisingAddress}
            goal={project.fundingGoal}
            raised={project.raised}
            showDonation={false}
            hitos={project.hitos.map((hito) => ({ ...hito, completed: Boolean((hito as any).completed) }))}
          />

          <ProjectComments projectId={project.id} projectAuthor={project.author} />
        </main>

        <aside className="order-last self-start">
          <DonateToProject
            projectId={project.id}
            fundraisingAddress={project.fundraisingAddress}
            projectGoal={project.fundingGoal}
            projectTitle={project.title}
            projectRaised={project.raised}
            onMiningOptionSelected={setSelectedMiningOption}
          />
        </aside>
      </div>

      <MiningStatsWidget
        wallet={project.fundraisingAddress}
        fundingGoal={project.fundingGoal}
        projectTitle={project.title}
        projectId={project.id}
        selectedMiningOption={selectedMiningOption}
      />

      <ProjectSecurityInfo />
    </div>
  )
}
