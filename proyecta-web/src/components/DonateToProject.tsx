import { useState } from 'react'
import { ProjectMiningWidget } from './ProjectMiningWidget'
import { MiningOptionsModal } from './MiningOptionsModal'

interface DonateToProjectProps {
  projectId: string
  fundraisingAddress: string
  moneroAddress?: string
  projectGoal: number
  projectTitle: string
  projectRaised?: number
}

export function DonateToProject({
  projectId,
  fundraisingAddress,
  moneroAddress,
  projectGoal,
  projectTitle,
  projectRaised = 0,
}: DonateToProjectProps) {
  const [showMiningModal, setShowMiningModal] = useState(false)
  const [selectedMiningOption, setSelectedMiningOption] = useState<'browser' | 'app' | null>(null)

  const walletAddress = moneroAddress || fundraisingAddress

  const handleStartMining = () => {
    setShowMiningModal(true)
  }

  const handleCloseMiningModal = () => {
    setShowMiningModal(false)
  }

  const handleSelectMiningOption = (option: 'browser' | 'app') => {
    setSelectedMiningOption(option)
    setShowMiningModal(false)
  }

  if (selectedMiningOption) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedMiningOption(null)} className="nova-button-soft text-sm">
          ← Cambiar opción de minería
        </button>
        <ProjectMiningWidget
          projectId={projectId}
          projectMoneroAddress={walletAddress}
          projectTitle={projectTitle}
        />
      </div>
    )
  }

  return (
    <>
      <div className="nova-card max-w-2xl space-y-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">⛏️ Aporta tu poder de cómputo</h3>
          <p className="text-slate-700">
            Financia esta investigación donando potencia de CPU. Tu computadora calcula hashes
            RandomX y el aporte se asigna al proyecto según la opción que elijas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            onClick={handleStartMining}
            className="space-y-3 rounded-lg border-2 border-blue-300 bg-white p-6 text-left transition hover:border-blue-500 hover:bg-blue-50"
          >
            <div>
              <p className="text-lg font-bold text-slate-900">🌐 Desde el navegador</p>
              <p className="mt-1 text-sm text-slate-600">
                Aporte rápido y controlado dentro de esta página
              </p>
            </div>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>✓ Sin instalar nada</li>
              <li>✓ Funciona aquí mismo</li>
              <li>⚠ Aporte simbólico (20-60 H/s)</li>
            </ul>
            <p className="mt-3 text-xs font-bold text-blue-600">Ver opciones →</p>
          </button>

          <button
            onClick={handleStartMining}
            className="relative space-y-3 rounded-lg border-2 border-purple-300 bg-white p-6 text-left transition hover:border-purple-500 hover:bg-purple-50"
          >
            <div className="absolute right-3 top-3 rounded-full bg-purple-600 px-2 py-1 text-xs font-bold text-white">
              RECOMENDADO
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">⚡ App profesional</p>
              <p className="mt-1 text-sm text-slate-600">Recauda 50-500× más</p>
            </div>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>✓ Minería nativa real</li>
              <li>✓ Funciona en segundo plano</li>
              <li>✓ Máxima potencia (2.000-10.000+ H/s)</li>
            </ul>
            <p className="mt-3 text-xs font-bold text-purple-600">Descargar →</p>
          </button>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-900">💡 ¿Cómo funciona?</p>
          <ol className="space-y-1 text-sm text-slate-700">
            <li>
              <strong>1.</strong> Elige navegador o app
            </li>
            <li>
              <strong>2.</strong> Tu CPU calcula hashes RandomX y se registran para el proyecto
            </li>
            <li>
              <strong>3.</strong> El pool acredita XMR en la dirección pública vinculada
            </li>
            <li>
              <strong>4.</strong> Todo puede verificarse en la blockchain de Monero
            </li>
          </ol>
        </div>

        <button onClick={handleStartMining} className="w-full nova-button-solid py-4 text-lg font-bold">
          Seleccionar opción de minería
        </button>
      </div>

      <MiningOptionsModal
        isOpen={showMiningModal}
        onClose={handleCloseMiningModal}
        projectWallet={walletAddress}
        onSelectOption={handleSelectMiningOption}
      />
    </>
  )
}
