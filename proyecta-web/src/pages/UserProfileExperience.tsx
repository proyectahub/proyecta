import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { API_BASE } from '../lib/api'
import { WalletSetupGuide } from '../components/WalletSetupGuide'

export function UserProfileExperience() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useTraditionalAuth()

  const [editing, setEditing] = useState(false)
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

  if (!user) return null

  const handleSaveProfile = async () => {
    await updateProfile(formData)
    setEditing(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Mi perfil</h1>
          <p className="mt-2 text-slate-600">{user.email}</p>
        </div>
        <button onClick={logout} className="nova-button-soft text-red-600">
          Desconectar
        </button>
      </div>

      <div className="nova-card space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Información personal</h2>
            {user.orcidId && (
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  ✓ Investigador/a verificado
                </span>
              </div>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="nova-button-soft text-sm">
              Editar
            </button>
          )}
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
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-600">NOMBRE</p>
              <p className="text-lg font-bold text-slate-900">{formData.fullName || 'No especificado'}</p>
              {!user.orcidId && (
                <button
                  onClick={() => window.location.href = `${API_BASE}/api/oauth/orcid`}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                >
                  <span>🔗</span> Conectar con ORCID
                </button>
              )}
              {user.orcidId && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                  <span>✓</span> ORCID conectado
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600">EMAIL</p>
              <p className="text-sm text-slate-700">{user.email}</p>
            </div>
            {formData.institution && (
              <div>
                <p className="text-xs font-bold text-slate-600">INSTITUCIÓN</p>
                <p className="text-sm text-slate-700">{formData.institution}</p>
              </div>
            )}
            {formData.researchArea && (
              <div>
                <p className="text-xs font-bold text-slate-600">ÁREA DE INVESTIGACIÓN</p>
                <p className="text-sm text-slate-700 capitalize">{formData.researchArea}</p>
              </div>
            )}
            {formData.orcidId && (
              <div>
                <p className="text-xs font-bold text-slate-600">ORCID</p>
                <a href={`https://orcid.org/${formData.orcidId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {formData.orcidId}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="nova-card space-y-4 bg-slate-50 p-8">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de recompensas pausado</h2>
        <p className="text-sm leading-7 text-slate-600">
          Las métricas internas están ocultas temporalmente. El perfil sigue funcionando para identidad, ORCID y wallet personal.
        </p>
      </div>

      <WalletSetupGuide />

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
