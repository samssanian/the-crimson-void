import { useEffect, useState } from 'react';
import { Heart, Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import { ArmoryProduct, CATEGORY_STYLE_MAP } from '../data/armoryData';
import { soundEngine } from '../utils/soundEngine';
import { ArmoryProductArt } from './ArmoryProductArt';

interface ProductDetailModalProps {
  product: ArmoryProduct | null;
  originRect?: { left: number; top: number; width: number; height: number } | null;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: ArmoryProduct, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
}

export function ProductDetailModal({
  product,
  originRect,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setEntered(false);
    if (!product) return;
    const raf = window.requestAnimationFrame(() => setEntered(true));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.play('click');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const catStyle = CATEGORY_STYLE_MAP[product.category];
  const soldOut = product.stock <= 0;

  // Compute subtle FLIP zoom-from-card offset before transition completes
  const initialTransform = (() => {
    if (entered || !originRect || typeof window === 'undefined') {
      return 'translate3d(0, 0, 0) scale(1)';
    }
    const cx = originRect.left + originRect.width / 2 - window.innerWidth / 2;
    const cy = originRect.top + originRect.height / 2 - window.innerHeight / 2;
    return `translate3d(${Math.round(cx * 0.45)}px, ${Math.round(cy * 0.45)}px, 0) scale(0.76)`;
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} details`}
      data-testid="product-detail-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.play('click');
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
    >
      <div
        style={{ transform: initialTransform }}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#00ffff]/55 bg-[#0b0e16] p-5 shadow-[0_0_50px_rgba(0,255,255,0.22)] transition-transform duration-300 ease-out sm:p-8"
      >
        <button
          type="button"
          onClick={() => {
            soundEngine.play('click');
            onClose();
          }}
          aria-label="Close product details"
          className="absolute top-4 right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 transition hover:border-[#ff3355] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          {/* Product Visual */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#07090f] p-4">
            <ArmoryProductArt
              artKey={product.artKey}
              accentColor={product.accentColor}
              size="modal"
            />
            <span
              className={`font-display mt-2 rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wider ${catStyle.bgClass} ${catStyle.textClass} ${catStyle.borderClass}`}
            >
              {catStyle.label}
            </span>
          </div>

          {/* Info & Lore */}
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xs font-black tracking-wider text-[#ffcc00]">
                {product.badge}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="flex items-center gap-1 text-xs font-bold text-[#ffcc00]">
                <Star className="h-3.5 w-3.5 fill-[#ffcc00] text-[#ffcc00]" aria-hidden="true" />
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <h3 className="font-display mt-2 text-xl font-black text-white sm:text-2xl">
              {product.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-[#00ffff]">{product.tagline}</p>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-2xl font-black text-[#ffcc00]">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-semibold text-slate-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {soldOut ? (
                <span className="font-display text-xs font-bold text-[#ff3355]">❌ SOLD OUT</span>
              ) : product.stock <= 5 ? (
                <span className="font-display animate-pulse text-xs font-bold text-[#ff3355]">
                  🔥 Only {product.stock} left!
                </span>
              ) : (
                <span className="font-display text-xs font-bold text-emerald-400">
                  ⚡ In Stock
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {product.loreDescription}
            </p>

            {/* Specifications */}
            <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs">
              <div>
                <span className="font-bold text-slate-400">DIMENSIONS: </span>
                <span className="text-slate-200">{product.specs.dimensions}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400">MATERIALS: </span>
                <span className="text-slate-200">{product.specs.materials}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400">EDITION: </span>
                <span className="text-[#ffcc00]">{product.specs.edition}</span>
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-white/15 bg-[#07090f]">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center text-slate-300 hover:text-[#00ffff]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  data-testid="modal-quantity"
                  className="font-display w-9 text-center text-sm font-black tabular-nums text-white"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setQuantity((q) => Math.min(20, q + 1));
                  }}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center text-slate-300 hover:text-[#00ffff]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={soldOut}
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="font-display flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff3355] to-[#ff00aa] px-5 text-xs font-black tracking-widest text-white shadow-[0_0_20px_rgba(255,51,85,0.4)] transition hover:brightness-110 disabled:opacity-45"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                ADD TO CART
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.play(isWishlisted ? 'click' : 'sparkle');
                  onToggleWishlist(product.id);
                }}
                aria-pressed={isWishlisted}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`font-display flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-4 text-xs font-bold tracking-wider transition ${
                  isWishlisted
                    ? 'border-[#ff00aa] bg-[#ff00aa]/20 text-[#ff88dd]'
                    : 'border-white/20 bg-white/5 text-slate-200 hover:border-[#ff00aa]/60'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? 'fill-[#ff00aa] text-[#ff00aa]' : ''}`}
                  aria-hidden="true"
                />
                WISHLIST
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-7 border-t border-white/10 pt-5">
          <h4 className="font-display text-xs font-bold tracking-[0.2em] text-[#00ffff]">
            WARRIOR REVIEWS ({product.reviews.length} FEATURED)
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-white/10 bg-[#080a10] p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-black"
                    style={{ backgroundColor: rev.avatarColor }}
                  >
                    {rev.author.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display truncate text-xs font-bold text-white">
                      {rev.author}
                    </p>
                    <p className="text-[11px] text-[#ffcc00]">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
