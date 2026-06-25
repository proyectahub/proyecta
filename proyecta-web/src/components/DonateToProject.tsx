import { useState } from 'react'
import { ProjectMiningWidget } from './ProjectMiningWidget'
import { MiningOptionsModal } from './MiningOptionsModal'

interface DonateToProjectProps {
  projectId: string
  fundraisingAddress: string
  projectGoal: number
  projectTitle: string
  projectRaised?: number
}

export function DonateToProject({
  projectId,
  fundraisingAddress,
  projectGoal,
  projectTitle,
  projectRaised = 0,
}: DonateToProjectProps) {
  const [showMiningModal, setShowMiningModal] = useState(false)
  const [selectedMiningOption, setSelectedMiningOption] = useState<'browser' | 'app' | null>(null)

  const handleStartMining = () => {
    setShowMiningModal(true)
  }

  const handleCloseMiningModal = () => {
    setShowMiningModal(false)
  }

  const handleSelectMiningOption = (option: 'browser' | 'app') => {
    setSelectedMiningOption(option)
  }

  // Si ya seleccionó una opción, mostrar widget de minería
  if (selectedMiningOption) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedMiningOption(null)}
          className="nova-button-soft text-sm"
        >
          ← Cambiar opción de minería
        </button>
        <ProjectMiningWidget
          projectId={projectId}
          fundraisingAddress={fundraisingAddress}
          miningMode={selectedMiningOption}
        />
      </div>
    )
  }

  // Pantalla principal: una sola opción
  return (
    <>
      <div className="nova-card p-8 max-w-2xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 space-y-6">
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-slate-900">⛏️ Aporta tu poder de cómputo</h3>
          <p className="text-slate-700">
            Financia esta investigación donando potencia de CPU. Tu computadora genera XMR real que va directamente al investigador.
          </p>
        </div>

        {/* Opciones de minería */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opción 1: Navegador */}
          <button
            onClick={handleStartMining}
            className="p-6 rounded-lg border-2 border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50 transition text-left space-y-3"
          >
            <div>
              <p className="font-bold text-lg text-slate-900">🌐 Desde el navegador</p>
              <p className="text-sm text-slate-600 mt-1">Empieza a minar en segundos</p>
            </div>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>✓ Sin instalar nada</li>
              <li>✓ Funciona aquí mismo</li>
              <li>⚠️ Aporte simbólico (20–60 H/s)</li>
            </ul>
            <p className="text-xs text-blue-600 font-bold mt-3">Ver opciones →</p>
          </button>

          {/* Opción 2: App nativa */}
          <button
            onClick={handleStartMining}
            className="p-6 rounded-lg border-2 border-purple-300 bg-white hover:border-purple-500 hover:bg-purple-50 transition text-left space-y-3 relative"
          >
            <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              RECOMENDADO
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900">⚡ App profesional</p>
              <p className="text-sm text-slate-600 mt-1">Recauda 50-500× más</p>
            </div>
            <ul className="text-sm space-y-1 text-slate-600">
              <li>✓ Minería nativa real</li>
              <li>✓ Funciona en segundo plano</li>
              <li>✓ Máxima potencia (2.000–10.000+ H/s)</li>
            </ul>
            <p className="text-xs text-purple-600 font-bold mt-3">Descargar →</p>
          </button>
        </div>

        {/* Información sobre el flujo */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
          <p className="font-bold text-slate-900 text-sm">💡 ¿Cómo funciona?</p>
          <ol className="text-sm text-slate-700 space-y-1">
            <li><strong>1.</strong> Elige navegador o app</li>
            <li><strong>2.</strong> Tu CPU calcula hashes RandomX (minería real)</li>
            <li><strong>3.</strong> XMR se acumula en dirección del investigador</li>
            <li><strong>4.</strong> Verificable en blockchain Monero (sin intermediarios)</li>
          </ol>
        </div>

        {/* CTA principal */}
        <button
          onClick={handleStartMining}
          className="w-full nova-button-solid py-4 text-lg font-bold"
        >
          Seleccionar opción de minería
        </button>
      </div>

      {/* Modal de opciones */}
      <MiningOptionsModal
        isOpen={showMiningModal}
        onClose={handleCloseMiningModal}
        projectWallet={fundraisingAddress}
        onSelectOption={handleSelectMiningOption}
      />
    </>
  )
}
