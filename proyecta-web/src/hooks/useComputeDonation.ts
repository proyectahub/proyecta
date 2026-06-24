import { useState, useCallback, useEffect } from 'react';
import {
  COMPUTE_DONATION,
  ComputeDonationPreference,
} from '../constants/computeDonation';

/**
 * Hook para gestionar la donación voluntaria de cómputo
 * Maneja: preferences en localStorage, CoinImp client, tracking de interacciones
 */
export function useComputeDonation() {
  const [preference, setPreferenceState] = useState<ComputeDonationPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencias desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(COMPUTE_DONATION.STORAGE_KEY);
    if (stored) {
      try {
        setPreferenceState(JSON.parse(stored));
      } catch {
        console.error('Failed to parse compute donation preference');
        initializeDefault();
      }
    } else {
      initializeDefault();
    }
    setIsLoading(false);
  }, []);

  // Inicializar preferencias por defecto
  const initializeDefault = useCallback(() => {
    const defaultPref: ComputeDonationPreference = {
      enabled: false,
      percentage: 0,
      dismissed: false,
    };
    setPreferenceState(defaultPref);
  }, []);

  // Guardar preferencias en localStorage
  const savePreference = useCallback(
    (newPref: Partial<ComputeDonationPreference>) => {
      const updated = { ...preference, ...newPref } as ComputeDonationPreference;
      setPreferenceState(updated);
      localStorage.setItem(COMPUTE_DONATION.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    [preference]
  );

  // Obtener preferencias actuales
  const getPreference = useCallback((): ComputeDonationPreference => {
    return (
      preference || {
        enabled: false,
        percentage: 0,
        dismissed: false,
      }
    );
  }, [preference]);

  // Determinar si mostrar el popup
  const shouldShowPopup = useCallback(
    (triggerSource: 'register' | 'interactions'): boolean => {
      const pref = getPreference();

      // No mostrar si ya fue descartado
      if (pref.dismissed) return false;

      // No mostrar si ya está donando
      if (pref.enabled && pref.percentage > 0) return false;

      // Por ahora, mostrar el popup según el trigger
      return true;
    },
    [getPreference]
  );

  // Iniciar donación con CoinImp
  const startDonation = useCallback(
    (percentage: number): boolean => {
      if (percentage < 0 || percentage > 100) {
        console.error('Invalid percentage:', percentage);
        return false;
      }

      // Validar que porcentaje esté en opciones permitidas
      if (!COMPUTE_DONATION.PERCENTAGES.includes(percentage)) {
        console.warn('Percentage not in allowed list:', percentage);
      }

      // Guardar preferencia
      const newPref = savePreference({
        enabled: true,
        percentage,
        dismissed: false,
        createdAt: new Date().toISOString(),
      });

      // Cargar script de CoinImp si no está cargado
      loadCoinImpScript(percentage);

      return true;
    },
    [savePreference]
  );

  // Detener donación
  const stopDonation = useCallback((): boolean => {
    // Detener CoinImp si está activo
    if ((window as any)._client) {
      try {
        (window as any)._client.stop();
      } catch (e) {
        console.error('Error stopping CoinImp:', e);
      }
    }

    // Actualizar preferencia
    savePreference({
      enabled: false,
      percentage: 0,
    });

    return true;
  }, [savePreference]);

  // Marcar popup como descartado
  const dismissPopup = useCallback((): boolean => {
    savePreference({
      dismissed: true,
      lastShown: new Date().toISOString(),
    });
    return true;
  }, [savePreference]);

  // Obtener estado actual de donación
  const getDonationStatus = useCallback(
    (): { enabled: boolean; percentage: number } => {
      const pref = getPreference();
      return {
        enabled: pref.enabled,
        percentage: pref.percentage,
      };
    },
    [getPreference]
  );

  return {
    preference: getPreference(),
    isLoading,
    shouldShowPopup,
    startDonation,
    stopDonation,
    dismissPopup,
    getDonationStatus,
    savePreference,
  };
}

/**
 * Cargar y ejecutar script de CoinImp
 * @param percentage Porcentaje de CPU a donar (0-100)
 */
export function loadCoinImpScript(percentage: number): void {
  // Si ya está cargado, solo actualizar throttle
  const existingScript = document.getElementById(COMPUTE_DONATION.COINIMP_SCRIPT_ID);

  if (existingScript && (window as any)._client) {
    try {
      (window as any)._client.stop();
      const throttle = (100 - percentage) / 100;
      (window as any)._client = new (window as any).Client.Anonymous(
        COMPUTE_DONATION.COINIMP_SITE_KEY,
        { throttle, c: 'w' }
      );
      (window as any)._client.start();
    } catch (e) {
      console.error('Error re-initializing CoinImp:', e);
    }
    return;
  }

  const script = document.createElement('script');
  script.id = COMPUTE_DONATION.COINIMP_SCRIPT_ID;
  script.src = COMPUTE_DONATION.COINIMP_SCRIPT_URL;
  script.async = true;

  script.onload = () => {
    const throttle = (100 - percentage) / 100;
    const ClientClass = (window as any).Client;

    if (!ClientClass) {
      console.error('CoinImp Client not available after script load');
      return;
    }

    try {
      (window as any)._client = new ClientClass.Anonymous(
        COMPUTE_DONATION.COINIMP_SITE_KEY,
        { throttle, c: 'w' }
      );
      (window as any)._client.start();
      console.log(`✅ CoinImp started — ${percentage}% CPU donation`);
    } catch (e) {
      console.error('Error initializing CoinImp:', e);
    }
  };

  script.onerror = () => {
    console.error('❌ Failed to load CoinImp script from:', COMPUTE_DONATION.COINIMP_SCRIPT_URL);
  };

  document.head.appendChild(script);
}

/**
 * Hook para leer estadísticas en tiempo real del cliente CoinImp
 */
export function useCoinImpStats() {
  const [hashes, setHashes] = useState(0);
  const [hashRate, setHashRate] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const client = (window as any)._client;
      if (!client) return;
      try {
        setHashes(client.getTotalHashes?.() ?? 0);
        setHashRate(Math.round(client.getHashesPerSecond?.() ?? 0));
        setElapsedMs((prev) => prev + 1000);
      } catch {
        // cliente no disponible aún
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return { hashes, hashRate, elapsed: formatTime(elapsedMs) };
}

/**
 * Hook simplificado para solo obtener status de donación
 */
export function useComputeDonationStatus() {
  const { getDonationStatus } = useComputeDonation();
  return getDonationStatus();
}
