import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { WalletSetupGuide } from '../components/WalletSetupGuide'
import { PROJECTS_API_BASE } from '../lib/api'

type PublishedProject = {
  id: string
  title: string
  description?: string
}

export function UserProfileExperience() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useTraditionalAuth()

  const [editing, setEditing] = useState(false)
  const [orcidLoading, setOrcidLoading] = useState(false)
  const [orcidError, setOrcidError] = useState<string | null>(null)
  const [publishedProjects, setPublishedProjects] = useState<PublishedProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    researchArea: '',
    orcidId: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    setFormData({
      fullName: user.fullName || '',
      institution: user.institution || '',
      researchArea: user.researchArea || '',
      orcidId: user.orcidId || '',
    })
  }, [user, navigate])

  useEffect(() => {
    if (!user?.id) return

    const controller = new AbortController()
    const authorId = user.id

    async function loadPublishedProjects() {
      setProjectsLoading(true)
      try {
        const response = await fetch(
          `${PROJECTS_API_BASE}/projects?authorId=${encodeURIComponent(authorId)}`,
          { credentials: 'same-origin', signal: controller.signal },
        )
        if (!response.ok) throw new Error('No fue posible cargar los proyectos.')

        const data = await response.json()
        if (!controller.signal.aborted) {
          setPublishedProjects(Array.isArray(data) ? data : data.projects || [])
        }
      } catch {
        if (!controller.signal.aborted) setPublishedProjects([])
      } finally {
        if (!controller.signal.aborted) setProjectsLoading(false)
      }
    }

    void loadPublishedProjects()
    return () => controller.abort()
  }, [user?.id])

  if (!user) return null

  const handleSaveProfile = async () => {
    await updateProfile(formData)
    setEditing(false)
  }

  const handleConnectOrcid = async () => {
    setOrcidError(null)
    setOrcidLoading(true)

    try {
      const response = await fetch(`/cf-api/auth/orcid-link`, {
        method: 'POST',
        credentials: 'same-origin',
      })

      const data = await response.json()
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'No fue posible iniciar ORCID.')
      }

      window.location.href = data.url
    } catch (error) {
      setOrcidError(error instanceof Error ? error.message : 'No fue posible iniciar ORCID.')
    } finally {
      setOrcidLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Mi perfil</h1>
          <p className="mt-2 text-slate-600">{user.email}</p>
        </div>
        <button onClick={logout} className="nova-button-soft text-red-600">
          Desconectar
        </button>
      </div>

      <div className="nova-card space-y-6 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Información personal</h2>
            {user.orcidId ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <span aria-hidden="true">✓</span> Investigador/a verificado
                </span>
              </div>
            ) : null}
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="nova-button-soft text-sm">
              Editar
            </button>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Nombre completo</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="nova-field w-full"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Institución</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Universidad, centro de investigación..."
                className="nova-field w-full"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Área de investigación</label>
              <select
                value={formData.researchArea}
                onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
                className="nova-field w-full"
              >
                <option value="">Selecciona una área</option>
                <option value="biology">Biología</option>
                <option value="medicine">Medicina</option>
                <option value="physics">Física</option>
                <option value="chemistry">Química</option>
                <option value="engineering">Ingeniería</option>
                <option value="other">Otra</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">ORCID iD (opcional)</label>
              <input
                type="text"
                value={formData.orcidId}
                onChange={(e) => setFormData({ ...formData, orcidId: e.target.value })}
                placeholder="0000-0000-0000-0000"
                className="nova-field w-full"
              />
              <p className="mt-1 text-xs text-slate-500">
                No tienes ORCID? <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Crea uno gratis</a>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveProfile} className="nova-button-solid flex-1">
                Guardar cambios
              </button>
              <button onClick={() => setEditing(false)} className="nova-button-soft flex-1">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-600">NOMBRE</p>
              <p className="text-lg font-bold text-slate-900">{formData.fullName || 'No especificado'}</p>
              {!user.orcidId ? (
                <button
                  onClick={handleConnectOrcid}
                  disabled={orcidLoading}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  <span aria-hidden="true">↻</span> {orcidLoading ? 'Conectando...' : 'Conectar con ORCID'}
                </button>
              ) : (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                  <span aria-hidden="true">✓</span> ORCID conectado
                </div>
              )}
              {orcidError ? (
                <p className="mt-2 text-sm text-rose-700">{orcidError}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600">EMAIL</p>
              <p className="text-sm text-slate-700">{user.email}</p>
            </div>
            {formData.institution ? (
              <div>
                <p className="text-xs font-bold text-slate-600">INSTITUCIÓN</p>
                <p className="text-sm text-slate-700">{formData.institution}</p>
              </div>
            ) : null}
            {formData.researchArea ? (
              <div>
                <p className="text-xs font-bold text-slate-600">ÁREA DE INVESTIGACIÓN</p>
                <p className="text-sm text-slate-700 capitalize">{formData.researchArea}</p>
              </div>
            ) : null}
            {formData.orcidId ? (
              <div>
                <p className="text-xs font-bold text-slate-600">ORCID</p>
                <a href={`https://orcid.org/${formData.orcidId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {formData.orcidId}
                </a>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <WalletSetupGuide />

      <section className="nova-card space-y-5 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Trabajo publicado</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Tus proyectos publicados</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Revisa comentarios, actualiza la información y continúa trabajando en cada investigación.
            </p>
          </div>
          <button onClick={() => navigate('/create-project')} className="nova-button-solid px-4 py-2 text-sm">
            Publicar proyecto
          </button>
        </div>

        {projectsLoading ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            Cargando tus proyectos publicados...
          </p>
        ) : publishedProjects.length ? (
          <div className="grid gap-3">
            {publishedProjects.map((project) => (
              <article key={project.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-slate-900">{project.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {project.description || 'Proyecto publicado en PROYECTA.'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button onClick={() => navigate(`/projects/${project.id}`)} className="nova-button-soft px-4 py-2 text-sm">
                    Ver proyecto
                  </button>
                  <button onClick={() => navigate(`/create-project?edit=${project.id}`)} className="nova-button-solid px-4 py-2 text-sm">
                    Editar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <p className="font-bold text-slate-800">Aún no has publicado proyectos.</p>
            <p className="mt-2 text-sm text-slate-600">Cuando publiques una investigación, aparecerá aquí para que puedas editarla.</p>
          </div>
        )}
      </section>

      <div className="nova-card space-y-4 p-8">
        <h2 className="text-2xl font-bold text-slate-900">Acciones</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button onClick={() => navigate('/create-project')} className="nova-button-solid py-3">
            Publicar proyecto
          </button>
          <button onClick={() => navigate('/projects')} className="nova-button-solid py-3">
            Explorar proyectos
          </button>
        </div>
      </div>
    </div>
  )
}




