import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComputeDonation } from '../hooks/useComputeDonation';
import { COMPUTE_DONATION } from '../constants/computeDonation';
import { ComputeDonationPopup } from './ComputeDonationPopup';

/**
 * Contenedor global que muestra el popup de donación después de N interacciones
 * Este componente rastrea interacciones del usuario y muestra el popup cuando sea apropriado
 */
export function ComputeDonationPopupContainer() {
  const { interactionCount, resetInteractionCount } = useAuth();
  const { shouldShowPopup, getDonationStatus } = useComputeDonation();
  const [showPopup, setShowPopup] = useState(false);

  const donationStatus = getDonationStatus();
  const isAlreadyDonating = donationStatus.enabled && donationStatus.percentage > 0;

  // Mostrar popup cuando se alcanza el threshold
  useEffect(() => {
    if (
      !showPopup && // no está visible
      !isAlreadyDonating && // usuario no está donando
      interactionCount >= COMPUTE_DONATION.INTERACTION_THRESHOLD && // alcanzó el threshold
      shouldShowPopup('interactions') // no fue descartado
    ) {
      setShowPopup(true);
    }
  }, [interactionCount, showPopup, isAlreadyDonating, shouldShowPopup]);

  const handleClose = () => {
    setShowPopup(false);
    resetInteractionCount();
  };

  return (
    <ComputeDonationPopup
      visible={showPopup}
      triggerSource="interactions"
      onClose={handleClose}
    />
  );
}
