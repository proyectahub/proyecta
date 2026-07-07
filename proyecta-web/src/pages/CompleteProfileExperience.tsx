import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletAuth } from '../context/WalletAuthContext'

export function CompleteProfileExperience() {
  const navigate = useNavigate()
  const { user, logout } = useWalletAuth()
  const [step, setStep] = useState<'info' | 'orcid' | 'success'>('info')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [institution, setInstitution] = useState('')
  const [orcidId, setOrcidId] = useState('')
  const [researchArea, setResearchArea] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSaveInfo = () => {
    setError(null)
    if (!fullName.trim()) return setError('El nombre es requerido')
    if (fullName.trim().length < 3) return setError('El nombre debe tener al menos 3 caracteres')
    localStorage.setItem('proyecta_wallet', JSON.stringify({ ...user, fullName: fullName.trim(), email: email.trim() || undefined, institution: institution.trim() || undefined, researchArea: researchArea.trim() || undefined }))
    setStep('orcid')
  }

  const handleAddOrcid = () => {
    localStorage.setItem('proyecta_wallet', JSON.stringify({ ...user, fullName, email: email.trim() || undefined, institution: institution.trim() || undefined, researchArea: researchArea.trim() || undefined, orcidId: orcidId.trim() || undefined }))
    setStep('success')
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2"><h1 className="text-4xl font-bold text-slate-900">Completa tu perfil</h1><p className="text-slate-600">Paso 1 de 2: Información básica</p></div>
          <div className="nova-card space-y-6 p-8">
            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">Nombre completo</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ej: Dr. Juan García López" className="nova-field" /></div>
            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">Email (opcional)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="nova-field" /></div>
            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">Institución (opcional)</label><input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="ej: Universidad Nacional" className="nova-field" /></div>
            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">Área de investigación</label><select value={researchArea} onChange={(e) => setResearchArea(e.target.value)} className="nova-field"><option value="">Selecciona...</option><option value="biology">Biología</option><option value="medicine">Medicina</option><option value="other">Otra</option></select></div>
            {error && <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-sm text-red-800">{error}</div>}
            <div className="flex gap-3"><button onClick={logout} className="nova-button-soft flex-1 text-red-600">Desconectar</button><button onClick={handleSaveInfo} disabled={!fullName.trim()} className="nova-button-solid flex-1 disabled:opacity-50">Continuar</button></div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'orcid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2"><h1 className="text-4xl font-bold text-slate-900">ORCID</h1><p className="text-slate-600">Paso 2 de 2: Conecta tu ORCID (opcional)</p></div>
          <div className="nova-card space-y-6 p-8">
            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">ORCID iD</label><input type="text" value={orcidId} onChange={(e) => setOrcidId(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXN" className="nova-field font-mono" /></div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3"><p className="font-bold text-blue-900">¿Qué es ORCID?</p><p className="text-sm text-blue-800">ORCID es un identificador único para investigadores.</p><a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">Crear ORCID gratis</a></div>
            <div className="flex gap-3"><button onClick={() => setStep('info')} className="nova-button-soft flex-1">Volver</button><button onClick={handleAddOrcid} className="nova-button-solid flex-1">Completar</button></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="space-y-4"><div className="text-6xl">OK</div><h2 className="text-3xl font-bold text-emerald-900">Perfil completado!</h2><p className="text-emerald-700">Bienvenido {fullName} a PROYECTA</p></div>
        <div className="flex gap-3"><button onClick={() => navigate('/profile')} className="nova-button-soft flex-1">Ver perfil</button><button onClick={() => navigate('/projects')} className="nova-button-solid flex-1">Explorar</button></div>
      </div>
    </div>
  )
}
