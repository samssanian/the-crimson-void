import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ANIME_QUOTES } from './data/loreData';
import { ARMORY_PRODUCTS, ArmoryProduct } from './data/armoryData';
import {
  ArenaMessage,
  INITIAL_SEED_MESSAGES,
  advanceKonamiSequence,
  checkTripleKeyPress,
  createArenaMessage,
  getUnreadCount,
} from './utils/arenaLogic';
import {
  ArmoryOrder,
  CartMap,
  HOARDER_QUANTITY_THRESHOLD,
  INITIAL_SEED_ORDERS,
  OrderStatus,
  calculateCartTotals,
  normalizePromoCode,
} from './utils/armoryLogic';
import { soundEngine } from './utils/soundEngine';
import { ParticleCanvas, ParticleCanvasHandle } from './components/ParticleCanvas';
import { BootSequence } from './components/BootSequence';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { LegendSection } from './components/LegendSection';
import { ProphecySection } from './components/ProphecySection';
import { FightersSection } from './components/FightersSection';
import { BattlesSection } from './components/BattlesSection';
import { ArmorySection } from './components/ArmorySection';
import { AdminPanelSection } from './components/AdminPanelSection';
import { ContactSection } from './components/ContactSection';
import { FooterFinale } from './components/FooterFinale';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';

const MESSAGES_STORAGE_KEY = 'crimson_void_messages';
const CART_STORAGE_KEY = 'crimson_void_cart';
const WISHLIST_STORAGE_KEY = 'crimson_void_wishlist';
const ORDERS_STORAGE_KEY = 'crimson_void_orders';
const PROMO_STORAGE_KEY = 'crimson_void_promo';

function loadInitialMessages(): ArenaMessage[] {
  if (typeof window === 'undefined') return INITIAL_SEED_MESSAGES;
  try {
    const raw = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) return INITIAL_SEED_MESSAGES;
    const parsed = JSON.parse(raw) as ArenaMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_MESSAGES;
  } catch {
    return INITIAL_SEED_MESSAGES;
  }
}

function loadInitialCart(): CartMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CartMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadInitialWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadInitialOrders(): ArmoryOrder[] {
  if (typeof window === 'undefined') return INITIAL_SEED_ORDERS;
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return INITIAL_SEED_ORDERS;
    const parsed = JSON.parse(raw) as ArmoryOrder[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_ORDERS;
  } catch {
    return INITIAL_SEED_ORDERS;
  }
}

