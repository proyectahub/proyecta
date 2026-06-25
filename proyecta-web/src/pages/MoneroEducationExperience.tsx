import { MoneroTransparency } from '../components/MoneroTransparency'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function MoneroEducationExperience() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Header con botón atrás */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
          title="Volver"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            🔓 Transparencia: Monero XMR en PROYECTA
          </h1>
          <p className="text-slate-600 mt-2">
            Qué es, por qué lo usamos, y cómo convertir tus minería a dinero real
          </p>
        </div>
      </div>

      {/* Componente principal */}
      <MoneroTransparency />
    </div>
  )
}
