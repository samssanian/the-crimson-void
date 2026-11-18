import { useEffect, useState, FormEvent } from 'react';
import {
  Shield,
  Mail,
  MessageSquare,
  Trash2,
  Check,
  Lock,
  LogOut,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff,
  BarChart3,
  ShoppingBag,
  Search,
  ChevronDown,
  ChevronUp,
  Crown,
  X,
} from 'lucide-react';
import {
  ADMIN_LOCKOUT_SECONDS,
  ArenaMessage,
  FlowerTile,
  MAX_ADMIN_AUTH_ATTEMPTS,
  REQUIRED_ROSE_COUNT,
  generateFlowerVerificationGrid,
  getUnreadCount,
  verifyAdminPasscode,
  verifyRoseSelection,
} from '../utils/arenaLogic';
import {
  ArmoryOrder,
  OrderStatus,
  computeOrderAnalytics,
} from '../utils/armoryLogic';
import { ARMORY_PRODUCTS, CATEGORY_STYLE_MAP } from '../data/armoryData';
import { SEED_GMAIL_DISPATCHES } from '../data/loreData';
import { soundEngine } from '../utils/soundEngine';
import { FlowerArtwork } from './FlowerArtwork';
import { AnimatedNumber } from './AnimatedNumber';
import { ArmoryProductArt } from './ArmoryProductArt';

interface AdminPanelSectionProps {
  messages: ArenaMessage[];
  orders: ArmoryOrder[];
  onMarkRead: (id: string) => void;
  onDeleteMessage: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

type AuthStage = 'passcode' | 'flowers' | 'unlocked';
type AdminTab = 'dashboard' | 'orders' | 'messages' | 'gmail';

const STATUS_STYLE: Record<OrderStatus, { label: string; badgeClass: string }> = {
  pending: {
    label: '⏳ Pending',
    badgeClass: 'border-amber-400/50 bg-amber-500/15 text-[#ffcc00]',
  },
  shipped: {
    label: '✅ Shipped',
    badgeClass: 'border-cyan-400/50 bg-cyan-500/15 text-[#00ffff]',
  },
  delivered: {
    label: '📦 Delivered',
    badgeClass: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300',
  },
  cancelled: {
    label: '❌ Cancelled',
    badgeClass: 'border-rose-500/50 bg-rose-500/15 text-[#ff6680]',
  },
};

export function AdminPanelSection({
  messages,
  orders,
  onMarkRead,
  onDeleteMessage,
  onUpdateOrderStatus,
}: AdminPanelSectionProps) {
  const [authStage, setAuthStage] = useState<AuthStage>('passcode');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSec, setLockoutSec] = useState(0);

  const [flowerGrid, setFlowerGrid] = useState<FlowerTile[]>(() => generateFlowerVerificationGrid());
  const [selectedFlowerIds, setSelectedFlowerIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const [orderSearch, setOrderSearch] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [detailOrder, setDetailOrder] = useState<ArmoryOrder | null>(null);

  const unreadCount = getUnreadCount(messages);
  const analytics = computeOrderAnalytics(orders, ARMORY_PRODUCTS);

  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = window.setTimeout(() => {
      setLockoutSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [lockoutSec]);

  useEffect(() => {
    if (!detailOrder) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.play('click');
        setDetailOrder(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailOrder]);

  const registerFailedAttempt = (errorMessage: string, resetToPasscode = false) => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= MAX_ADMIN_AUTH_ATTEMPTS) {
      setFailedAttempts(0);
      setLockoutSec(ADMIN_LOCKOUT_SECONDS);
      setAuthError(
        `Too many invalid attempts. Security lock active for ${ADMIN_LOCKOUT_SECONDS}s.`
      );
      if (resetToPasscode) {
        setAuthStage('passcode');
      }
    } else {
      setAuthError(
        `${errorMessage} (${MAX_ADMIN_AUTH_ATTEMPTS - nextAttempts} ${
          MAX_ADMIN_AUTH_ATTEMPTS - nextAttempts === 1 ? 'attempt' : 'attempts'
        } before lockout)`
      );
    }
  };

  const handlePasscodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (lockoutSec > 0) return;
    soundEngine.unlock();

    if (verifyAdminPasscode(passcode)) {
      soundEngine.play('click');
      setPasscode('');
      setShowPasscode(false);
      setAuthError('');
      setFailedAttempts(0);
      setFlowerGrid(generateFlowerVerificationGrid());
      setSelectedFlowerIds([]);
      setAuthStage('flowers');
    } else {
      soundEngine.play('error');
      setPasscode('');
      registerFailedAttempt('Access denied. Invalid Guardian passcode.');
    }
  };

