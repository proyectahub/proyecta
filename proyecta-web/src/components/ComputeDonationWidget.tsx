import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Cpu, Play, Square, Zap } from 'lucide-react';
import { COMPUTE_DONATION, ComputeDonationPreference } from '../constants/computeDonation';
import { useMoneroMining, useValidateMoneroAddress } from '../hooks/useMoneroMining';

interface ComputeDonationWidgetProps {
  projectMoneroAddress?: string;
  projectTitle?: string;
}

function readPreference(): ComputeDonationPreference {
  try {
    const raw = localStorage.getItem(COMPUTE_DONATION.STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ComputeDonationPreference;
    }
  } catch {
    // Keep the widget usable even if localStorage contains older malformed data.
  }

  return {
    enabled: false,
    percentage: 0,
    dismissed: false,
  };
}

function writePreference(pref: Partial<ComputeDonationPreference>) {
  const current = readPreference();
  const next = { ...current, ...pref };
  localStorage.setItem(COMPUTE_DONATION.STORAGE_KEY, JSON.stringify(next));
  return next;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function ComputeDonationWidget({ projectMoneroAddress, projectTitle }: ComputeDonationWidgetProps = {}) {
  const [pref, setPref] = useState<ComputeDonationPreference>(() => readPreference());
  const [minimized, setMinimized] = useState(false);
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const isValidAddress = useValidateMoneroAddress(projectMoneroAddress || '');

  // Hook de minería Monero
  const { stats: miningStats, error: miningError, stop: stopMining } = useMoneroMining(
    projectMoneroAddress || '',
    pref.enabled && isValidAddress,
    pref.percentage
  );

  const { hashes, hashRate, elapsedSeconds } = miningStats;

  useEffect(() => {
    if (!pref.enabled) {
      stopMining();
      setAdBlockerDetected(false);
      return;
    }

    if (!projectMoneroAddress || !isValidAddress) {
      setAdBlockerDetected(true);
      return;
    }

    setAdBlockerDetected(false);
  }, [pref.enabled, projectMoneroAddress, isValidAddress, stopMining]);

  // Update preference when changed in localStorage
  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = readPreference();
      setPref(current);
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  const handleStop = () => {
    const next = writePreference({
      enabled: false,
      percentage: 0,
      dismissed: false,
    });
    setPref(next);
    stopMining();
  };

  const handleReactivate = () => {
    const current = readPreference();
    const pct = current.percentage > 0 ? current.percentage : 50;
    const next = writePreference({
      enabled: true,
      percentage: pct,
      dismissed: false,
    });
    setPref(next);
    setMinimized(false);
  };

  if (!pref.enabled && !pref.dismissed) {
    return null;
  }

  const isDonating = pref.enabled;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border shadow-2xl transition-all ${
        isDonating
          ? 'border-fuchsia-500/30 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <button
        type="button"
        onClick={() => setMinimized((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            isDonating ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Zap
            className={`h-5 w-5 ${
              isDonating ? 'fill-yellow-300 text-yellow-300' : 'text-slate-400'
            }`}
          />
        </span>
        <span className="flex-1">
          <span className={`text-sm font-bold ${isDonating ? 'text-white' : 'text-slate-600'}`}>
            {isDonating ? 'Minando Monero' : 'Minería pausada'}
          </span>
          <span
            className={`mt-1 block text-xs ${
              isDonating ? 'text-fuchsia-100/80' : 'text-slate-400'
            }`}
          >
            {isDonating ? `${pref.percentage}% de capacidad voluntaria${projectTitle ? ` para ${projectTitle}` : ''}` : 'PROYECTA Mining inactivo'}
          </span>
        </span>
        {minimized ? (
          <ChevronUp className={`h-4 w-4 ${isDonating ? 'text-fuchsia-200' : 'text-slate-400'}`} />
        ) : (
          <ChevronDown className={`h-4 w-4 ${isDonating ? 'text-fuchsia-200' : 'text-slate-400'}`} />
        )}
      </button>

      {!minimized && (
        <div className="space-y-4 border-t border-white/10 px-5 pb-5 pt-4">
          {isDonating ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-fuchsia-100/80">
                    Hashes
                  </p>
                  <p className="mt-2 text-xl font-black">{hashes.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-fuchsia-100/80">
                    H/s
                  </p>
                  <p className="mt-2 text-xl font-black">{hashRate}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-fuchsia-100/80">
                    Tiempo
                  </p>
                  <p className="mt-2 text-xl font-black">{formatTime(elapsedSeconds)}</p>
                </div>
              </div>

              {adBlockerDetected && (
                <div className="flex gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-50">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {!projectMoneroAddress
                      ? 'No hay dirección Monero disponible para esta sesión'
                      : 'No pudimos iniciar la minería. Puede estar bloqueado por una extension o por la politica del navegador.'}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleStop}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950"
              >
                <Square className="h-4 w-4" />
                Detener minería
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-600" />
                <p>
                  Puedes reactivar la minería Monero cuando quieras. Es voluntario y se ejecuta solo
                  mientras tengas esta pestaña abierta. Todo va directo al {projectTitle ? `proyecto: ${projectTitle}` : 'fondo de investigación'}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReactivate}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-black text-white"
              >
                <Play className="h-4 w-4" />
                Reactivar minería
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
