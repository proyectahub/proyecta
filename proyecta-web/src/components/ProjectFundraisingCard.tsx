import { DonateToProject } from './DonateToProject'
import { useMoneroPrice } from '../hooks/useMoneroPrice'

interface ProjectFundraisingCardProps {
  projectId: string
  projectTitle: string
  projectDescription: string
  fundraisingAddress: string
  goal: number
  raised: number
  onMiningOptionSelected?: (option: 'browser' | 'app') => void
  hitos?: Array<{
    name: string
    payout: number
    completed: boolean
  }>
}

export function ProjectFundraisingCard({
  projectId,
  projectTitle,
  projectDescription,
  fundraisingAddress,
  goal,
  raised,
  onMiningOptionSelected,
  hitos = [],
}: ProjectFundraisingCardProps) {
  const { xmrPrice } = useMoneroPrice()
  const safeRaised = Number(raised) || 0
  const safeGoal = Number(goal) || 0
  const progress = safeGoal > 0 ? Math.min((safeRaised / safeGoal) * 100, 100) : 0
  const remaining = Math.max(safeGoal - safeRaised, 0)
  const safeHitos = Array.isArray(hitos) ? hitos : []

  return (
    <div className="space-y-6">
      <div className="nova-card p-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="nova-title text-2xl">{projectTitle}</h2>
              <p className="text-slate-600 mt-2">{projectDescription}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Meta de financiamiento</span>
                <span className="text-lg font-bold text-blue-600">{progress.toFixed(0)}%</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-slate-600">Recaudado</p>
                  <p className="text-lg font-bold text-blue-600">
                    {safeRaised.toFixed(2)} <span className="text-xs">XMR</span>
                  </p>
                  <p className="text-xs text-slate-500">{xmrPrice === null ? 'USD no disponible' : `$${(safeRaised * xmrPrice).toFixed(0)} USD`}</p>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <p className="text-slate-600">Falta</p>
                  <p className="text-lg font-bold text-amber-600">
                    {remaining.toFixed(2)} <span className="text-xs">XMR</span>
                  </p>
                  <p className="text-xs text-slate-500">{xmrPrice === null ? 'USD no disponible' : `$${(remaining * xmrPrice).toFixed(0)} USD`}</p>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <p className="text-slate-600">Meta</p>
                  <p className="text-lg font-bold text-slate-900">
                    {safeGoal.toFixed(2)} <span className="text-xs">XMR</span>
                  </p>
                  <p className="text-xs text-slate-500">{xmrPrice === null ? 'USD no disponible' : `$${(safeGoal * xmrPrice).toFixed(0)} USD`}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-2">
              <p className="text-xs font-bold text-slate-600">DIRECCIÓN PÚBLICA (Blockchain)</p>
              <div className="flex gap-2">
                <code className="text-xs bg-slate-100 px-3 py-2 rounded flex-1 break-all">
                  {fundraisingAddress}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(fundraisingAddress)}
                  className="nova-button-soft text-xs px-4"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Monero no publica el saldo de una dirección. La actividad minera y los pagos se verifican mediante SupportXMR.
              </p>
            </div>
          </div>

          <div className="md:sticky md:top-6 h-fit">
            <DonateToProject
              projectId={projectId}
              fundraisingAddress={fundraisingAddress}
              projectGoal={safeGoal}
              projectTitle={projectTitle}
              projectRaised={safeRaised}
              onMiningOptionSelected={onMiningOptionSelected}
            />
          </div>
        </div>
      </div>

      {safeHitos.length > 0 && (
        <div className="nova-card p-6">
          <h3 className="font-bold text-lg mb-4">Hitos de financiamiento</h3>

          <div className="space-y-3">
            {safeHitos.map((hito, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: hito.completed ? 'rgb(236, 253, 245)' : 'rgb(248, 250, 252)',
                }}
              >
                <div>
                  <p className="font-bold text-slate-900">{hito.name}</p>
                  <p className="text-sm text-slate-600">{hito.payout * 100}% de la meta</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-blue-600">{(hito.payout * safeGoal).toFixed(2)} XMR</p>
                  {hito.completed && <p className="text-xs text-emerald-600 font-bold">✅ Completado</p>}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Los hitos se liberan cuando la comunidad valida que se cumplieron.
          </p>
        </div>
      )}
    </div>
  )
}
