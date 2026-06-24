import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComputeDonation } from './useComputeDonation';
import { COMPUTE_DONATION } from '../constants/computeDonation';

/**
 * Hook que determina cuándo mostrar el popup de donación basado en interacciones
 * Retorna true cuando se debe mostrar el popup
 */
export function useComputeDonationPopupTrigger(): boolean {
  const { interactionCount, resetInteractionCount } = useAuth();
  const { shouldShowPopup } = useComputeDonation();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Mostrar popup cuando se alcanza el threshold de interacciones
    if (
      interactionCount >= COMPUTE_DONATION.INTERACTION_THRESHOLD &&
      shouldShowPopup('interactions')
    ) {
      setShouldShow(true);
      resetInteractionCount(); // Resetear para no volver a mostrar tan pronto
    }
  }, [interactionCount, shouldShowPopup, resetInteractionCount]);

  return shouldShow;
}
