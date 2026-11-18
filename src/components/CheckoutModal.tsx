import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, MapPin, ShieldCheck, X } from 'lucide-react';
import { ARMORY_PRODUCTS } from '../data/armoryData';
import {
  ArmoryOrder,
  CartMap,
  CartTotals,
  ShippingCustomer,
  createOrderFromCheckout,
  formatCardExpiry,
  formatCardNumber,
  validatePaymentForm,
  validateShippingForm,
} from '../utils/armoryLogic';
import { soundEngine } from '../utils/soundEngine';
import { AnimatedNumber } from './AnimatedNumber';

interface CheckoutModalProps {
  open: boolean;
  cart: CartMap;
  totals: CartTotals;
  promoCode: string;
  onClose: () => void;
  onOrderComplete: (order: ArmoryOrder) => void;
}

const COUNTRIES = [
  'Japan',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'Australia',
  'Bangladesh',
  'Other',
];

export function CheckoutModal({
  open,
  cart,
  totals,
  promoCode,
  onClose,
  onOrderComplete,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 'confirmed'>(1);
  const [shipping, setShipping] = useState<ShippingCustomer>({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Japan',
  });
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingCustomer, string>>>({});

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'mastercard' | 'paypal'>('visa');
  const [paymentErrors, setPaymentErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  }>({});
  const [confirmedOrder, setConfirmedOrder] = useState<ArmoryOrder | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setShippingErrors({});
    setPaymentErrors({});
    setConfirmedOrder(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.play('click');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const productMap = new Map(ARMORY_PRODUCTS.map((p) => [p.id, p]));
  const items = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ product: productMap.get(id), qty }))
    .filter((e): e is { product: NonNullable<typeof e.product>; qty: number } => Boolean(e.product));

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.unlock();
    const res = validateShippingForm(shipping);
    if (!res.valid) {
      soundEngine.play('errorBuzz');
      setShippingErrors(res.errors);
      return;
    }
    soundEngine.play('select');
    setShippingErrors({});
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.unlock();
    const res = validatePaymentForm(cardNumber, expiry, cvv);
    if (!res.valid) {
      soundEngine.play('errorBuzz');
      setPaymentErrors(res.errors);
      return;
    }
    soundEngine.play('select');
    setPaymentErrors({});
    setStep(3);
  };

  const handlePlaceOrder = () => {
    soundEngine.unlock();
    const newOrder = createOrderFromCheckout({
      cart,
      customer: shipping,
      promoCode,
      cardNumber,
    });
    setConfirmedOrder(newOrder);
    setStep('confirmed');
    onOrderComplete(newOrder);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Armory Checkout"
      data-testid="checkout-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-0 backdrop-blur-md sm:p-4"
    >
      <div className="relative flex h-full w-full flex-col overflow-y-auto bg-[#0b0e16] p-5 sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-[#00ffff]/45 sm:p-7 sm:shadow-[0_0_50px_rgba(0,255,255,0.22)]">
        <button
          type="button"
          onClick={() => {
            soundEngine.play('click');
            onClose();
          }}
          aria-label="Close checkout"
          className="absolute top-4 right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:border-[#ff3355] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Indicator */}
        {step !== 'confirmed' && (
          <div className="mb-6 pr-12">
            <p className="font-display text-xs font-bold tracking-[0.22em] text-[#ffcc00]">
              CRIMSON VOID ARMORY · SECURE DISPATCH
            </p>
            <h3 className="font-display mt-1 text-xl font-black text-white sm:text-2xl">
              {step === 1
                ? 'STEP 1 · SHIPPING DETAILS'
                : step === 2
                ? 'STEP 2 · PAYMENT (DEMO)'
                : 'STEP 3 · REVIEW & CONFIRM'}
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    step >= s ? 'bg-gradient-to-r from-[#00ffff] to-[#ff00aa]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 — SHIPPING */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="chk-fullname" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <input
                  id="chk-fullname"
                  type="text"
                  value={shipping.fullName}
                  onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                  placeholder="Ren Kurosaki"
                  className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm text-white focus:outline-none ${
                    shippingErrors.fullName
                      ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                      : 'border-white/15 focus:border-[#00ffff]'
                  }`}
                />
                {shippingErrors.fullName && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                    {shippingErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="chk-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <input
                  id="chk-email"
                  type="email"
                  value={shipping.email}
                  onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                  placeholder="ren@neo-kyoto.jp"
                  className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm text-white focus:outline-none ${
                    shippingErrors.email
                      ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                      : 'border-white/15 focus:border-[#00ffff]'
                  }`}
                />
                {shippingErrors.email && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                    {shippingErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="chk-address" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Street Address
              </label>
              <input
                id="chk-address"
                type="text"
                value={shipping.address}
                onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                placeholder="77 Crimson Rift Plaza"
                className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm text-white focus:outline-none ${
                  shippingErrors.address
                    ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                    : 'border-white/15 focus:border-[#00ffff]'
                }`}
              />
              {shippingErrors.address && (
                <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                  {shippingErrors.address}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="chk-city" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  City
                </label>
                <input
                  id="chk-city"
                  type="text"
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                  placeholder="Neo-Kyoto"
                  className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm text-white focus:outline-none ${
                    shippingErrors.city
                      ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                      : 'border-white/15 focus:border-[#00ffff]'
                  }`}
                />
                {shippingErrors.city && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                    {shippingErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="chk-postal" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Postal Code
                </label>
                <input
                  id="chk-postal"
                  type="text"
                  value={shipping.postalCode}
                  onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                  placeholder="100-2187"
                  className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm text-white focus:outline-none ${
                    shippingErrors.postalCode
                      ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                      : 'border-white/15 focus:border-[#00ffff]'
                  }`}
                />
                {shippingErrors.postalCode && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                    {shippingErrors.postalCode}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="chk-country" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Country
                </label>
                <select
                  id="chk-country"
                  value={shipping.country}
                  onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-white/15 bg-[#07090f] px-3 text-sm text-white focus:border-[#00ffff] focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                data-testid="checkout-next-payment"
                className="font-display flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffff] to-[#a855f7] px-6 text-xs font-black tracking-widest text-[#07090f] hover:brightness-110"
              >
                NEXT STEP <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 — MOCK PAYMENT */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="space-y-4">
            <div className="rounded-xl border border-[#ffcc00]/45 bg-[#ffcc00]/10 px-4 py-3 text-xs font-bold text-[#ffcc00]">
              🔒 DEMO ONLY — No real payment is processed
            </div>

            {/* Payment Method Icons */}
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'visa', label: 'VISA' },
                  { id: 'mastercard', label: 'MASTERCARD' },
                  { id: 'paypal', label: 'PAYPAL' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setPaymentMethod(m.id);
                  }}
                  className={`font-display flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-xs font-black tracking-wider transition ${
                    paymentMethod === m.id
                      ? 'border-[#00ffff] bg-[#00ffff]/15 text-[#00ffff]'
                      : 'border-white/15 bg-[#080a10] text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="chk-card" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Card Number (16-digit Demo)
              </label>
              <input
                id="chk-card"
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm tracking-widest text-white focus:outline-none ${
                  paymentErrors.cardNumber
                    ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                    : 'border-white/15 focus:border-[#00ffff]'
                }`}
              />
              {paymentErrors.cardNumber && (
                <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                  {paymentErrors.cardNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="chk-expiry" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Expiry (MM/YY)
                </label>
                <input
                  id="chk-expiry"
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatCardExpiry(e.target.value))}
                  placeholder="12/28"
                  className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm text-white focus:outline-none ${
                    paymentErrors.expiry
                      ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                      : 'border-white/15 focus:border-[#00ffff]'
                  }`}
                />
                {paymentErrors.expiry && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                    {paymentErrors.expiry}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="chk-cvv" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  CVV
                </label>
                <input
                  id="chk-cvv"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="424"
                  className={`mt-1 min-h-[44px] w-full rounded-lg border bg-[#07090f] px-3.5 text-sm text-white focus:outline-none ${
                    paymentErrors.cvv
                      ? 'border-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,0.45)]'
                      : 'border-white/15 focus:border-[#00ffff]'
                  }`}
                />
                {paymentErrors.cvv && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-[#ff3355]">
                    {paymentErrors.cvv}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setStep(1);
                }}
                className="font-display flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-white/20 px-4 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> BACK
              </button>

              <button
                type="submit"
                data-testid="checkout-review-order"
                className="font-display flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffff] to-[#a855f7] px-6 text-xs font-black tracking-widest text-[#07090f] hover:brightness-110"
              >
                REVIEW ORDER <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 — REVIEW & CONFIRM */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-white/10 bg-[#080b12] p-4 sm:grid-cols-2">
              <div className="text-xs text-slate-300">
                <p className="font-display flex items-center gap-1.5 font-bold text-[#00ffff]">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> SHIPPING TO
                </p>
                <p className="mt-1 font-bold text-white">{shipping.fullName}</p>
                <p>{shipping.address}</p>
                <p>
                  {shipping.city}, {shipping.postalCode} · {shipping.country}
                </p>
                <p className="text-slate-400">{shipping.email}</p>
              </div>
              <div className="text-xs text-slate-300">
                <p className="font-display flex items-center gap-1.5 font-bold text-[#ff88dd]">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" /> PAYMENT METHOD
                </p>
                <p className="mt-1 font-bold text-white">
                  {paymentMethod.toUpperCase()} •••• {cardNumber.replace(/\D/g, '').slice(-4) || '4242'}
                </p>
                <p className="text-slate-400">Expires {expiry}</p>
                <p className="mt-1 text-[#ffcc00]">🔒 Demo simulation — no charge</p>
              </div>
            </div>

            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-[#080b12] p-3.5">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-slate-200">
                    <strong className="text-[#00ffff]">{qty}×</strong> {product.name}
                  </span>
                  <span className="font-display shrink-0 font-bold tabular-nums text-[#ffcc00]">
                    ${(product.price * qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 rounded-xl border border-white/10 bg-[#080b12] p-4 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo ({totals.appliedPromo})</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tax (8%)</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-base font-black text-white">
                <span className="font-display">TOTAL</span>
                <AnimatedNumber
                  value={totals.total}
                  prefix="$"
                  className="font-display text-xl text-[#ffcc00]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setStep(2);
                }}
                className="font-display flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-white/20 px-4 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> BACK
              </button>

              <button
                type="button"
                data-testid="place-order-button"
                onClick={handlePlaceOrder}
                className="font-display min-h-[48px] flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-[#ff3355] via-[#ffcc00] to-[#ff00aa] px-6 text-sm font-black tracking-widest text-[#07090f] shadow-[0_0_28px_rgba(255,204,0,0.5)] transition hover:brightness-110"
              >
                ⚡ PLACE ORDER ⚡
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMATION SCREEN */}
        {step === 'confirmed' && confirmedOrder && (
          <div data-testid="order-confirmation" className="py-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.45)]">
              <Check
                data-testid="order-confirmed-check"
                className="h-10 w-10 text-emerald-400 stroke-[3.5] animate-made-by"
                aria-hidden="true"
              />
            </div>

            <p className="font-display mt-5 text-xs font-bold tracking-[0.25em] text-[#00ffff]">
              DISPATCH SEALED · ORDER CONFIRMED
            </p>
            <h3 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">
              Your legend begins!
            </h3>

            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl border border-[#ffcc00]/50 bg-[#ffcc00]/10 px-5 py-2.5">
              <ShieldCheck className="h-4 w-4 text-[#ffcc00]" aria-hidden="true" />
              <span
                data-testid="confirmed-order-id"
                className="font-display text-sm font-black tracking-widest text-[#ffcc00]"
              >
                ORDER #{confirmedOrder.id}
              </span>
            </div>

            <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
              Receipt transmitted to <strong className="text-white">{confirmedOrder.customer.email}</strong>. Total charged (demo):{' '}
              <strong className="text-[#ffcc00]">${confirmedOrder.total.toFixed(2)}</strong>.
            </p>

            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                onClose();
              }}
              className="font-display mt-6 min-h-[46px] cursor-pointer rounded-xl bg-gradient-to-r from-[#00ffff] to-[#ff00aa] px-8 text-xs font-black tracking-widest text-[#07090f] hover:brightness-110"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
