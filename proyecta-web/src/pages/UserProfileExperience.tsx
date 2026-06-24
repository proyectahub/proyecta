import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { WalletSetupGuide } from '../components/WalletSetupGuide'
import { useMoneroPrice } from '../hooks/useMoneroPrice'
import { useIPFSVita } from '../hooks/useIPFSVita'

export function UserProfileExperience() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useTraditionalAuth()
  const { xmrPrice } = useMoneroPrice()
  const { loadUserVita } = useIPFSVita()

  const [vitaBalance, setVitaBalance] = useState({ vitaBacked: 0, vitaEarned: 0, vitaPledged: 0 })
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

    if (user.moneroWallet?.userVitaAddress) {
      const refreshBalance = async () => {
        const balance = await loadUserVita(user.moneroWallet!.userVitaAddress)
        setVitaBalance(balance)
      }
      refreshBalance()
      const interval = setInterval(refreshBalance, 30000)
      return () => clearInterval(interval)
    }
  }, [user, loadUserVita, navigate])

  if (!user) return null

  const handleSaveProfile = async () => {
    await updateProfile(formData)
    setEditing(false)
  }

  const totalVita = vitaBalance.vitaBacked + vitaBalance.vitaEarned - vitaBalance.vitaPledged
  const vitaUsdValue = (totalVita / 1000) * xmrPrice

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Mi perfil</h1>
          <p className="text-slate-600 mt-2">{user.email}</p>
        </div>
        <button onClick={logout} className="nova-button-soft text-red-600">
          Desconectar
        </button>
      </div>

      {/* Información Personal */}
      <div className="nova-card p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Información Personal</h2>
            {user.orcidId && (
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Investigador/a Verificado
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="nova-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Institución</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Universidad, Centro de Investigación..."
                className="nova-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Área de Investigación</label>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">ORCID iD (opcional)</label>
              <input
                type="text"
                value={formData.orcidId}
                onChange={(e) => setFormData({ ...formData, orcidId: e.target.value })}
                placeholder="0000-0000-0000-0000"
                className="nova-field w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
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
                  onClick={() => window.location.href = `https://orcid.org/oauth/authorize?client_id=APP-4K7Q5BPMPWC2UUVM&response_type=code&scope=/authenticate&redirect_uri=https://novasci.vercel.app/orcid/callback`}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700"
                >
                  <span>🔗</span> Conectar con ORCID
                </button>
              )}
              {user.orcidId && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-lg">
                  <span>✓</span> ORCID Conectado
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

      {/* VITA Balance */}
      <div className="nova-card p-8 space-y-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <h2 className="text-2xl font-bold text-slate-900">Mi VITA</h2>

        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-slate-600">Total disponible</p>
          <p className="text-3xl font-bold text-purple-600">
            {totalVita.toLocaleString()}
          </p>
          <p className="text-sm text-purple-700 mt-1">
            = ${vitaUsdValue.toFixed(2)} USD
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between p-3 bg-white rounded-lg">
            <span className="font-bold">VITA-Backed</span>
            <span className="text-blue-600 font-bold">{vitaBalance.vitaBacked}</span>
          </div>
          <div className="flex justify-between p-3 bg-white rounded-lg">
            <span className="font-bold">VITA-Earned</span>
            <span className="text-emerald-600 font-bold">{vitaBalance.vitaEarned}</span>
          </div>
          <div className="flex justify-between p-3 bg-white rounded-lg">
            <span className="font-bold">VITA-Pledged</span>
            <span className="text-amber-600 font-bold">-{vitaBalance.vitaPledged}</span>
          </div>
        </div>
      </div>

      {/* Wallet Setup Guide */}
      <WalletSetupGuide />

      {/* Acciones */}
      <div className="nova-card p-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Acciones</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
