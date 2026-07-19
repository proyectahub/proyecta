import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ProjectFundraisingCard } from '../components/ProjectFundraisingCard'
import { ProjectSecurityInfo } from '../components/ProjectSecurityInfo'
import { ProjectComments } from '../components/ProjectComments'
import { MiningStatsWidget } from '../components/MiningStatsWidget'
import { normalizeProjectWallet, normalizeProjectWalletAddress, isValidProjectWalletAddress } from '../utils/projectWallet'
import { PROJECTS_API_BASE } from '../lib/api'

interface Project {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  fundraisingAddress: string
  moneroAddress?: string
  author: string
  hitos: Array<{ name: string; payout: number }>
  createdAt: number
  status: string
  raised: number
}

export function ProjectDetailsExperience() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMiningOption, setSelectedMiningOption] = useState<'browser' | 'app' | null>(null)

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

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{project.title}</h1>
          <p className="mt-2 text-slate-600">
            Publicado hace {Math.round((Date.now() - project.createdAt) / 1000 / 60)} minutos
          </p>
        </div>
        <button onClick={() => navigate('/projects')} className="nova-button-soft">
          Volver
        </button>
      </div>

      <div className="nova-card space-y-3 border-2 border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Wallet personal del investigador</p>
        <p className="text-sm text-slate-600">Esta es la dirección pública a la que el pool envía los XMR del proyecto.</p>
        <code className="block break-all rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800">
          {normalizeProjectWalletAddress(project.fundraisingAddress)}
        </code>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span>
            {isValidProjectWalletAddress(project.fundraisingAddress) ? 'Formato de dirección válido' : 'Dirección pendiente de validar'}
          </span>
          <a
            href="https://supportxmr.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 hover:underline"
          >
            Ver en SupportXMR
          </a>
        </div>
      </div>

      <ProjectFundraisingCard
        projectId={project.id}
        projectTitle={project.title}
        projectDescription={project.description}
        fundraisingAddress={project.fundraisingAddress}
        goal={project.fundingGoal}
        raised={project.raised}
        onMiningOptionSelected={setSelectedMiningOption}
        hitos={project.hitos.map((hito) => ({ ...hito, completed: Boolean((hito as any).completed) }))}
      />

      <MiningStatsWidget
        wallet={project.fundraisingAddress}
        fundingGoal={project.fundingGoal}
        projectTitle={project.title}
        projectId={project.id}
        selectedMiningOption={selectedMiningOption}
      />

      <div className="nova-card space-y-4 p-6">
        <h2 className="text-2xl font-bold">Descripción</h2>
        <div className="whitespace-pre-wrap leading-7 text-slate-700">{project.description}</div>
      </div>

      <ProjectComments projectId={project.id} projectAuthor={project.author} />

      <ProjectSecurityInfo />
    </div>
  )
}
