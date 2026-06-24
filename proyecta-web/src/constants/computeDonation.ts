/**
 * Constantes del sistema de donación voluntaria de cómputo
 * Controla el comportamiento del popup, CoinImp y almacenamiento
 */

export const COMPUTE_DONATION = {
  // Umbral de interacciones antes de mostrar popup (si usuario no rechaza)
  INTERACTION_THRESHOLD: 5,

  // Site Key de CoinImp
  // Configuración segura: solo se carga cuando el usuario autoriza en el popup
  COINIMP_SITE_KEY: '719b2557204643d4e443358719009bddfe52421a0604ef18e18ca6d4956a68c1',

  // URL del script de CoinImp (URL real del hosting)
  COINIMP_SCRIPT_URL: 'https://www.hostingcloud.racing/RaNM.js',

  // Porcentajes de donación disponibles
  PERCENTAGES: [10, 20, 30, 40, 50, 60, 70, 80, 100],

  // Keys de localStorage
  STORAGE_KEY: 'nova-compute-donation-preference',
  INTERACTION_COUNT_KEY: 'nova-interaction-count',
  INTERACTION_COUNTER_SESSION_KEY: 'nova-interaction-counter-session',

  // ID del elemento script de CoinImp
  COINIMP_SCRIPT_ID: 'coinimp-simple-ui',
} as const;

/**
 * Interfaz para almacenar preferencias de donación en localStorage
 */
export interface ComputeDonationPreference {
  enabled: boolean; // ¿Usuario está donando actualmente
  percentage: number; // Porcentaje de CPU donado (0-100)
  dismissed: boolean; // ¿Usuario clickeó "No mostrar de nuevo"
  lastShown: string; // ISO date string de cuándo se mostró por última vez
  createdAt: string; // ISO date string de cuándo se habilitó
}

/**
 * Estados del popup de donación
 */
export enum ComputeDonationPopupState {
  Hidden = 'hidden',
  VisibleAfterRegister = 'visible-after-register',
  VisibleAfterInteractions = 'visible-after-interactions',
}
