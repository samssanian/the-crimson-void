import { useEffect, useState } from 'react';
import { Crown, Minus, Plus, ShoppingBag, ShoppingCart, Tag, Trash2, X } from 'lucide-react';
import { ARMORY_PRODUCTS } from '../data/armoryData';
import { CartMap, CartTotals, PROMO_CODES, normalizePromoCode } from '../utils/armoryLogic';
import { soundEngine } from '../utils/soundEngine';
import { AnimatedNumber } from './AnimatedNumber';
import { ArmoryProductArt } from './ArmoryProductArt';

interface CartDrawerProps {
  open: boolean;
  cart: CartMap;
  totals: CartTotals;
  promoCode: string;
  bounceKey: number;
  onOpen: () => void;
  onClose: () => void;
  onEmptyCartClick: () => void;
  onUpdateQty: (productId: string, nextQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onApplyPromo: (code: string) => { applied: boolean; code: string | null; isSecret?: boolean };
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  open,
  cart,
  totals,
  promoCode,
  bounceKey,
  onOpen,
  onClose,
  onEmptyCartClick,
  onUpdateQty,
  onRemoveItem,
  onApplyPromo,
  onProceedToCheckout,
}: CartDrawerProps) {
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoStatus, setPromoStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [floatingPromoText, setFloatingPromoText] = useState<string | null>(null);
  const [poppingId, setPoppingId] = useState<string | null>(null);

  useEffect(() => {
    setPromoInput(promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.play('cartClose');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const productMap = new Map(ARMORY_PRODUCTS.map((p) => [p.id, p]));
  const cartEntries = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ product: productMap.get(id), qty }))
    .filter((entry): entry is { product: NonNullable<typeof entry.product>; qty: number } =>
      Boolean(entry.product)
    );

  const handleFloatingClick = () => {
    soundEngine.unlock();
    if (totals.itemCount === 0) {
      onEmptyCartClick();
    }
    soundEngine.play('cartOpen');
    onOpen();
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.unlock();
    const res = onApplyPromo(promoInput);
    if (res.applied && res.code) {
      const info = PROMO_CODES[res.code];
      soundEngine.play('sparkle');
      setPromoStatus({ ok: true, msg: `${res.code} active — ${info.label}` });
      setFloatingPromoText(res.isSecret ? '👑 50% OFF SECRET!' : `⚡ -10% (${res.code})`);
      window.setTimeout(() => setFloatingPromoText(null), 2400);
    } else {
      soundEngine.play('errorBuzz');
      setPromoStatus({ ok: false, msg: 'Invalid promo code. Try CRIMSON10.' });
    }
  };

  return (
    <>
      {/* Fixed Bottom-Right Floating Cart Button */}
      <button
        key={bounceKey}
        type="button"
        data-testid="floating-cart-button"
        onClick={handleFloatingClick}
        aria-label={`Open shopping cart (${totals.itemCount} items)`}
        className={`fixed right-5 bottom-5 z-40 flex h-14 cursor-pointer items-center gap-2.5 rounded-2xl border px-4 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#00ffff] ${
          bounceKey > 0 ? 'animate-cart-bounce' : ''
        } ${
          totals.isWhaleMode
            ? 'border-[#ffcc00] bg-[#1a1306]/95 text-[#ffcc00] shadow-[0_0_28px_rgba(255,204,0,0.65)]'
            : totals.itemCount > 0
            ? 'border-[#00ffff] bg-[#0c111b]/95 text-white shadow-[0_0_24px_rgba(0,255,255,0.45)]'
            : 'border-white/25 bg-[#0c111b]/90 text-slate-200 shadow-lg'
        }`}
      >
        {totals.isWhaleMode ? (
          <Crown className="h-5 w-5 text-[#ffcc00]" aria-hidden="true" />
        ) : (
          <ShoppingCart className="h-5 w-5 text-[#00ffff]" aria-hidden="true" />
        )}
        <span className="font-display text-xs font-black tracking-wider">
          {totals.isWhaleMode ? 'WHALE CART' : 'ARMORY CART'}
        </span>
        <span
          data-testid="floating-cart-count"
          className={`font-display flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-black tabular-nums ${
            totals.itemCount > 0
              ? 'animate-pulse bg-[#ff3355] text-white shadow-[0_0_12px_rgba(255,51,85,0.75)]'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {totals.itemCount}
        </span>
      </button>

      {/* Sliding Right Cart Drawer */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Armory shopping cart drawer"
          data-testid="cart-drawer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundEngine.play('cartClose');
              onClose();
            }
          }}
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
        >
          <div className="animate-drawer-in flex h-full w-full flex-col border-l border-[#00ffff]/40 bg-[#0b0e16] shadow-[0_0_40px_rgba(0,255,255,0.2)] sm:max-w-md">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-[#00ffff]" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-base font-black text-white">
                    ARMORY LOADOUT
                  </h3>
                  <p className="text-xs text-slate-400">
                    {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} forged
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.play('cartClose');
                  onClose();
                }}
                aria-label="Close cart drawer"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:border-[#ff3355] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Whale Mode Banner */}
            {totals.isWhaleMode && (
              <div
                data-testid="whale-mode-banner"
                className="border-b border-[#ffcc00]/45 bg-gradient-to-r from-[#ffcc00]/20 via-[#ff3355]/15 to-[#ffcc00]/20 px-5 py-2.5 text-center"
              >
                <p className="font-display text-xs font-black tracking-widest text-[#ffcc00]">
                  🏆 WHALE MODE UNLOCKED — GUARDIAN&apos;S FAVOR
                </p>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {cartEntries.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-slate-600" aria-hidden="true" />
                  <p className="font-display mt-4 text-base font-bold text-white">
                    Your Armory Cart is Empty
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm text-slate-400">
                    Equip a Crimson Fang katana, limited figure, or cosplay set to begin.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.play('cartClose');
                      onClose();
                    }}
                    className="font-display mt-5 min-h-[44px] cursor-pointer rounded-xl border border-[#00ffff]/50 bg-[#00ffff]/10 px-5 text-xs font-bold tracking-wider text-[#00ffff] hover:bg-[#00ffff]/20"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                cartEntries.map(({ product, qty }) => (
                  <div
                    key={product.id}
                    data-testid={`cart-item-${product.id}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101521] p-3"
                  >
                    <div className="shrink-0 rounded-lg border border-white/10 bg-[#07090f] p-1">
                      <ArmoryProductArt
                        artKey={product.artKey}
                        accentColor={product.accentColor}
                        size="thumb"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display truncate text-xs font-bold text-white">
                        {product.name}
                      </p>
                      <p className="font-display mt-0.5 text-sm font-black text-[#ffcc00]">
                        ${(product.price * qty).toFixed(2)}
                        <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                          (${product.price.toFixed(2)} ea)
                        </span>
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-lg border border-white/15 bg-[#080a0f]">
                          <button
                            type="button"
                            onClick={() => {
                              setPoppingId(product.id);
                              window.setTimeout(() => setPoppingId(null), 260);
                              onUpdateQty(product.id, qty - 1);
                            }}
                            aria-label={`Decrease ${product.name} quantity`}
                            className="flex h-11 w-11 cursor-pointer items-center justify-center text-slate-300 hover:text-[#00ffff]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className={`font-display w-8 text-center text-xs font-black tabular-nums text-white ${
                              poppingId === product.id ? 'animate-qty-pop' : ''
                            }`}
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPoppingId(product.id);
                              window.setTimeout(() => setPoppingId(null), 260);
                              onUpdateQty(product.id, qty + 1);
                            }}
                            aria-label={`Increase ${product.name} quantity`}
                            className="flex h-11 w-11 cursor-pointer items-center justify-center text-slate-300 hover:text-[#00ffff]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label={`Remove ${product.name} from cart`}
                          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-rose-500/35 text-rose-300 hover:bg-rose-500/15"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo + Summary + Checkout Footer */}
            {cartEntries.length > 0 && (
              <div className="relative border-t border-white/10 bg-[#080b11] p-5">
                {floatingPromoText && (
                  <div className="animate-promo-float font-display pointer-events-none absolute -top-7 right-5 rounded-md bg-[#ffcc00] px-3 py-1 text-xs font-black text-black shadow-lg">
                    {floatingPromoText}
                  </div>
                )}

                <form onSubmit={handlePromoSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (CRIMSON10)"
                      aria-label="Promo code"
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#0e131e] pr-3 pl-9 text-xs font-bold uppercase tracking-wider text-white placeholder-slate-500 focus:border-[#00ffff] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="font-display min-h-[44px] cursor-pointer rounded-xl border border-[#00ffff]/50 bg-[#00ffff]/15 px-4 text-xs font-black tracking-wider text-[#00ffff] hover:bg-[#00ffff]/25"
                  >
                    APPLY
                  </button>
                </form>

                {promoStatus && (
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      promoStatus.ok ? 'text-emerald-400' : 'text-[#ff3355]'
                    }`}
                  >
                    {promoStatus.msg}
                  </p>
                )}

                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <AnimatedNumber value={totals.subtotal} prefix="$" className="font-semibold" />
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo ({normalizePromoCode(promoCode)})</span>
                      <span className="font-semibold tabular-nums">
                        -${totals.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Shipping (Free $150+)</span>
                    <span className="font-semibold tabular-nums">
                      {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Estimated Tax (8%)</span>
                    <AnimatedNumber value={totals.tax} prefix="$" className="font-semibold" />
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-base font-black text-white">
                    <span className="font-display">TOTAL</span>
                    <AnimatedNumber
                      value={totals.total}
                      prefix="$"
                      className="font-display text-lg font-black text-[#ffcc00]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="proceed-to-checkout"
                  onClick={() => {
                    soundEngine.play('checkoutStart');
                    onProceedToCheckout();
                  }}
                  className="font-display mt-4 min-h-[48px] w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#ff3355] via-[#ff00aa] to-[#a855f7] px-5 text-xs font-black tracking-widest text-white shadow-[0_0_24px_rgba(255,0,170,0.45)] transition hover:brightness-110"
                >
                  PROCEED TO CHECKOUT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('cartClose');
                    onClose();
                  }}
                  className="mt-2 min-h-[40px] w-full cursor-pointer text-center text-xs font-semibold text-slate-400 hover:text-[#00ffff]"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
