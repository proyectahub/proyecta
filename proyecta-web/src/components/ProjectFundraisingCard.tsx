import { DonateToProject } from './DonateToProject'
import { ProjectMiningWidget } from './ProjectMiningWidget'

interface ProjectFundraisingCardProps {
  projectId: string
  projectTitle: string
  projectDescription: string
  fundraisingAddress: string
  goal: number
  raised: number
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
  hitos = [],
}: ProjectFundraisingCardProps) {
  // Valores seguros: evita crashes por undefined/NaN en proyectos sin estos campos
  const safeRaised = Number(raised) || 0
  const safeGoal = Number(goal) || 0
  const progress = safeGoal > 0 ? Math.min((safeRaised / safeGoal) * 100, 100) : 0
  const remaining = Math.max(safeGoal - safeRaised, 0)
  const safeHitos = Array.isArray(hitos) ? hitos : []

  return (
    <div className="space-y-6">
      {/* Card Principal */}
      <div className="nova-card p-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="nova-title text-2xl">{projectTitle}</h2>
              <p className="text-slate-600 mt-2">{projectDescription}</p>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Meta de financiamiento</span>
                <span className="text-lg font-bold text-blue-600">
                  {progress.toFixed(0)}%
                </span>
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
                  <p className="text-xs text-slate-500">
                    ${(safeRaised * 316.12).toFixed(0)} USD
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <p className="text-slate-600">Falta</p>
                  <p className="text-lg font-bold text-amber-600">
                    {remaining.toFixed(2)} <span className="text-xs">XMR</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    ${(remaining * 316.12).toFixed(0)} USD
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <p className="text-slate-600">Meta</p>
                  <p className="text-lg font-bold text-slate-900">
                    {safeGoal.toFixed(2)} <span className="text-xs">XMR</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    ${(safeGoal * 316.12).toFixed(0)} USD
                  </p>
                </div>
              </div>
            </div>

            {/* Dirección pública */}
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
                ✅ Verificable en{' '}
                <a
                  href={`https://xmrchain.net/address/${fundraisingAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  explorador Monero
                </a>
              </p>
            </div>
          </div>

          {/* Widget de donación */}
          <div>
            <DonateToProject
              projectId={projectId}
              fundraisingAddress={fundraisingAddress}
              projectGoal={safeGoal}
              projectTitle={projectTitle}
              projectRaised={safeRaised}
            />
          </div>
        </div>
      </div>

      {/* Hitos */}
      {safeHitos.length > 0 && (
        <div className="nova-card p-6">
          <h3 className="font-bold text-lg mb-4">Hitos de financiamiento</h3>

          <div className="space-y-3">
            {safeHitos.map((hito, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: hito.completed
                    ? 'rgb(236, 253, 245)' // emerald-50
                    : 'rgb(248, 250, 252)', // slate-50
                }}
              >
                <div>
                  <p className="font-bold text-slate-900">{hito.name}</p>
                  <p className="text-sm text-slate-600">
                    {hito.payout * 100}% de la meta
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    {(hito.payout * safeGoal).toFixed(2)} XMR
                  </p>
                  {hito.completed && (
                    <p className="text-xs text-emerald-600 font-bold">✅ Completado</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Los hitos se liberan cuando la comunidad valida que se cumplieron.
          </p>
        </div>
      )}

      {/* Información de seguridad */}
      <div className="nova-card p-6 bg-emerald-50 border-2 border-emerald-300">
        <h3 className="font-bold text-emerald-900 mb-3">🔒 Sin custodia = Seguro</h3>

        <ul className="space-y-2 text-sm text-emerald-800">
          <li>✅ Tu dinero está en blockchain (Monero públicamente verificable)</li>
          <li>✅ PROYECTA no toca los fondos (solo registra en IPFS)</li>
          <li>✅ Los investigadores controlan la dirección (multisig con supervisores)</li>
          <li>✅ Cualquiera puede auditar en tiempo real en el explorador Monero</li>
        </ul>
      </div>

      {/* Widget de Minería */}
      <ProjectMiningWidget
        projectId={projectId}
        projectMoneroAddress={fundraisingAddress}
        projectTitle={projectTitle}
      />
    </div>
  )
}
