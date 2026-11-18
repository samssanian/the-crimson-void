import { useEffect, useRef, useState } from 'react';
import { LEGEND_CARDS, LegendCardData } from '../data/loreData';
import { soundEngine } from '../utils/soundEngine';

const ACCENT_STYLES: Record<
  LegendCardData['accent'],
  { border: string; glow: string; text: string }
> = {
  cyan: {
    border: 'border-[#00ffff]/45',
    glow: 'shadow-[0_0_24px_rgba(0,255,255,0.18)]',
    text: 'text-[#00ffff]',
  },
  magenta: {
    border: 'border-[#ff00aa]/45',
    glow: 'shadow-[0_0_24px_rgba(255,0,170,0.18)]',
    text: 'text-[#ff00aa]',
  },
  gold: {
    border: 'border-[#ffcc00]/50',
    glow: 'shadow-[0_0_24px_rgba(255,204,0,0.2)]',
    text: 'text-[#ffcc00]',
  },
};

export function LegendSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleFlip = (id: string) => {
    soundEngine.unlock();
    soundEngine.play('pageFlip');
    soundEngine.play('whoosh');
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="legend"
      ref={sectionRef}
      className="relative overflow-hidden border-b border-cyan-500/20 px-4 py-20 sm:px-6 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-[#ff3355]/10 blur-[120px]"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="font-body text-sm font-bold tracking-[0.22em] text-[#00ffff]">
            ARCHIVE 01 · SHATTERED TIMELINES
          </p>
          <h2
            className="font-display mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            📖 THE LEGEND OF THE CRIMSON VOID
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Hover or select any chronicle tablet to flip and uncover the suppressed truth of 2187.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {LEGEND_CARDS.map((card, index) => {
            const style = ACCENT_STYLES[card.accent];
            const isFlipped = Boolean(flippedMap[card.id]);

            return (
              <div
                key={card.id}
                className={`perspective-1200 h-[310px] transition-all duration-700 ${
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <button
                  type="button"
                  onClick={() => toggleFlip(card.id)}
                  onMouseEnter={() => {
                    soundEngine.play('whoosh');
                    setFlippedMap((prev) => ({ ...prev, [card.id]: true }));
                  }}
                  onMouseLeave={() => {
                    soundEngine.play('hoverOut');
                    setFlippedMap((prev) => ({ ...prev, [card.id]: false }));
                  }}
                  aria-pressed={isFlipped}
                  aria-label={`${card.title} chronicle card. ${isFlipped ? card.backLore : card.frontSummary}`}
                  className="group relative h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#00ffff]"
                >
                  <div
                    className={`preserve-3d relative h-full w-full transition-transform duration-500 ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front Face */}
                    <div
                      className={`backface-hidden absolute inset-0 flex flex-col justify-between rounded-xl border ${style.border} ${style.glow} bg-[#10141c]/90 p-6 backdrop-blur-md`}
                    >
                      <div>
                        <span className="text-3xl" aria-hidden="true">
                          {card.icon}
                        </span>
                        <h3 className={`font-display mt-4 text-xl font-black tracking-wide ${style.text}`}>
                          {card.title}
                        </h3>
                        <p className="mt-3 text-base leading-relaxed text-slate-200">
                          {card.frontSummary}
                        </p>
                      </div>
                      <span className="font-display text-xs font-bold tracking-widest text-slate-400">
                        FLIP FOR DEEPER LORE →
                      </span>
                    </div>

                    {/* Back Face */}
                    <div
                      className={`backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-xl border ${style.border} ${style.glow} bg-gradient-to-br from-[#161224] via-[#0e131d] to-[#090b10] p-6 backdrop-blur-md`}
                    >
                      <div>
                        <p className={`font-display text-xs font-bold tracking-[0.18em] ${style.text}`}>
                          {card.backTitle}
                        </p>
                        <p className="mt-3 text-base leading-relaxed text-slate-100">
                          {card.backLore}
                        </p>
                      </div>
                      <span className="font-display text-xs font-bold tracking-widest text-slate-400">
                        ← RETURN TO SURFACE
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
