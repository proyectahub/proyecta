import { useState } from 'react'
import { useMoneroBlockchain } from '../hooks/useMoneroBlockchain'
import { useWalletAuth } from '../context/WalletAuthContext'
import { ProjectMiningWidget } from './ProjectMiningWidget'

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
  const { user, updateVitaBalance } = useWalletAuth()
  const { getAddressTransactions, watchAddress } = useMoneroBlockchain()

  const [donationAmount, setDonationAmount] = useState('')
  const [donationMethod, setDonationMethod] = useState<'xmr' | 'vita'>('xmr')
  const [step, setStep] = useState<'method' | 'amount' | 'confirm' | 'monitor' | 'complete' | 'mining'>(
    'method'
  )
  const [showMiningModal, setShowMiningModal] = useState(false)
  const [monitoringTx, setMonitoringTx] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStartMining = () => {
    setShowMiningModal(true)
  }

  const handleCloseMiningModal = () => {
    setShowMiningModal(false)
  }

  const handleStartDonateXMR = () => {
    setDonationMethod('xmr')
    setStep('amount')
  }

  const handleStartDonateVITA = () => {
    setDonationMethod('vita')
    setStep('amount')
  }

  const handleConfirm = () => {
    if (!donationAmount || isNaN(parseFloat(donationAmount))) {
      setError('Cantidad inválida')
      return
    }

    if (donationMethod === 'xmr') {
      setStep('confirm')
    } else {
      handleDonateVITA()
    }
  }

  const handleDonateXMR = () => {
    setStep('monitor')
    setMonitoringTx(`Esperando ${donationAmount} XMR a ${fundraisingAddress.slice(0, 10)}...`)

    // Monitorear blockchain
    const unwatch = watchAddress(fundraisingAddress, async (txs) => {
      const matchingTx = txs.find(
        (tx) => tx.isConfirmed && Math.abs(tx.amount - parseFloat(donationAmount)) < 0.0001
      )

      if (matchingTx) {
        unwatch()
        // Actualizar VITA
        await updateVitaBalance()
        setStep('complete')
      }
    }, 10000) // Verificar cada 10 segundos

    // Timeout después de 30 minutos
    const timeout = setTimeout(() => {
      unwatch()
      setError('Timeout: no se detectó la transacción en 30 minutos')
      setStep('amount')
    }, 30 * 60 * 1000)

    return () => clearTimeout(timeout)
  }

  const handleDonateVITA = () => {
    if (!user) {
      setError('Debes estar conectado')
      return
    }

    const amount = Math.floor(parseFloat(donationAmount))
    if (amount > user.vitaBacked + user.vitaEarned - user.vitaPledged) {
      setError('No tienes suficiente VITA')
      return
    }

    // En producción: registrar pledge en IPFS
    // Aquí solo confirmamos
    setStep('complete')
  }

  // ====== RENDER ======

  if (step === 'method') {
    return (
      <>
        <div className="nova-card p-6 max-w-md">
          <h3 className="font-bold text-lg mb-4">Apoyar: {projectTitle}</h3>

          <div className="space-y-3">
            <button
              onClick={handleStartMining}
              className="w-full p-4 rounded-lg border-2 border-fuchsia-300 bg-fuchsia-50 hover:border-fuchsia-500 transition text-left"
            >
              <p className="font-bold text-fuchsia-900">⛏️ Minar para recaudar</p>
              <p className="text-sm text-fuchsia-700 mt-1">
                Dedica tu CPU, genera XMR real para el proyecto
              </p>
            </button>

            <button
              onClick={handleStartDonateXMR}
              className="w-full p-4 rounded-lg border-2 border-blue-300 bg-blue-50 hover:border-blue-500 transition text-left"
            >
              <p className="font-bold text-blue-900">💰 XMR Directo</p>
              <p className="text-sm text-blue-700 mt-1">
                Envía desde tu wallet, PROYECTA solo registra
              </p>
            </button>

            {user && (
              <button
                onClick={handleStartDonateVITA}
                className="w-full p-4 rounded-lg border-2 border-purple-300 bg-purple-50 hover:border-purple-500 transition text-left"
              >
                <p className="font-bold text-purple-900">⚡ VITA</p>
                <p className="text-sm text-purple-700 mt-1">
                  Tengo {user.vitaBacked + user.vitaEarned - user.vitaPledged} VITA disponible
                </p>
              </button>
            )}
          </div>
        </div>

        {showMiningModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                <h2 className="text-2xl font-bold">¿Cómo quieres minar?</h2>
                <button
                  onClick={handleCloseMiningModal}
                  className="text-2xl text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <ProjectMiningWidget
                  projectId={projectId}
                  projectMoneroAddress={fundraisingAddress}
                  projectTitle={projectTitle}
                />
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (step === 'amount') {
    return (
      <div className="nova-card p-6 max-w-md">
        <h3 className="font-bold text-lg mb-4">
          {donationMethod === 'xmr' ? '💰 Donar XMR' : '⚡ Apoyar con VITA'}
        </h3>

        <div className="space-y-4">
          <input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder={donationMethod === 'xmr' ? '0.5' : '500'}
            className="nova-field"
          />

          <div className="text-sm text-slate-600">
            <p>
              Valor: ${((parseFloat(donationAmount) || 0) * (donationMethod === 'xmr' ? 316.12 : 0.316)).toFixed(2)} USD
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => setStep('method')} className="nova-button-soft flex-1">
              Volver
            </button>
            <button onClick={handleConfirm} className="nova-button-solid flex-1">
              Continuar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'confirm' && donationMethod === 'xmr') {
    return (
      <div className="nova-card p-6 max-w-md">
        <h3 className="font-bold text-lg mb-4">Confirmar donación</h3>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              Cantidad: <span className="font-bold">{donationAmount} XMR</span>
            </p>
            <p className="text-sm">
              Valor: <span className="font-bold">${(parseFloat(donationAmount) * 316.12).toFixed(2)}</span>
            </p>
            <p className="text-xs font-mono break-all text-blue-700 mt-3">
              Envía a: {fundraisingAddress}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            <p className="font-bold">✅ Pasos:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
              <li>Abre tu wallet Monero (Feather, MyMonero, etc.)</li>
              <li>Envía {donationAmount} XMR a la dirección arriba</li>
              <li>PROYECTA detectará en ~5-10 min y creará VITA</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep('amount')} className="nova-button-soft flex-1">
              Volver
            </button>
            <button onClick={handleDonateXMR} className="nova-button-solid flex-1">
              Ya envié XMR →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'monitor') {
    return (
      <div className="nova-card p-6 max-w-md">
        <h3 className="font-bold text-lg mb-4">⏳ Monitoreando blockchain...</h3>

        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
          </div>

          <p className="text-sm text-slate-600 text-center">
            Buscando tu transacción en blockchain
            <br />
            <span className="text-xs text-slate-500">Típicamente 2-10 minutos</span>
          </p>

          <a
            href={`https://xmrchain.net/address/${fundraisingAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 text-center block underline"
          >
            Ver en explorador Monero →
          </a>

          <button
            onClick={() => {
              setStep('amount')
              setMonitoringTx(null)
            }}
            className="nova-button-soft w-full"
          >
            Cancelar monitoreo
          </button>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="nova-card p-6 max-w-md bg-emerald-50">
        <h3 className="font-bold text-lg text-emerald-900 mb-4">✅ ¡Donación registrada!</h3>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm">
              {donationMethod === 'xmr' ? `${donationAmount} XMR` : `${donationAmount} VITA`}
            </p>
            <p className="text-sm text-emerald-600 mt-2">
              ${((parseFloat(donationAmount) || 0) * (donationMethod === 'xmr' ? 316.12 : 0.316)).toFixed(2)} USD
            </p>
          </div>

          <div className="bg-emerald-100 rounded-lg p-3 text-sm text-emerald-700">
            <p className="font-bold">
              {donationMethod === 'xmr'
                ? '✅ Tu VITA se creó automáticamente'
                : '✅ Tu apoyo está registrado'}
            </p>
          </div>

          <button
            onClick={() => {
              setStep('method')
              setDonationAmount('')
            }}
            className="nova-button-solid w-full"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return null
}
