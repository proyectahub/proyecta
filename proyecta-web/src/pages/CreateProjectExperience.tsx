import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTraditionalAuth } from '../context/TraditionalAuthContext'
import { useWalletAuth } from '../context/WalletAuthContext'
import { generateMoneroAddress } from '../utils/moneroAddress'
import { RichTextEditor } from '../components/RichTextEditor'

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

  const [step, setStep] = useState('info')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [category, setCategory] = useState('biology')
  const [fundingGoal, setFundingGoal] = useState('')
  const [useOwnWallet, setUseOwnWallet] = useState(true)

  const linkedWalletAddress =
    traditionalUser?.moneroWallet?.mainAddress || walletUser?.wallet?.mainAddress || ''

  const generatedAddress = useMemo(
    () => generateMoneroAddress(`proyecto_${Date.now()}_${Math.random()}`),
    []
  )

  const projectMoneroAddress =
    useOwnWallet && linkedWalletAddress ? linkedWalletAddress : generatedAddress

  const isAuthenticated = !!(traditionalUser || walletUser)

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

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const canProceed = () => {
    if (step === 'info') {
      return title.trim().length > 0 && description.trim().length > 20 && coverImage
    }
    if (step === 'funding') {
      return parseFloat(fundingGoal) > 0
    }
    return true
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">📝 Crear proyecto</h1>
            <p className="text-slate-600">Paso 1 de 3: Detalles e información</p>
          </div>

          <div className="nova-card p-8 space-y-8">
            {/* Título */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Título del proyecto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Modelado computacional del cambio climático"
                className="nova-field text-lg"
              />
              <p className="text-xs text-slate-500">Máximo 120 caracteres</p>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Categoría *
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

            {/* Imagen de portada */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">
                Imagen de portada *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {coverImage ? (
                  <div className="space-y-3">
                    <img
                      src={coverImage}
                      alt="Portada"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => document.getElementById('cover-input')?.click()}
                      className="nova-button-soft text-sm"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <p className="text-3xl">🖼️</p>
                    <p className="font-bold text-slate-900">Sube una imagen de portada</p>
                    <p className="text-xs text-slate-500">PNG o JPG (máx. 5MB)</p>
                    <button
                      onClick={() => document.getElementById('cover-input')?.click()}
                      className="nova-button-solid text-sm mx-auto"
                    >
                      Seleccionar imagen
                    </button>
                  </div>
                )}
                <input
                  id="cover-input"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Descripción con editor profesional */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Descripción del proyecto *
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe tu proyecto en detalle. Puedes usar el editor para agregar formato, enlaces e imágenes."
              />
              <p className="text-xs text-slate-500">
                {description.replace(/<[^>]*>/g, '').length} caracteres (mínimo 20)
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t">
              <button onClick={() => navigate('/projects')} className="nova-button-soft flex-1">
                Cancelar
              </button>
              <button
                onClick={() => setStep('funding')}
                disabled={!canProceed()}
                className="nova-button-solid flex-1 disabled:opacity-40"
              >
                Continuar →
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
    const maxXMR = 10
    const progressPercent = (goal / maxXMR) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">💰 Meta de Financiamiento</h1>
            <p className="text-slate-600">Paso 2 de 3: Define tu objetivo en XMR</p>
          </div>

          <div className="nova-card p-8 space-y-8">
            {/* Visualización del objetivo */}
            <div className="text-center space-y-4">
              <div className="text-6xl font-black text-purple-600">
                {goal.toFixed(2)}
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-slate-900">XMR</p>
                <p className="text-lg text-slate-600">≈ ${usdValue} USD</p>
                <p className="text-xs text-slate-500">(máximo {maxXMR} XMR por ahora)</p>
              </div>
            </div>

            {/* Barra de progreso visual */}
            <div className="space-y-3 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-700">
                  Ajusta tu meta con el slider
                </label>
                <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-bold">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>0 XMR</span>
                <span>5 XMR</span>
                <span>10 XMR (máx)</span>
              </div>
            </div>

            {/* Slider para elegir objetivo */}
            <div className="space-y-4">
              <input
                type="range"
                min="0.1"
                max={maxXMR}
                step="0.1"
                value={fundingGoal || '0.1'}
                onChange={(e) => setFundingGoal(e.target.value)}
                className="w-full h-3 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />

              <div className="text-xs text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-bold mb-1">📌 Rango permitido:</p>
                <p>0.1 XMR (mínimo) hasta {maxXMR} XMR (máximo por ahora)</p>
              </div>
            </div>

            {/* Input directo */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">
                O escribe el monto directamente
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={maxXMR}
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  placeholder="5.0"
                  className="nova-field flex-1"
                />
                <span className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">
                  XMR
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Este monto es la meta de financiamiento en Monero. Los minadores donarán directamente a tu dirección cuando participen en tu proyecto.
              </p>
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
                      ✅ Mi wallet vinculado (recomendado)
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
                      🆕 Generar dirección nueva
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
                ✅ Los minadores donarán XMR aquí. PROYECTA nunca toca los fondos.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
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
        coverImage,
        category,
        fundingGoal: parseFloat(fundingGoal),
        fundraisingAddress: projectMoneroAddress,
        moneroAddress: projectMoneroAddress,
        author: authorId,
        authorName: traditionalUser?.fullName || 'Investigador',
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">✅ Revisar y publicar</h1>
            <p className="text-slate-600">Paso 3 de 3: Confirma los detalles de tu proyecto</p>
          </div>

          <div className="nova-card p-8 space-y-6">
            {/* Vista previa de portada */}
            {coverImage && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Imagen de portada</p>
                <img src={coverImage} alt={title} className="w-full h-64 object-cover rounded-lg" />
              </div>
            )}

            {/* Información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Título</p>
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Categoría</p>
                <p className="text-slate-700 text-lg">{CATEGORIES[category]}</p>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-2">Descripción</p>
              <div
                className="text-slate-600 bg-white rounded-lg p-4 border border-slate-200"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {/* Meta */}
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Meta de financiamiento</p>
              <p className="font-bold text-blue-600 text-2xl">
                {parseFloat(fundingGoal).toFixed(2)} XMR ≈ ${(parseFloat(fundingGoal) * 316.12).toFixed(0)}
              </p>
            </div>

            {/* Dirección */}
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-2">Dirección de recaudación</p>
              <code className="text-xs break-all text-slate-600 bg-slate-50 p-3 rounded block font-mono">
                {projectMoneroAddress}
              </code>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button onClick={() => setStep('funding')} className="nova-button-soft flex-1">
                ← Volver
              </button>
              <button onClick={handlePublish} className="nova-button-solid flex-1">
                🚀 Publicar proyecto
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
          <div className="text-7xl">🎉</div>
          <h2 className="text-3xl font-bold text-emerald-900">¡Proyecto publicado!</h2>
          <p className="text-slate-600 text-lg">
            Tu proyecto "{title}" ya está visible para la comunidad. Otros usuarios pueden minar para apoyarlo.
          </p>
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4">
            <p className="text-sm font-bold text-emerald-900">
              🔗 ID del proyecto: <code className="text-xs font-mono">{`proj_${Date.now()}`}</code>
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(`/projects`)} className="nova-button-solid">
              Ver en Explorar
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