function loadInitialPromo(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(PROMO_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export default function App() {
  const skipBoot =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const particleRef = useRef<ParticleCanvasHandle | null>(null);
  const [bootDone, setBootDone] = useState(skipBoot);
  const [muted, setMuted] = useState(() => soundEngine.isMuted());
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [shaking, setShaking] = useState(false);

  const [messages, setMessages] = useState<ArenaMessage[]>(loadInitialMessages);
  const [cart, setCart] = useState<CartMap>(loadInitialCart);
  const [wishlistIds, setWishlistIds] = useState<string[]>(loadInitialWishlist);
  const [orders, setOrders] = useState<ArmoryOrder[]>(loadInitialOrders);
  const [promoCode, setPromoCode] = useState<string>(loadInitialPromo);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartBounceKey, setCartBounceKey] = useState(0);

  // Toast & Quote Easter Egg state
  const [toast, setToast] = useState<string | null>(null);
  const [quotePopup, setQuotePopup] = useState<string | null>(null);
  const [shadowMode, setShadowMode] = useState(false);

  // Easter Egg trackers
  const logoClicksRef = useRef(0);
  const emptyCartClicksRef = useRef(0);
  const whaleNotifiedRef = useRef(false);
  const konamiHistoryRef = useRef<string[]>([]);
  const tripleKRef = useRef({ count: 0, timestamp: 0 });

  const cartTotals = useMemo(
    () => calculateCartTotals(cart, ARMORY_PRODUCTS, promoCode),
    [cart, promoCode]
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3400);
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 320);
  }, []);

  const triggerBurst = useCallback(
    (x: number, y: number, count = 40, colors?: string[]) => {
      particleRef.current?.burst(x, y, count, colors);
    },
    []
  );

  // Persist messages, cart, wishlist, orders, and promo to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
    } catch {
      // Ignore
    }
  }, [promoCode]);

  // Whale Mode ($500+) Easter egg notification
  useEffect(() => {
    if (cartTotals.isWhaleMode && !whaleNotifiedRef.current) {
      whaleNotifiedRef.current = true;
      soundEngine.play('sparkle');
      showToast('🏆 WHALE MODE UNLOCKED — The guardian acknowledges your devotion!');
    } else if (!cartTotals.isWhaleMode) {
      whaleNotifiedRef.current = false;
    }
  }, [cartTotals.isWhaleMode, showToast]);

  // Global keyboard easter eggs: K x3 -> Ultra Instinct, Konami -> Shadow Mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Check K x3 -> ULTRA INSTINCT
      const kCheck = checkTripleKeyPress(
        e.key,
        'k',
        tripleKRef.current.count,
        tripleKRef.current.timestamp,
        Date.now()
      );
      tripleKRef.current = { count: kCheck.count, timestamp: kCheck.timestamp };
      if (kCheck.triggered) {
        soundEngine.unlock();
        soundEngine.play('charge');
        soundEngine.play('sparkle');
        particleRef.current?.goldStorm(5000);
        showToast('⚡ ULTRA INSTINCT AWAKENED — GOLDEN AURA ACTIVE (5s) ⚡');
      }

      // Check Konami Code -> SHADOW MODE
      const konamiRes = advanceKonamiSequence(konamiHistoryRef.current, e.key);
      konamiHistoryRef.current = konamiRes.nextHistory;
      if (konamiRes.matched) {
        soundEngine.unlock();
        soundEngine.play('shing');
        setShadowMode((prev) => {
          const next = !prev;
          document.documentElement.classList.toggle('shadow-mode', next);
          showToast(next ? '🌑 SHADOW MODE ACTIVATED' : '☀️ CRIMSON VOID RESTORED');
          return next;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showToast]);

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.play('click');
    }
  };

  const handleToggleMusic = () => {
    const nextMusic = soundEngine.toggleMusic();
    setMusicPlaying(nextMusic);
    soundEngine.play('select');
  };

  const handleLogoClick = () => {
    soundEngine.play('click');
    logoClicksRef.current += 1;
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      soundEngine.play('sparkle');
      const quote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
      setQuotePopup(quote);
      window.setTimeout(() => setQuotePopup(null), 4500);
    }
  };

  const handleAddToCart = (product: ArmoryProduct, quantity = 1) => {
    soundEngine.unlock();
    soundEngine.play('addToCart');
    emptyCartClicksRef.current = 0;

    const currentQty = cart[product.id] ?? 0;
    const nextQty = currentQty + quantity;
    setCart((prev) => ({
      ...prev,
      [product.id]: nextQty,
    }));
    setCartBounceKey((k) => k + 1);

    if (nextQty >= HOARDER_QUANTITY_THRESHOLD && currentQty < HOARDER_QUANTITY_THRESHOLD) {
      soundEngine.play('sparkle');
      showToast(`💎 VOID HOARDER! ${nextQty}× ${product.name} in your armory!`);
    } else {
      showToast(`🛒 Added ${quantity}× ${product.name} to cart!`);
    }
  };

  const handleUpdateCartQty = (productId: string, nextQty: number) => {
    soundEngine.unlock();
    if (nextQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const prevQty = cart[productId] ?? 0;
    soundEngine.play(nextQty > prevQty ? 'addToCart' : 'click');
    setCart((prev) => ({ ...prev, [productId]: nextQty }));
    if (nextQty >= HOARDER_QUANTITY_THRESHOLD && prevQty < HOARDER_QUANTITY_THRESHOLD) {
      soundEngine.play('sparkle');
      showToast('💎 VOID HOARDER ACHIEVED! Building an army for the Seventh Rift!');
    }
  };

  const handleRemoveCartItem = (productId: string) => {
    soundEngine.unlock();
    soundEngine.play('removeFromCart');
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    showToast('Item removed from Armory cart.');
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleApplyPromo = (rawCode: string) => {
    const valid = normalizePromoCode(rawCode);
    if (!valid) {
      return { applied: false, code: null };
    }
    setPromoCode(valid);
    const isSecret = valid === 'SAMSLEGEND';
    if (isSecret) {
      showToast('👑 SECRET CODE UNLOCKED: SAMSLEGEND — 50% OFF ENTIRE ORDER!');
    } else {
      showToast(`⚡ Promo ${valid} applied — 10% Void Discount!`);
    }
    return { applied: true, code: valid, isSecret };
  };

  const handleEmptyCartClick = () => {
    emptyCartClicksRef.current += 1;
    if (emptyCartClicksRef.current >= 5) {
      emptyCartClicksRef.current = 0;
      soundEngine.play('sparkle');
      showToast('💀 Even Sams Sanian Ahamod started with an empty scabbard. Add some gear!');
    }
  };

  const handleOrderComplete = (newOrder: ArmoryOrder) => {
    soundEngine.play('checkoutSuccess');
    window.setTimeout(() => soundEngine.play('orderNotify'), 550);
    particleRef.current?.confetti(110);
    setOrders((prev) => [newOrder, ...prev]);
    setCart({});
    setPromoCode('');
    showToast(`⚡ Order #${newOrder.id} sealed! Check The Guardian's Eye!`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, isNew: false } : o))
    );
    showToast(`Order #${orderId} updated to ${status.toUpperCase()}.`);
  };

  const handleSendMessage = (name: string, email: string, message: string) => {
    const newMsg = createArenaMessage(name, email, message);
    setMessages((prev) => [newMsg, ...prev]);
    soundEngine.play('sent');
    soundEngine.play('sparkle');
    particleRef.current?.confetti(80);
    showToast("⚡ Whisper saved locally in The Guardian's Eye panel!");
  };

  const handleMarkRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div
      data-testid="app-shell"
      data-shadow-mode={shadowMode ? 'on' : 'off'}
      className={`relative min-h-screen bg-[#0a0c0f] text-slate-100 ${
        shaking ? 'animate-arena-shake' : ''
      }`}
    >
      {/* Pulsing Cyber Grid Layer */}
      <div aria-hidden="true" className="void-grid-bg pointer-events-none fixed inset-0 z-0" />

      {/* Global Particle Canvas */}
      <ParticleCanvas ref={particleRef} />

      {/* 2.5s Boot Sequence (skipped via ?autostart=1) */}
      {!bootDone && <BootSequence skipImmediate={skipBoot} onComplete={() => setBootDone(true)} />}

      {/* Navbar */}
      <Navbar
        muted={muted}
        musicPlaying={musicPlaying}
        unreadCount={getUnreadCount(messages)}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <LegendSection />
        <ProphecySection />
        <FightersSection />
        <BattlesSection
          onTriggerShake={triggerShake}
          onTriggerBurst={(x, y, colors) => triggerBurst(x, y, 42, colors)}
        />
        <ArmorySection
          wishlistIds={wishlistIds}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
        <AdminPanelSection
          messages={messages}
          orders={orders}
          onMarkRead={handleMarkRead}
          onDeleteMessage={handleDeleteMessage}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
        <ContactSection onSendMessage={handleSendMessage} />
      </main>

      {/* Epic Anime Finale Footer */}
      <FooterFinale onBurst={triggerBurst} onShake={triggerShake} onToast={showToast} />

      {/* Floating Cart Button & Drawer */}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        totals={cartTotals}
        promoCode={promoCode}
        bounceKey={cartBounceKey}
        onOpen={() => setCartOpen(true)}
        onClose={() => setCartOpen(false)}
        onEmptyCartClick={handleEmptyCartClick}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onApplyPromo={handleApplyPromo}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        cart={cart}
        totals={cartTotals}
        promoCode={promoCode}
        onClose={() => setCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
      />

      {/* Toast Notification (bottom-left, clear of right cart drawer & floating button) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="arena-toast"
          className="font-display fixed bottom-5 left-5 z-[60] max-w-sm rounded-xl border border-[#00ffff]/60 bg-[#0d121a]/95 px-5 py-3.5 text-xs font-bold tracking-wider text-[#00ffff] shadow-[0_0_24px_rgba(0,255,255,0.35)] backdrop-blur-md"
        >
          {toast}
        </div>
      )}

      {/* Logo 5x Anime Quote Popup */}
      {quotePopup && (
        <div
          role="dialog"
          aria-label="Crimson Void wisdom"
          data-testid="quote-popup"
          className="fixed top-20 left-1/2 z-50 w-[90%] max-w-lg -translate-x-1/2 rounded-2xl border border-[#ffcc00]/65 bg-[#120d18]/95 p-5 text-center shadow-[0_0_32px_rgba(255,204,0,0.35)] backdrop-blur-md"
        >
          <p className="font-display text-xs font-bold tracking-[0.22em] text-[#ffcc00]">
            ⚡ ECHO OF THE CRIMSON BLADE ⚡
          </p>
          <p className="mt-2 text-base font-semibold text-white">{quotePopup}</p>
        </div>
      )}
    </div>
  );
}