  const toggleFlowerSelection = (tileId: string) => {
    if (lockoutSec > 0) return;
    soundEngine.unlock();
    soundEngine.play('select');
    setAuthError('');
    setSelectedFlowerIds((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  const handleVerifyFlowers = () => {
    if (lockoutSec > 0) return;
    soundEngine.unlock();

    const result = verifyRoseSelection(flowerGrid, selectedFlowerIds);
    if (result.verified) {
      soundEngine.play('success');
      setAuthError('');
      setFailedAttempts(0);
      setSelectedFlowerIds([]);
      setAuthStage('unlocked');
      return;
    }

    soundEngine.play('error');
    setSelectedFlowerIds([]);
    setFlowerGrid(generateFlowerVerificationGrid());
    registerFailedAttempt(
      result.reason ?? 'Floral verification failed. Only the 3 roses unlock the seal.',
      true
    );
  };

  const handleLockEye = () => {
    soundEngine.play('click');
    setAuthStage('passcode');
    setPasscode('');
    setShowPasscode(false);
    setSelectedFlowerIds([]);
    setAuthError('');
  };

  const toggleOrderExpand = (id: string) => {
    soundEngine.play('click');
    setExpandedOrderIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter((ord) => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      ord.id.toLowerCase().includes(q) ||
      ord.customer.fullName.toLowerCase().includes(q) ||
      ord.customer.email.toLowerCase().includes(q)
    );
  });

  const maxCategorySale = Math.max(1, ...Object.values(analytics.categorySales));

  const recentActivities = [
    ...orders.map((o) => ({
      id: `act-ord-${o.id}`,
      ts: o.timestamp,
      kind: 'order' as const,
      title: `Order #${o.id} by ${o.customer.fullName}`,
      detail: `$${o.total.toFixed(2)} · ${o.items.length} item(s)`,
    })),
    ...messages.map((m) => ({
      id: `act-msg-${m.id}`,
      ts: m.createdAt,
      kind: 'message' as const,
      title: `Whisper from ${m.name}`,
      detail: m.message,
    })),
  ]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 5);

  return (
    <section id="admin" className="relative border-b border-cyan-500/20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-body text-sm font-bold tracking-[0.22em] text-[#a855f7]">
                GUARDIAN CLEARANCE · SECTOR ZERO
              </p>
              <h2 className="font-display mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                🛡️ THE GUARDIAN&apos;S EYE — SAMS SANIAN AHAMOD&apos;S COMMAND CENTER
              </h2>
              <p className="mt-2 text-base font-semibold text-[#00ffff]">
                Only the guardian may see the voices and economy of the void.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div
                data-testid="admin-live-counter"
                className="rounded-xl border border-[#ff00aa]/40 bg-[#ff00aa]/10 px-4 py-2.5 text-right"
              >
                <p className="font-display text-xs font-bold tracking-widest text-[#ff88dd]">
                  VOID WHISPERS
                </p>
                <p className="font-display tabular-nums text-base font-black text-white">
                  {messages.length} Total · {unreadCount} Unread
                </p>
              </div>
              <div
                data-testid="admin-orders-counter"
                className="rounded-xl border border-[#ffcc00]/40 bg-[#ffcc00]/10 px-4 py-2.5 text-right"
              >
                <p className="font-display text-xs font-bold tracking-widest text-[#ffcc00]">
                  ARMORY ORDERS
                </p>
                <p className="font-display tabular-nums text-base font-black text-white">
                  {analytics.newOrdersCount} New · {analytics.totalOrders} Total
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
            Monitor Armory tributes, fulfill orders, inspect revenue telemetry, and read incoming warrior whispers.
          </p>
        </div>

        {/* STEP 1 — SECRET PASSCODE */}
        {authStage === 'passcode' && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#a855f7]/45 bg-[#0e121b]/90 p-6 backdrop-blur-md sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[#a855f7]">
                <Lock className="h-5 w-5" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold text-white">
                  Guardian Authentication
                </h3>
              </div>
              <span className="font-display text-[11px] font-bold tracking-widest text-[#00ffff]">
                STEP 1 / 2
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-300">
              Restricted sector. Enter the secret Guardian passcode to unlock visual rose verification.
            </p>

            <form onSubmit={handlePasscodeSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="admin-passcode"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Secret Guardian Passcode
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="admin-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    autoComplete="off"
                    inputMode="numeric"
                    disabled={lockoutSec > 0}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••"
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#080a0f] pr-11 pl-3.5 text-base tracking-[0.25em] text-white placeholder-slate-500 focus:border-[#00ffff] focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode((prev) => !prev)}
                    aria-label={showPasscode ? 'Hide typed passcode' : 'Show typed passcode'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-white"
                  >
                    {showPasscode ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {lockoutSec > 0 && (
                <p
                  data-testid="admin-lockout-timer"
                  role="alert"
                  className="rounded-lg border border-[#ff3355]/45 bg-[#ff3355]/10 px-3 py-2 text-sm font-bold text-[#ff8899]"
                >
                  Security lockdown active · Try again in {lockoutSec}s
                </p>
              )}

              {authError && lockoutSec === 0 && (
                <p role="alert" className="text-sm font-semibold text-[#ff3355]">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={lockoutSec > 0 || passcode.trim().length === 0}
                onMouseEnter={() => soundEngine.play('hover')}
                className="font-display min-h-[46px] w-full cursor-pointer rounded-lg bg-gradient-to-r from-[#a855f7] to-[#ff00aa] px-5 py-2.5 text-sm font-black tracking-widest text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[#00ffff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                CONTINUE TO VERIFICATION
              </button>
            </form>
          </div>
        )}

        {/* STEP 2 — 20 FLOWERS / 3 ROSES VERIFICATION */}
        {authStage === 'flowers' && (
          <div
            data-testid="admin-flower-verification"
            className="mx-auto max-w-2xl rounded-2xl border border-[#00ffff]/45 bg-[#0e121b]/95 p-5 backdrop-blur-md sm:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-[#00ffff]">
                <Shield className="h-5 w-5" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold text-white">
                  Visual Safety Verification
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-[11px] font-bold tracking-widest text-[#ffcc00]">
                  STEP 2 / 2
                </span>
                <span
                  data-testid="flower-selection-count"
                  className="font-display rounded-md border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold tabular-nums text-[#00ffff]"
                >
                  Selected: {selectedFlowerIds.length} / {REQUIRED_ROSE_COUNT}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-slate-300">
              Select the <strong className="text-[#ff3355]">3 ROSES</strong> from the{' '}
              <strong className="text-white">{flowerGrid.length} flowers</strong> below to unlock The Guardian&apos;s Eye.
            </p>

            <div
              data-testid="flower-verification-grid"
              className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3"
            >
              {flowerGrid.map((tile, idx) => {
                const isSelected = selectedFlowerIds.includes(tile.id);
                return (
                  <button
                    key={tile.id}
                    type="button"
                    data-testid={`flower-tile-${idx}`}
                    data-flower-species={tile.species}
                    aria-label={`Flower tile ${idx + 1}`}
                    aria-pressed={isSelected}
                    onClick={() => toggleFlowerSelection(tile.id)}
                    className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border p-2 transition focus-visible:outline-2 focus-visible:outline-[#00ffff] ${
                      isSelected
                        ? 'border-[#ff3355] bg-[#ff3355]/15 shadow-[0_0_18px_rgba(255,51,85,0.45)]'
                        : 'border-white/15 bg-[#090c14] hover:border-[#00ffff]/55 hover:bg-[#101625]'
                    }`}
                  >
                    <FlowerArtwork species={tile.species} variant={tile.variant} />
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3355] text-white shadow"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {authError && (
              <p role="alert" className="mt-3 text-sm font-semibold text-[#ff3355]">
                {authError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setAuthStage('passcode');
                    setAuthError('');
                    setSelectedFlowerIds([]);
                  }}
                  className="font-display flex min-h-[42px] items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-bold tracking-wider text-slate-300 hover:border-white/40 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  BACK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setFlowerGrid(generateFlowerVerificationGrid());
                    setSelectedFlowerIds([]);
                    setAuthError('');
                  }}
                  className="font-display flex min-h-[42px] items-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 text-xs font-bold tracking-wider text-[#00ffff] hover:bg-cyan-500/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  RESHUFFLE
                </button>
              </div>

              <button
                type="button"
                data-testid="verify-roses-button"
                onClick={handleVerifyFlowers}
                className="font-display min-h-[44px] flex-1 cursor-pointer rounded-lg bg-gradient-to-r from-[#ff3355] to-[#ff00aa] px-6 text-xs font-black tracking-widest text-white shadow-[0_0_20px_rgba(255,51,85,0.4)] transition hover:brightness-110 sm:flex-initial"
              >
                VERIFY 3 ROSES &amp; UNLOCK
              </button>
            </div>
          </div>
        )}

        {/* UNLOCKED COMMAND CENTER */}
        {authStage === 'unlocked' && (
          <div
            data-testid="admin-dashboard"
            className="rounded-2xl border border-cyan-500/35 bg-[#0e121b]/95 p-5 backdrop-blur-md sm:p-6"
          >
            {/* Tabs & Logout */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div role="tablist" aria-label="Guardian Eye views" className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'dashboard'}
                  onClick={() => {
                    soundEngine.play('select');
                    setActiveTab('dashboard');
                  }}
                  className={`font-display flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold tracking-wider transition ${
                    activeTab === 'dashboard'
                      ? 'bg-[#ffcc00] text-[#0a0c0f]'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  DASHBOARD
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'orders'}
                  onClick={() => {
                    soundEngine.play('select');
                    setActiveTab('orders');
                  }}
                  className={`font-display flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold tracking-wider transition ${
                    activeTab === 'orders'
                      ? 'bg-[#ff3355] text-white'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  ORDERS ({orders.length})
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'messages'}
                  onClick={() => {
                    soundEngine.play('select');
                    setActiveTab('messages');
                  }}
                  className={`font-display flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold tracking-wider transition ${
                    activeTab === 'messages'
                      ? 'bg-[#00ffff] text-[#0a0c0f]'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  MESSAGES ({messages.length})
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'gmail'}
                  onClick={() => {
                    soundEngine.play('select');
                    setActiveTab('gmail');
                  }}
                  className={`font-display flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold tracking-wider transition ${
                    activeTab === 'gmail'
                      ? 'bg-[#ff00aa] text-white'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  GMAIL ({SEED_GMAIL_DISPATCHES.length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleLockEye}
                className="font-display flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3.5 text-xs font-bold tracking-wider text-slate-300 transition hover:border-[#ff3355] hover:text-[#ff3355]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                LOCK EYE
              </button>
            </div>

            {/* TAB 1 — DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div data-testid="admin-tab-dashboard" className="mt-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#ffcc00]/40 bg-[#12100a] p-4">
                    <p className="font-display text-[11px] font-bold tracking-widest text-[#ffcc00]">
                      TOTAL REVENUE
                    </p>
                    <AnimatedNumber
                      value={analytics.totalRevenue}
                      prefix="$"
                      className="font-display mt-2 block text-3xl font-black text-white"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Excludes cancelled tributes
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#00ffff]/40 bg-[#0a1318] p-4">
                    <p className="font-display text-[11px] font-bold tracking-widest text-[#00ffff]">
                      TOTAL ORDERS
                    </p>
                    <AnimatedNumber
                      value={analytics.totalOrders}
                      decimals={0}
                      className="font-display mt-2 block text-3xl font-black text-white"
                    />
                    <p className="mt-1 text-xs text-emerald-400">
                      {analytics.newOrdersCount} awaiting fulfillment
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-[#ff00aa]/40 bg-[#140b18] p-4">
                    {analytics.bestSellerProduct ? (
                      <>
                        <div className="shrink-0 rounded-lg border border-white/10 bg-[#080a10] p-1">
                          <ArmoryProductArt
                            artKey={analytics.bestSellerProduct.artKey}
                            accentColor={analytics.bestSellerProduct.accentColor}
                            size="thumb"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-[11px] font-bold tracking-widest text-[#ff88dd]">
                            BEST SELLER
                          </p>
                          <p className="font-display mt-1 truncate text-xs font-black text-white">
                            {analytics.bestSellerProduct.name}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-[#ffcc00]">
                            {analytics.bestSellerUnits} units sold
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">No sales recorded yet.</p>
                    )}
                  </div>
                </div>

                {/* Category Sales Bar Chart (CSS-only) + Recent Activity Feed */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#080b11] p-5">
                    <h4 className="font-display text-xs font-black tracking-[0.2em] text-[#00ffff]">
                      SALES BY CATEGORY
                    </h4>
                    <div className="mt-4 space-y-3.5">
                      {(
                        ['action-figures', 'costumes', 'weapons', 'collectibles'] as const
                      ).map((cat) => {
                        const style = CATEGORY_STYLE_MAP[cat];
                        const val = analytics.categorySales[cat] ?? 0;
                        const pct = Math.round((val / maxCategorySale) * 100);
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs font-bold">
                              <span className={style.textClass}>{style.label}</span>
                              <span className="font-display tabular-nums text-white">
                                ${val.toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.max(4, pct)}%`,
                                  backgroundColor: style.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#080b11] p-5">
                    <h4 className="font-display text-xs font-black tracking-[0.2em] text-[#ffcc00]">
                      RECENT ARENA ACTIVITY
                    </h4>
                    <div className="mt-4 space-y-2.5">
                      {recentActivities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-display truncate font-bold text-white">
                              {act.kind === 'order' ? '🛒 ' : '💬 '}
                              {act.title}
                            </p>
                            <p className="mt-0.5 truncate text-slate-400">{act.detail}</p>
                          </div>
                          <span className="shrink-0 tabular-nums text-[11px] text-slate-500">
                            {new Date(act.ts).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2 — ORDERS */}
            {activeTab === 'orders' && (
              <div data-testid="admin-tab-orders" className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-sm font-black text-[#ffcc00]">
                    You have {analytics.newOrdersCount} new{' '}
                    {analytics.newOrdersCount === 1 ? 'order' : 'orders'}
                  </p>

                  <div className="relative w-full sm:w-72">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Filter order # or customer..."
                      aria-label="Filter orders by ID or customer name"
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#080a10] pr-3 pl-9 text-xs text-white placeholder-slate-500 focus:border-[#00ffff] focus:outline-none"
                    />
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No matching Armory orders found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const isExpanded = Boolean(expandedOrderIds[order.id]);
                      const st = STATUS_STYLE[order.status];
                      return (
                        <div
                          key={order.id}
                          data-testid={`admin-order-row-${order.id}`}
                          className={`rounded-xl border bg-[#090d14] p-4 transition ${
                            order.isNew ? 'animate-new-order border-[#ff3355]/60' : 'border-white/10'
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-display text-sm font-black text-[#00ffff]">
                                  #{order.id}
                                </span>
                                <span
                                  className={`font-display rounded-md border px-2 py-0.5 text-[11px] font-bold transition-colors ${st.badgeClass}`}
                                >
                                  {st.label}
                                </span>
                                {order.isLegendPurchase && (
                                  <span
                                    data-testid={`legend-badge-${order.id}`}
                                    className="font-display inline-flex items-center gap-1 rounded-md border border-[#ffcc00]/60 bg-[#ffcc00]/15 px-2 py-0.5 text-[11px] font-black text-[#ffcc00]"
                                  >
                                    <Crown className="h-3 w-3" aria-hidden="true" />
                                    LEGEND PURCHASE
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-white">
                                {order.customer.fullName}{' '}
                                <span className="text-xs font-normal text-slate-400">
                                  · {order.customer.email}
                                </span>
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(order.timestamp).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-display text-lg font-black tabular-nums text-[#ffcc00]">
                                ${order.total.toFixed(2)}
                              </span>

                              <select
                                aria-label={`Status for order ${order.id}`}
                                value={order.status}
                                onChange={(e) => {
                                  soundEngine.play('success');
                                  onUpdateOrderStatus(order.id, e.target.value as OrderStatus);
                                }}
                                className="min-h-[44px] cursor-pointer rounded-lg border border-white/20 bg-[#0d121d] px-3 text-xs font-bold text-white focus:border-[#00ffff] focus:outline-none"
                              >
                                <option value="pending">⏳ Pending</option>
                                <option value="shipped">✅ Shipped</option>
                                <option value="delivered">📦 Delivered</option>
                                <option value="cancelled">❌ Cancelled</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => toggleOrderExpand(order.id)}
                                className="font-display flex min-h-[44px] cursor-pointer items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-bold text-slate-200 hover:border-cyan-400/50"
                              >
                                Items ({order.items.length})
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.play('click');
                                  setDetailOrder(order);
                                }}
                                className="font-display min-h-[44px] cursor-pointer rounded-lg border border-[#00ffff]/45 bg-[#00ffff]/10 px-3 text-xs font-bold text-[#00ffff] hover:bg-[#00ffff]/20"
                              >
                                VIEW DETAILS
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-xs text-slate-300">
                              {order.items.map((item) => (
                                <div key={item.productId} className="flex justify-between gap-2">
                                  <span>
                                    <strong className="text-[#00ffff]">{item.quantity}×</strong>{' '}
                                    {item.name}
                                  </span>
                                  <span className="font-display font-bold tabular-nums text-[#ffcc00]">
                                    ${item.lineTotal.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3 — MESSAGES */}
            {activeTab === 'messages' && (
              <div className="mt-6 space-y-4">
                {messages.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">
                    The Crimson Void is silent. No whispers have arrived yet.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl border p-4 transition ${
                        msg.read
                          ? 'border-white/10 bg-white/[0.02]'
                          : 'border-[#00ffff]/45 bg-[#00ffff]/[0.05]'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-sm font-bold text-white">
                              {msg.name}
                            </span>
                            <span className="text-xs text-slate-400">· {msg.email}</span>
                            {!msg.read && (
                              <span className="font-display text-[11px] font-bold tracking-wider text-[#00ffff]">
                                · NEW WHISPER
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-base text-slate-200">{msg.message}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!msg.read && (
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.play('click');
                                onMarkRead(msg.id);
                              }}
                              aria-label={`Mark message from ${msg.name} as read`}
                              className="flex min-h-[44px] items-center gap-1 rounded-lg border border-cyan-400/40 px-3 text-xs font-bold text-[#00ffff] hover:bg-cyan-400/15"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Mark Read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.play('pop');
                              onDeleteMessage(msg.id);
                            }}
                            aria-label={`Delete message from ${msg.name}`}
                            className="flex min-h-[44px] items-center gap-1 rounded-lg border border-rose-500/40 px-3 text-xs font-bold text-rose-300 hover:bg-rose-500/15"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4 — GMAIL */}
            {activeTab === 'gmail' && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400">
                  <Shield className="h-4 w-4 text-[#ff00aa]" aria-hidden="true" />
                  SYNCED ARENA DISPATCHES · NEO-KYOTO RELAY
                </div>
                {SEED_GMAIL_DISPATCHES.map((mail) => (
                  <div
                    key={mail.id}
                    className="rounded-xl border border-[#ff00aa]/30 bg-[#140c18]/80 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-[#ff88dd]">{mail.from}</span>
                      <span className="tabular-nums">{mail.receivedAt}</span>
                    </div>
                    <h4 className="font-display mt-1 text-base font-bold text-white">
                      {mail.subject}
                    </h4>
                    <p className="mt-1.5 text-sm text-slate-300">{mail.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Order ${detailOrder.id} details`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundEngine.play('click');
              setDetailOrder(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-[#00ffff]/50 bg-[#0b0e16] p-6 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                setDetailOrder(null);
              }}
              aria-label="Close order details"
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-slate-300 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="font-display text-xs font-bold tracking-widest text-[#ffcc00]">
              ORDER DOSSIER
            </p>
            <h3 className="font-display mt-1 text-xl font-black text-white">
              #{detailOrder.id}
            </h3>

            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-[#080a10] p-4 text-xs text-slate-300">
              <p>
                <strong className="text-white">Customer:</strong> {detailOrder.customer.fullName} ({detailOrder.customer.email})
              </p>
              <p>
                <strong className="text-white">Address:</strong> {detailOrder.customer.address}, {detailOrder.customer.city}, {detailOrder.customer.postalCode}, {detailOrder.customer.country}
              </p>
              <p>
                <strong className="text-white">Payment:</strong> Card ending •••• {detailOrder.paymentLast4}
              </p>
              {detailOrder.promoCode && (
                <p>
                  <strong className="text-emerald-400">Promo Used:</strong> {detailOrder.promoCode} (-${detailOrder.discountAmount.toFixed(2)})
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {detailOrder.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs"
                >
                  <span className="text-slate-200">
                    <strong className="text-[#00ffff]">{item.quantity}×</strong> {item.name}
                  </span>
                  <span className="font-display font-bold text-[#ffcc00]">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-white/10 pt-3 text-base font-black text-white">
              <span className="font-display">TOTAL</span>
              <span className="font-display text-[#ffcc00]">${detailOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
