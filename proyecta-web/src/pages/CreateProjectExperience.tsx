import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { useWalletAuth } from '../context/WalletAuthContext'
import { generateMoneroAddress } from '../utils/moneroAddress'

const CATEGORIES: Record<string, string> = {
  biology: '🧬 Biología',
  chemistry: '⚗️ Química',
  physics: '⚛️ Física',
  mathematics: '📐 Matemáticas',
  medicine: '🏥 Medicina',
  'computer-science': '💻 Informática',
  ecology: '🌿 Ecología',
  other: '📚 Otro',
}

export function CreateProjectExperience() {
  const navigate = useNavigate()
  const { user: traditionalUser, initialized } = useTraditionalAuth()
  const { user: walletUser } = useWalletAuth()

  // TODOS los hooks deben declararse antes de cualquier return condicional
  const [step, setStep] = useState('info')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('biology')
  const [fundingGoal, setFundingGoal] = useState('')
  const [useOwnWallet, setUseOwnWallet] = useState(true)

  // Dirección real del wallet vinculado del usuario (verificable en blockchain)
  const linkedWalletAddress =
    traditionalUser?.moneroWallet?.mainAddress || walletUser?.wallet?.mainAddress || ''

  // Dirección Monero del proyecto: usa la real vinculada si existe, si no genera una
  const generatedAddress = useMemo(
    () => generateMoneroAddress(`proyecto_${Date.now()}_${Math.random()}`),
    []
  )

  const projectMoneroAddress =
    useOwnWallet && linkedWalletAddress ? linkedWalletAddress : generatedAddress

  const isAuthenticated = !!(traditionalUser || walletUser)

  // Esperar a que el contexto termine de cargar desde localStorage antes de decidir
  // (evita redirigir al login por una condición de carrera en el primer render)
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate('/login?intent=publish')
    }
  }, [initialized, isAuthenticated, navigate])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Redirigiendo al inicio de sesión...</p>
      </div>
    )
  }

  const canProceed = () => {
    if (step === 'info') {
      return title.trim().length > 0 && description.trim().length > 20
    }
    if (step === 'funding') {
      return parseFloat(fundingGoal) > 0
    }
    return true
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Publicar proyecto</h1>
            <p className="text-slate-600">Paso 1 de 3: Información básica</p>
          </div>

          <div className="nova-card p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Título del proyecto
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tu proyecto de investigación"
                className="nova-field"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="nova-field"
              >
                {Object.entries(CATEGORIES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu proyecto (mínimo 20 caracteres)..."
                rows={6}
                className="nova-field"
              />
              <p className="text-xs text-slate-500">
                Caracteres: {description.length} {description.length < 21 && '(mínimo 21)'}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/projects')} className="nova-button-soft flex-1">
                Cancelar
              </button>
              <button
                onClick={() => setStep('funding')}
                disabled={!canProceed()}
                className="nova-button-solid flex-1 disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'funding') {
    const goal = parseFloat(fundingGoal) || 0
    const usdValue = (goal * 316.12).toFixed(0)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">💰 Meta de Financiamiento</h1>
            <p className="text-slate-600">Paso 2 de 3: Elige tu objetivo en Monero</p>
          </div>

          <div className="nova-card p-8 space-y-8">
            {/* Visualización del objetivo */}
            <div className="text-center space-y-4">
              <div className="text-6xl font-black text-blue-600">
                {goal.toFixed(2)}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900">XMR</p>
                <p className="text-lg text-slate-600">≈ ${usdValue} USD</p>
              </div>
            </div>

            {/* Slider para elegir objetivo */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-700">
                  Ajusta tu meta con el slider
                </label>
                <span className="text-xs text-slate-500">0.1 - 100 XMR</span>
              </div>

              <input
                type="range"
                min="0.1"
                max="100"
                step="0.1"
                value={fundingGoal || '0.1'}
                onChange={(e) => setFundingGoal(e.target.value)}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="flex justify-between text-xs text-slate-500">
                <span>0.1 XMR ($32)</span>
                <span>50 XMR ($15,806)</span>
                <span>100 XMR ($31,612)</span>
              </div>
            </div>

            {/* Input directo */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                O escribe directamente
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  placeholder="5.0"
                  className="nova-field flex-1"
                />
                <span className="flex items-center px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-700">
                  XMR
                </span>
              </div>
            </div>

            {/* Selección de dirección de recaudación */}
            {linkedWalletAddress && (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">
                  Dirección de recaudación
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setUseOwnWallet(true)}
                    className={`text-left rounded-lg border-2 p-3 transition ${
                      useOwnWallet
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="font-bold text-slate-900 text-sm">
                      ✅ Mi wallet vinculado (recomendado para minería real)
                    </p>
                    <code className="text-xs text-slate-500 break-all">
                      {linkedWalletAddress.substring(0, 32)}...
                    </code>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseOwnWallet(false)}
                    className={`text-left rounded-lg border-2 p-3 transition ${
                      !useOwnWallet
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="font-bold text-slate-900 text-sm">
                      🆕 Generar dirección nueva para el proyecto
                    </p>
                    <code className="text-xs text-slate-500 break-all">
                      {generatedAddress.substring(0, 32)}...
                    </code>
                  </button>
                </div>
              </div>
            )}

            {/* Información de la dirección */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 space-y-3">
              <p className="font-bold text-amber-900 flex items-center gap-2">
                <span>🔐</span> Tu dirección de recaudación
              </p>
              <code className="text-xs break-all font-mono bg-white p-3 rounded border border-amber-200 block">
                {projectMoneroAddress}
              </code>
              <p className="text-xs text-amber-800">
                ✅ Los minadores donarán XMR aquí directamente. PROYECTA nunca toca los fondos.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('info')} className="nova-button-soft flex-1">
                ← Volver
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={!canProceed()}
                className="nova-button-solid flex-1 disabled:opacity-40"
              >
                Revisar →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'review') {
    const handlePublish = () => {
      const authorId =
        traditionalUser?.id ||
        walletUser?.wallet?.userVitaAddress ||
        'anonymous'

      const projectData = {
        id: `proj_${Date.now()}`,
        title,
        description,
        category,
        fundingGoal: parseFloat(fundingGoal),
        fundraisingAddress: projectMoneroAddress,
        moneroAddress: projectMoneroAddress,
        author: authorId,
        authorName: traditionalUser?.fullName || 'Investigador',
        // Campos requeridos por la lista de proyectos y la tarjeta
        raised: 0,
        status: 'active',
        hitos: [] as Array<{ name: string; payout: number; completed: boolean }>,
        createdAt: Date.now(),
      }

      const existingProjects = JSON.parse(
        localStorage.getItem('proyecta_projects') || '[]'
      )
      existingProjects.unshift(projectData)
      localStorage.setItem('proyecta_projects', JSON.stringify(existingProjects))

      setStep('success')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Revisar y publicar</h1>
            <p className="text-slate-600">Paso 3 de 3: Confirma los datos</p>
          </div>

          <div className="nova-card p-8 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Título</p>
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Categoría</p>
              <p className="text-slate-700">{CATEGORIES[category]}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Descripción</p>
              <p className="text-slate-600 whitespace-pre-wrap">{description}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Meta</p>
              <p className="font-bold text-blue-600 text-xl">
                {parseFloat(fundingGoal).toFixed(2)} XMR
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Dirección</p>
              <code className="text-xs break-all text-slate-600">{projectMoneroAddress}</code>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep('funding')} className="nova-button-soft flex-1">
                ← Volver
              </button>
              <button onClick={handlePublish} className="nova-button-solid flex-1">
                Publicar proyecto
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="text-6xl">✅</div>
          <h2 className="text-3xl font-bold text-emerald-900">¡Proyecto publicado!</h2>
          <p className="text-slate-600">
            Tu proyecto ya está visible para la comunidad. Otros usuarios pueden minar para apoyarlo.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/projects')} className="nova-button-solid">
              Ver proyectos
            </button>
            <button onClick={() => navigate('/')} className="nova-button-soft">
              Ir a inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
