import { useBlockchainMonitoring } from '../hooks/useBlockchainMonitoring'

interface BlockchainActivityWidgetProps {
  projectId: string
  fundraisingAddress: string
}

export function BlockchainActivityWidget({
  projectId,
  fundraisingAddress,
}: BlockchainActivityWidgetProps) {
  const { events, monitoring, startMonitoring } = useBlockchainMonitoring()

  React.useEffect(() => {
    const unwatch = startMonitoring(fundraisingAddress, projectId)
    return unwatch
  }, [startMonitoring, fundraisingAddress, projectId])

  const donationEvents = events.filter((e) => e.projectId === projectId)

  return (
    <div className="nova-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Actividad en blockchain</h3>
        <div className={`w-2 h-2 rounded-full ${monitoring ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      </div>

      {donationEvents.length === 0 ? (
        <p className="text-sm text-slate-600">
          {monitoring ? 'Monitoreando transacciones...' : 'No hay transacciones aun'}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {donationEvents.map((event) => (
            <div key={event.txHash} className="p-3 bg-slate-50 rounded text-sm">
              <div className="flex justify-between">
                <span className="font-bold">
                  {event.type === 'donation' ? '+' : ''}{event.amount.toFixed(2)}{' '}
                  {event.type === 'donation' ? 'XMR' : 'VITA'}
                </span>
                <a
                  href={`https://xmrchain.net/tx/${event.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs underline"
                >
                  Ver
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Verificable en{' '}
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
  )
}
