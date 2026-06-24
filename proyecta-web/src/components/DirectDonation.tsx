import { useState } from 'react';
import { Heart, CreditCard, Wallet, ExternalLink } from 'lucide-react';
import { DIRECT_DONATION, buildStripeUrl } from '../constants/donation';

/**
 * Donación directa con dinero — motor principal del modelo híbrido.
 * Usa enlaces de pago alojados (Mercado Pago / Stripe), sin backend.
 */
export function DirectDonation() {
  const [amount, setAmount] = useState<number>(DIRECT_DONATION.DEFAULT_AMOUNT);
  const [custom, setCustom] = useState<string>('');

  const effectiveAmount = custom.trim() !== '' ? Math.max(0, Number(custom)) || 0 : amount;
  const sym = DIRECT_DONATION.CURRENCY_SYMBOL;

  const openLink = (url: string) => {
    if (url.includes('REEMPLAZAR')) {
      alert(
        'Aún no se ha configurado el enlace de pago. Edita src/constants/donation.ts con tu link real de Mercado Pago o Stripe.'
      );
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="nova-card bg-gradient-to-br from-white to-fuchsia-50/60 border-fuchsia-200">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-600 text-white">
          <Heart className="h-5 w-5 fill-white" />
        </span>
        <div>
          <h2 className="nova-title text-2xl font-extrabold text-slate-900">Donar dinero directo</h2>
          <p className="text-sm text-slate-500">La forma más rápida y efectiva de financiar la investigación</p>
        </div>
      </div>

      {/* Montos sugeridos */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {DIRECT_DONATION.SUGGESTED_AMOUNTS.map((a) => {
          const active = custom.trim() === '' && amount === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAmount(a);
                setCustom('');
              }}
              className={`rounded-2xl border px-3 py-3 text-center text-sm font-bold transition-colors ${
                active
                  ? 'border-fuchsia-600 bg-fuchsia-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-fuchsia-300'
              }`}
            >
              {sym}
              {a}
            </button>
          );
        })}
      </div>

      {/* Monto personalizado */}
      <div className="mt-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
          Otra cantidad ({DIRECT_DONATION.CURRENCY})
        </label>
        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-fuchsia-400">
          <span className="text-slate-400 font-bold">{sym}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Escribe un monto libre"
            className="w-full bg-transparent px-2 py-3 text-sm outline-none"
          />
        </div>
      </div>

      {/* Resumen */}
      <p className="mt-4 text-center text-sm text-slate-600">
        Vas a donar{' '}
        <strong className="text-fuchsia-700">
          {sym}
          {effectiveAmount} {DIRECT_DONATION.CURRENCY}
        </strong>
      </p>

      {/* Botones de pago */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => openLink(DIRECT_DONATION.MERCADOPAGO_LINK)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#009ee3] px-4 py-3 text-sm font-black text-white hover:brightness-95"
        >
          <Wallet className="h-4 w-4" />
          Donar con Mercado Pago
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </button>
        <button
          type="button"
          onClick={() => openLink(buildStripeUrl(effectiveAmount))}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-black text-white hover:brightness-95"
        >
          <CreditCard className="h-4 w-4" />
          Donar con tarjeta (Stripe)
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Pago seguro a través del proveedor. El 100% se destina a la investigación, servidores y mantenimiento.
      </p>
    </div>
  );
}
