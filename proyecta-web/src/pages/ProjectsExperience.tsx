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
  biology: 'ðŸ§¬ BiologÃ­a',
  chemistry: 'âš—ï¸ QuÃ­mica',
  physics: 'âš›ï¸ FÃ­sica',
  mathematics: 'ðŸ“ MatemÃ¡ticas',
  medicine: 'ðŸ¥ Medicina',
  'computer-science': 'ðŸ’» InformÃ¡tica',
  ecology: 'ðŸŒ¿ EcologÃ­a',
  other: 'ðŸ“š Otro',
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
          const pendingOnlyProjects = pendingProjects.filter((pending) => !remoteProjects.some((remote) => remote.id === pending.id))
          const merged = [
            ...remoteProjects,
            ...pendingOnlyProjects,
          ].sort((left, right) => right.createdAt - left.createdAt)
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

  const filteredProjects = selectedCategory
    ? projects.filter((p) => p.category === selectedCategory)
    : projects

  const categories = Array.from(new Set(projects.map((p) => p.category)))

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
          <p className="text-slate-600">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Proyectos de investigaciÃ³n</h1>
            <p className="text-slate-600 mt-2">
              Apoya la ciencia directamente. {projects.length} proyecto{projects.length !== 1 ? 's' : ''} activo{projects.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => navigate('/login?intent=publish')}
            className="nova-button-solid whitespace-nowrap"
          >
            ðŸ“¢ Publicar proyecto
          </button>
        </div>

        {/* ExplicaciÃ³n visual: CÃ³mo funciona */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">â›ï¸ CÃ³mo funciona tu aporte</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Paso 1 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Tu computadora</p>
                <p className="text-xs text-slate-600">Elige un proyecto</p>
              </div>
            </div>

            {/* Flecha */}
            <div className="flex items-center justify-center md:col-span-0">
              <div className="hidden md:block text-2xl text-purple-400">â†’</div>
              <div className="md:hidden text-2xl text-purple-400">â†“</div>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <p className="font-bold text-slate-900 text-sm">MinerÃ­a RandomX</p>
                <p className="text-xs text-slate-600">Tu CPU calcula hashes</p>
              </div>
            </div>

            {/* Flecha */}
            <div className="flex items-center justify-center md:col-span-0">
              <div className="hidden md:block text-2xl text-purple-400">â†’</div>
              <div className="md:hidden text-2xl text-purple-400">â†“</div>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-fuchsia-600 text-white flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <p className="font-bold text-slate-900 text-sm">XMR directo</p>
                <p className="text-xs text-slate-600">Se envÃ­a a investigador</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-slate-700">
              <strong>âœ… Sin intermediarios:</strong> Los XMR van directamente a la billetera del investigador. PROYECTA no custodia fondos.
            </p>
          </div>
        </div>

        {/* Filtros */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">Filtrar por categorÃ­a:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-bold transition ${
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
                    className={`px-4 py-2 rounded-lg font-bold transition ${
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

      {/* Proyectos */}
      {filteredProjects.length === 0 ? (
        <div className="nova-card p-12 text-center space-y-4">
          <div className="text-6xl">ðŸ“­</div>
          <h3 className="text-xl font-bold text-slate-900">No hay proyectos</h3>
          <p className="text-slate-600">
            {selectedCategory
              ? 'No hay proyectos en esta categorÃ­a'
              : 'SÃ© el primero en publicar un proyecto'}
          </p>
          <button
            onClick={() => navigate('/login?intent=publish')}
            className="nova-button-solid inline-block mt-4"
          >
            ðŸ“¢ Publicar proyecto
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="cursor-pointer hover:shadow-lg transition"
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

      {/* Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t">
          <div className="nova-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
            <p className="text-sm text-slate-600 mt-1">Proyectos activos</p>
          </div>

          <div className="nova-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {projects.reduce((sum, p) => sum + p.raised, 0).toFixed(2)}
            </p>
            <p className="text-sm text-slate-600 mt-1">XMR recaudados</p>
          </div>

          <div className="nova-card p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">
              ${(projects.reduce((sum, p) => sum + p.raised, 0) * 316.12).toFixed(0)}
            </p>
            <p className="text-sm text-slate-600 mt-1">USD equivalentes</p>
          </div>
        </div>
      )}
    </div>
  )
}

