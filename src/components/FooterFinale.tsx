import { useCallback, useEffect, useRef, useState } from 'react';
import { INSTAGRAM_PROFILE } from '../data/profileData';
import { soundEngine } from '../utils/soundEngine';
import { InstagramBadgeButton } from './InstagramBadgeButton';

interface FooterFinaleProps {
  onBurst: (x: number, y: number, count?: number, colors?: string[]) => void;
  onShake: () => void;
  onToast: (msg: string) => void;
}

const FULL_NAME = 'SAMS SANIAN AHAMOD';
const SUBTITLE_TEXT = '⚡ LEGEND OF THE ARENA ⚡';

export function FooterFinale({ onBurst, onShake, onToast }: FooterFinaleProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const floatCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameRef = useRef<HTMLButtonElement | null>(null);

  const [hasPlayed, setHasPlayed] = useState(false);
  const [stage, setStage] = useState(0); // 0..7 progressive steps
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [finalFormCount, setFinalFormCount] = useState(0);
  const [finalFormActive, setFinalFormActive] = useState(false);

  const runFinaleSequence = useCallback(() => {
    setStage(1);
    setTypedSubtitle('');
    soundEngine.play('whoosh');

    const timers: number[] = [];

    // 0.4s Speed lines
    timers.push(
      window.setTimeout(() => {
        setStage(2);
        soundEngine.play('whoosh');
      }, 400)
    );

    // 0.8s Giant MADE BY zoom
    timers.push(
      window.setTimeout(() => {
        setStage(3);
        soundEngine.play('boom');
      }, 800)
    );

    // 1.4s Katana slash + sparks + shing
    timers.push(
      window.setTimeout(() => {
        setStage(4);
        soundEngine.play('shing');
        if (footerRef.current) {
          const rect = footerRef.current.getBoundingClientRect();
          onBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 24, [
            '#ffffff',
            '#00ffff',
            '#ff3355',
          ]);
        }
      }, 1400)
    );

    // 1.8s SAMS SANIAN AHAMOD slams in letter-by-letter + shake + 60 gold particles + boom+charge
    timers.push(
      window.setTimeout(() => {
        setStage(5);
        soundEngine.play('boom');
        soundEngine.play('charge');
        onShake();
        if (nameRef.current) {
          const r = nameRef.current.getBoundingClientRect();
          onBurst(r.left + r.width / 2, r.top + r.height / 2, 60, [
            '#ffcc00',
            '#00ffff',
            '#ff00aa',
          ]);
        }
      }, 1800)
    );

    // 3.2s Rotating aura ring
    timers.push(
      window.setTimeout(() => {
        setStage(6);
        soundEngine.play('charge');
      }, 3200)
    );

    // 3.5s Subtitle typewriter + tick sounds
    timers.push(
      window.setTimeout(() => {
        let idx = 0;
        const subTimer = window.setInterval(() => {
          idx += 1;
          setTypedSubtitle(SUBTITLE_TEXT.slice(0, idx));
          if (idx % 2 === 0) soundEngine.play('tick');
          if (idx >= SUBTITLE_TEXT.length) {
            window.clearInterval(subTimer);
          }
        }, 38);
      }, 3500)
    );

    // 4.5s Neon divider + 5.0s Official Instagram badge pop in
    timers.push(
      window.setTimeout(() => {
        setStage(7);
        window.setTimeout(() => soundEngine.play('sparkle'), 160);
        soundEngine.play('ambientHum');
      }, 4500)
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [onBurst, onShake]);

  // Auto-play once per session on scroll into view
  useEffect(() => {
    const el = footerRef.current;
    if (!el || hasPlayed || typeof IntersectionObserver === 'undefined') return;

    const alreadySeen =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem('crimson_void_finale_seen') === 'true';

    if (alreadySeen) {
      setHasPlayed(true);
      setStage(7);
      setTypedSubtitle(SUBTITLE_TEXT);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasPlayed(true);
          try {
            window.sessionStorage.setItem('crimson_void_finale_seen', 'true');
          } catch {
            // ignore
          }
          runFinaleSequence();
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasPlayed, runFinaleSequence]);

  // 30 Floating gold particles behind name (requestAnimationFrame)
  useEffect(() => {
    const canvas = floatCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dots = Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.5 + Math.random() * 2.5,
      vy: 0.001 + Math.random() * 0.0022,
      alpha: 0.35 + Math.random() * 0.65,
    }));

    let animId = 0;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.y -= d.vy;
        if (d.y < -0.05) {
          d.y = 1.05;
          d.x = Math.random();
        }
        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(d.x * canvas.width, d.y * canvas.height, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animId = window.requestAnimationFrame(loop);
    };

    animId = window.requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // 3x Click FINAL FORM Easter Egg
  const handleNameClick = () => {
    soundEngine.unlock();
    const next = finalFormCount + 1;
    setFinalFormCount(next);
    soundEngine.play('pop');

    if (next >= 3) {
      setFinalFormCount(0);
      setFinalFormActive(true);
      soundEngine.play('boom');
      soundEngine.play('charge');
      onShake();
      if (nameRef.current) {
        const r = nameRef.current.getBoundingClientRect();
        onBurst(r.left + r.width / 2, r.top + r.height / 2, 75, [
          '#ffcc00',
          '#ffffff',
          '#ff3355',
          '#00ffff',
        ]);
      }
      onToast('⚡ FINAL FORM ACTIVATED: SAMS SANIAN AHAMOD UNLEASHED! ⚡');
      window.setTimeout(() => setFinalFormActive(false), 1600);
    }
  };

  return (
    <footer
      ref={footerRef}
      data-testid="footer-finale"
      className="relative overflow-hidden bg-[#06070a] px-4 py-24 text-center sm:px-6"
    >
      {/* 30 Floating Gold Particles Canvas */}
      <canvas
        ref={floatCanvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* 0.0s Cyan Sweep Line */}
      {stage >= 1 && (
        <div
          aria-hidden="true"
          className="animate-cyan-sweep pointer-events-none absolute left-0 right-0 top-12 mx-auto h-0.5 max-w-4xl bg-gradient-to-r from-transparent via-[#00ffff] to-transparent"
        />
      )}

      {/* 0.4s Anime Speed Lines */}
      {stage >= 2 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-conic-gradient(from 0deg at 50% 50%, rgba(0,255,255,0.22) 0deg 1deg, transparent 1deg 14deg)',
          }}
        />
      )}

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        {/* Story Tagline */}
        <p
          className="font-display text-xs font-bold tracking-[0.22em] text-[#00ffff] sm:text-sm"
          style={{ textShadow: '0 0 12px rgba(0,255,255,0.6)' }}
        >
          ⚔️ The arena never sleeps. The legend never ends. ⚔️
        </p>

        {/* 0.8s Giant MADE BY */}
        <div className="mt-8 min-h-[42px]">
          {stage >= 3 && (
            <p className="animate-made-by font-impact text-3xl tracking-[0.28em] text-slate-300 sm:text-4xl">
              MADE BY
            </p>
          )}
        </div>

        {/* Name Stage + Conic Ring + Katana Slash + Shockwave */}
        <div className="relative mt-4 flex items-center justify-center py-8">
          {/* 3.2s Rotating Gold Conic Aura Ring */}
          {stage >= 6 && (
            <div
              aria-hidden="true"
              className="animate-conic-aura pointer-events-none absolute h-56 w-56 rounded-full opacity-35 blur-2xl sm:h-72 sm:w-72"
              style={{
                background:
                  'conic-gradient(from 0deg, #ffcc00, #ff00aa, #00ffff, #ffcc00)',
              }}
            />
          )}

          {/* 1.4s Katana Slash */}
          {stage >= 4 && (
            <div
              aria-hidden="true"
              className="animate-katana-slash pointer-events-none absolute z-20 h-1.5 w-[92%] rounded-full bg-white shadow-[0_0_24px_#00ffff,0_0_42px_#ff3355]"
            />
          )}

          {/* 1.8s Shockwave Ripple */}
          {stage >= 5 && (
            <div
              aria-hidden="true"
              className="animate-shockwave pointer-events-none absolute h-40 w-40 rounded-full border-2 border-[#ffcc00]"
            />
          )}

          {/* Letter-by-letter SAMS SANIAN AHAMOD (Click 3x for FINAL FORM) */}
          <button
            ref={nameRef}
            type="button"
            onClick={handleNameClick}
            aria-label="Sams Sanian Ahamod — click three times to activate Final Form"
            className={`relative z-10 cursor-pointer rounded-xl px-4 py-2 transition-transform focus-visible:outline-2 focus-visible:outline-[#ffcc00] ${
              finalFormActive ? 'scale-110' : 'hover:scale-[1.02]'
            }`}
          >
            {stage >= 5 ? (
              <span className="font-display inline-flex flex-wrap justify-center gap-x-1 text-3xl font-black tracking-wider sm:text-5xl md:text-6xl">
                {FULL_NAME.split('').map((ch, idx) =>
                  ch === ' ' ? (
                    <span key={idx} className="w-3 sm:w-5" />
                  ) : (
                    <span
                      key={idx}
                      className="animate-letter-slam inline-block opacity-0"
                      style={{
                        animationDelay: `${idx * 60}ms`,
                      }}
                    >
                      <span
                        className="animate-letter-cycle inline-block"
                        style={{
                          animationDelay: `${idx * 90}ms`,
                        }}
                      >
                        {ch}
                      </span>
                    </span>
                  )
                )}
              </span>
            ) : (
              <span className="font-display text-3xl font-black tracking-wider text-transparent sm:text-5xl">
                {FULL_NAME}
              </span>
            )}
          </button>
        </div>

        {/* 3.5s Subtitle */}
        <p className="font-display mt-2 min-h-[28px] text-sm font-bold tracking-[0.26em] text-[#ffcc00] sm:text-base">
          {typedSubtitle}
        </p>

        {/* 4.5s Neon Divider */}
        {stage >= 7 && (
          <div
            aria-hidden="true"
            className="neon-travel-border mt-8 h-[2px] w-full max-w-2xl rounded-full"
          />
        )}

        {/* 5.0s Official Instagram Only */}
        {stage >= 7 && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <InstagramBadgeButton
              variant="hero"
              label={`INSTAGRAM ${INSTAGRAM_PROFILE.handle}`}
            />
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              Official Social Account Only
            </p>
          </div>
        )}

        {/* Replay Finale Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.unlock();
            runFinaleSequence();
          }}
          className="font-display mt-8 cursor-pointer rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold tracking-widest text-slate-300 transition hover:border-[#00ffff]/50 hover:text-[#00ffff]"
        >
          REPLAY FINALE
        </button>

        <p className="mt-6 text-xs text-slate-500">
          © 2187–2026 The Crimson Void · Built for Sams Sanian Ahamod
        </p>
      </div>
    </footer>
  );
}
