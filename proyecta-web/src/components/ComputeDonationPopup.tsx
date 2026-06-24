import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, X, Zap } from 'lucide-react';
import { useComputeDonation } from '../hooks/useComputeDonation';
import { COMPUTE_DONATION } from '../constants/computeDonation';

interface ComputeDonationPopupProps {
  triggerSource: 'register' | 'interactions';
  onClose: () => void;
  visible: boolean;
  onDonate: (percentage: number) => void;
}

export function ComputeDonationPopup({
  onClose,
  visible: externalVisible,
  onDonate,
}: ComputeDonationPopupProps) {
  const { startDonation, dismissPopup, getDonationStatus } = useComputeDonation();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState(50);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  useEffect(() => {
    setIsVisible(externalVisible);
  }, [externalVisible]);

  const donationStatus = getDonationStatus();
  const isAlreadyDonating = donationStatus.enabled && donationStatus.percentage > 0;

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleDonate = () => {
    startDonation(selectedPercentage);
    onDonate(selectedPercentage);
    handleClose();
  };

  const handleDecline = () => {
    if (neverShowAgain) dismissPopup();
    handleClose();
  };

  if (!isVisible || isAlreadyDonating) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-purple-500" />

          <div className="p-6">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50">
                  <Cpu className="h-5 w-5 text-fuchsia-600" />
                </div>
                <div>
                  <p className="nova-eyebrow text-fuchsia-600">Apoyo voluntario</p>
                  <h2 className="nova-title text-lg font-extrabold leading-tight text-slate-900">
                    Dona tu cómputo a la comunidad
                  </h2>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1.5 transition-colors hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              Proyecta existe porque personas como tú la sostienen. Puedes donar una fracción
              de tu CPU —<strong>no dinero</strong>—, sino poder de cómputo disponible para
              mantener esta comunidad científica abierta. Tu navegación <strong>no se verá
              afectada.</strong>
            </p>

            <Link
              to="/computacion-donada"
              onClick={handleClose}
              className="mb-5 inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700"
            >
              ¿Cómo funciona donar cómputo? →
            </Link>

            <div className="mb-5">
              <label className="nova-eyebrow mb-2 block">¿Qué porcentaje de CPU quieres aportar?</label>
              <div className="mb-2 grid grid-cols-5 gap-1.5">
                {COMPUTE_DONATION.PERCENTAGES.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setSelectedPercentage(pct)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      selectedPercentage === pct
                        ? 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Aportando el <strong>{selectedPercentage}%</strong> de CPU disponible en tu equipo.
              </p>
            </div>

            <label className="mb-5 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={neverShowAgain}
                onChange={(e) => setNeverShowAgain(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-fuchsia-600"
              />
              <span className="text-[11px] text-slate-500">No volver a mostrar este mensaje</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleDonate}
                className="nova-button-solid flex-1 justify-center gap-1.5 py-2.5 text-sm font-bold"
              >
                <Zap className="h-4 w-4" />
                Aportar ahora
              </button>
              <button
                onClick={handleDecline}
                className="nova-button-soft flex-1 justify-center py-2.5 text-sm font-semibold"
              >
                Ahora no
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] text-slate-400">
              Sin datos personales. Solo CPU disponible. Anónimo y transparente.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
