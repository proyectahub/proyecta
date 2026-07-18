import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectFundraisingCard } from '../components/ProjectFundraisingCard'
import { normalizeProjects } from '../utils/projectWallet'
import { PROJECTS_API_BASE } from '../lib/api'

interface Project {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  fundraisingAddress: string
  author: string
  hitos: Array<{ name: string; payout: number }>
  createdAt: number
  status: string
  raised: number
}

const CATEGORY_LABELS: Record<string, string> = {
  biology: '🧬 Biología',
  chemistry: '⚗️ Química',
  physics: '⚛️ Física',
  mathematics: '📐 Matemáticas',
  medicine: '🏥 Medicina',
  'computer-science': '💻 Informática',
  ecology: '🌿 Ecología',
  other: '📚 Otro',
}

export function ProjectsExperience() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPendingProjects = () => {
      try {
        const saved = localStorage.getItem('proyecta_projects_pending')
        if (!saved) return []
        const allProjects = JSON.parse(saved) as Project[]
        const normalizedProjects = normalizeProjects(allProjects)
        localStorage.setItem('proyecta_projects_pending', JSON.stringify(normalizedProjects))
        return normalizedProjects
      } catch {
        return []
      }
    }

    const loadProjects = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${PROJECTS_API_BASE}/projects`, { headers: { Accept: 'application/json' } })
        if (response.ok) {
          const remoteProjects = normalizeProjects(await response.json())
          const pendingProjects = loadPendingProjects()
          const pendingOnlyProjects = pendingProjects.filter(
            (pending) => !remoteProjects.some((remote) => remote.id === pending.id),
          )
          const merged = [...remoteProjects, ...pendingOnlyProjects].sort(
            (left, right) => right.createdAt - left.createdAt,
          )
          setProjects(merged)
          localStorage.setItem('proyecta_projects', JSON.stringify(merged))
          return
        }

        setProjects(loadPendingProjects())
      } catch (err) {
        console.error('Error loading projects:', err)
        try {
          setProjects(loadPendingProjects())
        } catch {
          setProjects([])
        }
      } finally {
        setLoading(false)
      }
    }

    void loadProjects()
    const interval = setInterval(() => void loadProjects(), 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredProjects = selectedCategory ? projects.filter((p) => p.category === selectedCategory) : projects
  const categories = Array.from(new Set(projects.map((p) => p.category)))

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-b-2 border-fuchsia-600" />
          <p className="text-slate-600">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Proyectos de investigación</h1>
            <p className="mt-2 text-slate-600">
              Apoya la ciencia directamente. {projects.length} proyecto{projects.length !== 1 ? 's' : ''} activo
              {projects.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button onClick={() => navigate('/login?intent=publish')} className="nova-button-solid whitespace-nowrap">
            📢 Publicar proyecto
          </button>
        </div>

        <div className="space-y-4 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">⏏️ Cómo funciona tu aporte</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">1</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Tu computadora</p>
                <p className="text-xs text-slate-600">Elige un proyecto</p>
              </div>
            </div>

            <div className="flex items-center justify-center text-2xl text-purple-400">→</div>

            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">2</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Minería RandomX</p>
                <p className="text-xs text-slate-600">Tu CPU calcula hashes</p>
              </div>
            </div>

            <div className="flex items-center justify-center text-2xl text-purple-400">→</div>

            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600 text-lg font-bold text-white">3</div>
              <div>
                <p className="text-sm font-bold text-slate-900">XMR directo</p>
                <p className="text-xs text-slate-600">Se envía a investigador</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-purple-200 bg-white p-4">
            <p className="text-sm text-slate-700">
              <strong>✅ Sin intermediarios:</strong> Los XMR van directamente a la billetera del investigador. PROYECTA no
              custodia fondos.
            </p>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">Filtrar por categoría:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-lg px-4 py-2 font-bold transition ${
                  selectedCategory === null
                    ? 'bg-fuchsia-600 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Todas ({projects.length})
              </button>

              {categories.map((cat) => {
                const count = projects.filter((p) => p.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-4 py-2 font-bold transition ${
                      selectedCategory === cat
                        ? 'bg-fuchsia-600 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="nova-card space-y-4 p-12 text-center">
          <div className="text-6xl">📭</div>
          <h3 className="text-xl font-bold text-slate-900">No hay proyectos</h3>
          <p className="text-slate-600">
            {selectedCategory ? 'No hay proyectos en esta categoría' : 'Sé el primero en publicar un proyecto'}
          </p>
          <button onClick={() => navigate('/login?intent=publish')} className="nova-button-solid mt-4 inline-block">
            📢 Publicar proyecto
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="cursor-pointer transition hover:shadow-lg"
            >
              <ProjectFundraisingCard
                projectId={project.id}
                projectTitle={project.title}
                projectDescription={project.description}
                fundraisingAddress={project.fundraisingAddress}
                goal={project.fundingGoal}
                raised={project.raised}
                hitos={project.hitos}
              />
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 border-t pt-8 md:grid-cols-3">
          <div className="nova-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
            <p className="mt-1 text-sm text-slate-600">Proyectos activos</p>
          </div>

          <div className="nova-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {projects.reduce((sum, p) => sum + p.raised, 0).toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-slate-600">XMR recaudados</p>
          </div>

          <div className="nova-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">
              ${(projects.reduce((sum, p) => sum + p.raised, 0) * 316.12).toFixed(0)}
            </p>
            <p className="mt-1 text-sm text-slate-600">USD equivalentes</p>
          </div>
        </div>
      )}
    </div>
  )
}
