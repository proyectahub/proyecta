/**
 * Configuración de la donación DIRECTA (dinero) — motor principal del modelo híbrido.
 * La donación de cómputo (minería) vive en constants/computeDonation.ts y es el complemento.
 *
 * Estos enlaces son "payment links" alojados: no requieren backend.
 *  - Stripe Payment Link: crea uno en https://dashboard.stripe.com/payment-links
 *    y activa "Permitir que el cliente elija el monto" para donaciones flexibles.
 *  - Mercado Pago: crea un link de pago / suscripción en https://www.mercadopago.com.mx/
 *
 * Reemplaza los placeholders por tus enlaces reales antes de publicar.
 */
export const DIRECT_DONATION = {
  CURRENCY: 'MXN',
  CURRENCY_SYMBOL: '$',

  // Enlaces de pago alojados (placeholders — sustituir por los reales)
  MERCADOPAGO_LINK: 'https://mpago.la/REEMPLAZAR',
  STRIPE_LINK: 'https://buy.stripe.com/REEMPLAZAR',

  // Si el enlace permite elegir monto, estos chips son sugerencias visuales.
  SUGGESTED_AMOUNTS: [50, 100, 200, 500],
  DEFAULT_AMOUNT: 100,

  // Algunos enlaces aceptan prefijar el monto vía query (Stripe Payment Links: ?__prefilled_amount=)
  // Déjalo en false si tu enlace no lo soporta.
  STRIPE_SUPPORTS_PREFILL: false,
} as const;

export function buildStripeUrl(amount: number): string {
  if (!DIRECT_DONATION.STRIPE_SUPPORTS_PREFILL) return DIRECT_DONATION.STRIPE_LINK;
  // Stripe espera el monto en la unidad mínima (centavos)
  const cents = Math.round(amount * 100);
  const sep = DIRECT_DONATION.STRIPE_LINK.includes('?') ? '&' : '?';
  return `${DIRECT_DONATION.STRIPE_LINK}${sep}__prefilled_amount=${cents}`;
}
