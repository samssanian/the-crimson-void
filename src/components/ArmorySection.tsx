import { useRef, useState, MouseEvent } from 'react';
import { Eye, ShoppingCart, Star } from 'lucide-react';
import {
  ARMORY_CATEGORIES,
  ARMORY_PRODUCTS,
  ArmoryCategory,
  ArmoryProduct,
  CATEGORY_STYLE_MAP,
} from '../data/armoryData';
import { soundEngine } from '../utils/soundEngine';
import { ArmoryProductArt } from './ArmoryProductArt';
import { ProductDetailModal } from './ProductDetailModal';

interface ArmorySectionProps {
  wishlistIds: string[];
  onAddToCart: (product: ArmoryProduct, quantity?: number) => void;
  onToggleWishlist: (productId: string) => void;
}

interface ProductCardProps {
  product: ArmoryProduct;
  onAddToCart: (product: ArmoryProduct, quantity?: number) => void;
  onInspect: (
    product: ArmoryProduct,
    rect: { left: number; top: number; width: number; height: number }
  ) => void;
}

function ProductCard({ product, onAddToCart, onInspect }: ProductCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const lastTiltMoveRef = useRef(0);
  const lastHoverSoundRef = useRef(0);

  const catStyle = CATEGORY_STYLE_MAP[product.category];
  const soldOut = product.stock <= 0;

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const now = performance.now();
    if (now - lastTiltMoveRef.current < 24) return;
    lastTiltMoveRef.current = now;

    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(
      x * 7
    ).toFixed(2)}deg) translateY(-6px)`;
  };

  const handleMouseEnter = () => {
    const now = performance.now();
    if (now - lastHoverSoundRef.current > 180) {
      lastHoverSoundRef.current = now;
      soundEngine.play('productHover');
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
  };

  return (
    <article
      ref={cardRef}
      data-testid={`armory-card-${product.id}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="holo-card-border group relative rounded-2xl p-[1.5px] transition-transform duration-200 will-change-transform"
    >
      <div className="flex h-full flex-col justify-between rounded-[14.5px] bg-[#0b0e16]/95 p-5 shadow-[0_0_24px_rgba(0,0,0,0.55)]">
        <div>
          {/* Top Row: Category Badge + Merch Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`font-display rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${catStyle.bgClass} ${catStyle.textClass} ${catStyle.borderClass}`}
            >
              {catStyle.label}
            </span>
            <span className="font-display text-[11px] font-black tracking-wider text-[#ffcc00]">
              {product.badge}
            </span>
          </div>

          {/* Product Artwork Frame */}
          <div className="mt-4 flex items-center justify-center rounded-xl border border-white/10 bg-[#07090f] py-4">
            <ArmoryProductArt artKey={product.artKey} accentColor={product.accentColor} />
          </div>

          {/* Stock & Rating */}
          <div className="mt-4 flex items-center justify-between gap-2 text-xs">
            {soldOut ? (
              <span className="font-display font-bold text-[#ff3355]">❌ SOLD OUT</span>
            ) : product.stock <= 5 ? (
              <span className="font-display animate-pulse font-bold text-[#ff3355]">
                🔥 Only {product.stock} left!
              </span>
            ) : (
              <span className="font-display font-bold text-emerald-400">⚡ In Stock</span>
            )}

            <span className="flex items-center gap-1 font-semibold text-[#ffcc00]">
              <Star className="h-3.5 w-3.5 fill-[#ffcc00] text-[#ffcc00]" aria-hidden="true" />
              {product.rating.toFixed(1)}
              <span className="text-slate-400">({product.reviewCount})</span>
            </span>
          </div>

          {/* Title & Tagline */}
          <h3 className="font-display mt-2.5 text-base font-black leading-snug text-white">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-slate-300">{product.tagline}</p>
        </div>

        {/* Price + Actions */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl font-black text-[#ffcc00]">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm font-semibold text-slate-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              disabled={soldOut}
              data-testid={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart(product, 1)}
              aria-label={`Add ${product.name} to cart`}
              className="font-display flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff3355] to-[#ff00aa] px-3 text-xs font-black tracking-wider text-white shadow-[0_0_16px_rgba(255,51,85,0.35)] transition hover:brightness-110 active:scale-95 disabled:opacity-45"
            >
              <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
              ADD TO CART
            </button>
            <button
              type="button"
              data-testid={`view-details-${product.id}`}
              onClick={() => {
                soundEngine.unlock();
                soundEngine.play('productSelect');
                const rect = cardRef.current?.getBoundingClientRect();
                onInspect(
                  product,
                  rect
                    ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
                    : { left: 0, top: 0, width: 320, height: 320 }
                );
              }}
              aria-label={`View details for ${product.name}`}
              className="font-display flex min-h-[44px] cursor-pointer items-center justify-center gap-1 rounded-xl border border-cyan-400/45 bg-cyan-500/10 px-3 text-xs font-bold tracking-wider text-[#00ffff] transition hover:bg-cyan-500/20"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              VIEW DETAILS
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ArmorySection({
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
}: ArmorySectionProps) {
  const [activeCategory, setActiveCategory] = useState<ArmoryCategory>('all');
  const [selectedProduct, setSelectedProduct] = useState<ArmoryProduct | null>(null);
  const [originRect, setOriginRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const visibleProducts =
    activeCategory === 'all'
      ? ARMORY_PRODUCTS
      : ARMORY_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section
      id="armory"
      aria-label="The Armory Merchandise Store"
      className="relative border-b border-cyan-500/20 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-body text-sm font-bold tracking-[0.22em] text-[#ffcc00]">
              GUARDIAN FORGE · OFFICIAL ARENA MERCH
            </p>
            <h2 className="font-display mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
              🛒 THE ARMORY — FORGE YOUR LEGEND
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-300">
              Official merch from the Crimson Void. Every piece forged by the guardian himself.
            </p>
          </div>

          <div className="rounded-xl border border-[#00ffff]/35 bg-[#0d121b] px-4 py-2.5 text-xs">
            <span className="font-display font-bold tracking-wider text-[#00ffff]">
              USE CODE <strong className="text-[#ffcc00]">CRIMSON10</strong> FOR 10% OFF
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Armory product categories"
          className="mb-8 flex flex-wrap gap-2"
        >
          {ARMORY_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`armory-tab-${cat.id}`}
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.play('select');
                  setActiveCategory(cat.id);
                }}
                className={`font-display min-h-[44px] cursor-pointer rounded-xl border px-4 text-xs font-black tracking-wider transition ${
                  active
                    ? 'border-[#00ffff] bg-[#00ffff] text-[#0a0c0f] shadow-[0_0_20px_rgba(0,255,255,0.45)]'
                    : 'border-white/15 bg-[#0e131e] text-slate-300 hover:border-cyan-400/50 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div
          data-testid="armory-product-grid"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onInspect={(prod, rect) => {
                setOriginRect(rect);
                setSelectedProduct(prod);
              }}
            />
          ))}
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        originRect={originRect}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
      />
    </section>
  );
}
