import { useEffect, useState } from 'react';
import { MAIN_LEGEND_TEXT } from '../data/loreData';
import { INSTAGRAM_PROFILE } from '../data/profileData';
import { soundEngine } from '../utils/soundEngine';
import { InstagramBadgeButton } from './InstagramBadgeButton';

const HERO_SUBTITLES = [
  'CREATOR & ARENA GUARDIAN · THE CRIMSON VOID',
  'NEO-KYOTO 2187 · THE DIMENSIONAL RIFT AWAKENS',
  'FUTURISTIC ANIME PORTFOLIO & INTERACTIVE ARENA',
];

export function HeroSection() {
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [heroImgError, setHeroImgError] = useState(false);

  useEffect(() => {
    const full = HERO_SUBTITLES[subtitleIdx];
    let charIndex = 0;
    setTypedText('');

    const typeTimer = window.setInterval(() => {
      charIndex += 1;
      setTypedText(full.slice(0, charIndex));
      if (charIndex >= full.length) {
        window.clearInterval(typeTimer);
      }
    }, 34);

    const cycleTimer = window.setTimeout(() => {
      setSubtitleIdx((prev) => (prev + 1) % HERO_SUBTITLES.length);
    }, 4500);

    return () => {
      window.clearInterval(typeTimer);
      window.clearTimeout(cycleTimer);
    };
  }, [subtitleIdx]);

  return (
    <section
      id="home"
      className="relative flex min-h-[90vh] items-center overflow-hidden border-b border-[#ff3355]/25 px-4 py-16 sm:px-6 lg:py-24"
    >
      {/* Original Hero Backdrop Art */}
      {!heroImgError ? (
        <img
          src="/src/assets/images/crimson_void_hero_1794996295314.jpg"
          alt="Floating Crimson Void coliseum above Neo-Kyoto in 2187"
          referrerPolicy="no-referrer"
          onError={() => setHeroImgError(true)}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,51,85,0.22),rgba(10,12,15,0.95)_70%)]"
        />
      )}

      {/* Atmospheric Crimson, Purple & Deep Black Scrims */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,51,85,0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.18),transparent_55%),linear-gradient(to_bottom,rgba(8,10,14,0.78),rgba(8,10,14,0.58),#0a0c0f)]"
      />
      <div
        aria-hidden="true"
        className="animate-orb-slow pointer-events-none absolute -left-24 top-12 h-80 w-80 rounded-full bg-[#ff3355]/14 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="animate-orb-reverse pointer-events-none absolute right-6 bottom-10 h-80 w-80 rounded-full bg-[#00ffff]/12 blur-[110px]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-12">
        {/* Left Identity, Lore & CTA Column */}
        <div className="lg:col-span-7">
          <p
            className="animate-hero-rise font-body text-sm font-bold tracking-[0.26em] text-[#00ffff]"
            style={{ animationDelay: '40ms' }}
          >
            THE CRIMSON VOID · OFFICIAL DIGITAL UNIVERSE
          </p>

          <h1
            className="animate-hero-rise font-display mt-3 text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4rem]"
            style={{
              animationDelay: '120ms',
              textWrap: 'balance',
              textShadow:
                '0 0 28px rgba(255, 51, 85, 0.45), 0 0 46px rgba(0, 255, 255, 0.25)',
            }}
          >
            <span className="block text-white">SAMS SANIAN</span>
            <span className="bg-gradient-to-r from-[#ff3355] via-[#ff00aa] to-[#00ffff] bg-clip-text text-transparent">
              AHAMOD
            </span>
          </h1>

          {/* Typewriter Subtitle */}
          <div
            className="animate-hero-rise mt-4 flex min-h-[28px] items-center font-display text-xs font-bold tracking-[0.18em] text-[#ff88dd] sm:text-sm"
            style={{ animationDelay: '200ms' }}
          >
            <span>{typedText || HERO_SUBTITLES[subtitleIdx].slice(0, 1)}</span>
            <span className="ml-1.5 inline-block h-4 w-2 animate-pulse bg-[#00ffff] align-middle" />
          </div>

          {/* Concise Professional Introduction + Main Legend Card */}
          <div
            className="animate-hero-rise mt-6 rounded-2xl border border-[#ff3355]/30 bg-[#0d1017]/82 p-5 shadow-[0_0_32px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-6"
            style={{ animationDelay: '280ms' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xs font-bold tracking-[0.2em] text-[#ffcc00]">
                THE LEGEND OF SAMS SANIAN AHAMOD
              </h2>
              <span className="font-body text-xs font-semibold tracking-wider text-slate-400">
                NEO-KYOTO · 2187
              </span>
            </div>
            <p className="mt-3 text-base leading-relaxed text-slate-200">
              {MAIN_LEGEND_TEXT}
            </p>
          </div>

          {/* Primary CTAs + Prominent Instagram Follow Button */}
          <div
            className="animate-hero-rise mt-7 flex flex-wrap items-center gap-3.5"
            style={{ animationDelay: '360ms' }}
          >
            <InstagramBadgeButton
              variant="hero"
              label={`FOLLOW ${INSTAGRAM_PROFILE.handle}`}
            />

            <a
              href="#battles"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.play('fight');
              }}
              onMouseEnter={() => soundEngine.play('hover')}
              className="font-display inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#ff3355] to-[#b91c1c] px-6 py-3 text-xs font-extrabold tracking-widest text-white shadow-[0_0_24px_rgba(255,51,85,0.5)] transition hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(255,51,85,0.75)] focus-visible:outline-2 focus-visible:outline-[#00ffff]"
            >
              ENTER THE ARENA
            </a>

            <a
              href="#about"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.play('whoosh');
              }}
              onMouseEnter={() => soundEngine.play('hover')}
              className="font-display inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[#00ffff]/45 bg-[#00ffff]/10 px-5 py-3 text-xs font-bold tracking-widest text-[#00ffff] transition hover:bg-[#00ffff]/20 focus-visible:outline-2 focus-visible:outline-[#00ffff]"
            >
              ABOUT ME
            </a>
          </div>
        </div>

        {/* Right Anime Guardian Portrait + SVG Dimensional Seal */}
        <div className="animate-hero-rise flex items-center justify-center lg:col-span-5" style={{ animationDelay: '220ms' }}>
          <div className="relative flex h-[390px] w-full max-w-[400px] items-center justify-center overflow-hidden rounded-2xl border border-[#ff3355]/50 bg-[#0d1017]/88 p-5 shadow-[0_0_48px_rgba(255,51,85,0.24)] backdrop-blur-xl sm:h-[470px]">
            {/* Rotating Conic Aura */}
            <div
              aria-hidden="true"
              className="animate-conic-aura pointer-events-none absolute h-80 w-80 rounded-full opacity-35 blur-2xl"
              style={{
                background:
                  'conic-gradient(from 0deg, #ff3355, #a855f7, #00ffff, #ffcc00, #ff3355)',
              }}
            />

            {/* Original Guardian Artwork */}
            <img
              src="/src/assets/images/fighter_sams_1794996295931.jpg"
              alt="Sams Sanian Ahamod, The Crimson Blade"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a0f] via-[#080a0f]/25 to-transparent"
            />

            {/* SVG Silhouette Crest & Blade Slash Accent */}
            <svg
              viewBox="0 0 320 380"
              className="pointer-events-none relative z-10 h-full w-full opacity-85 drop-shadow-[0_0_18px_rgba(0,255,255,0.5)]"
              role="img"
              aria-label="Crimson Void dimensional seal overlay"
            >
              <defs>
                <linearGradient id="bladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff3355" />
                  <stop offset="55%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#00ffff" />
                </linearGradient>
              </defs>
              <circle
                cx="160"
                cy="185"
                r="136"
                fill="none"
                stroke="#00ffff"
                strokeWidth="1.2"
                strokeDasharray="10 8"
                opacity="0.55"
              />
              <circle
                cx="160"
                cy="185"
                r="118"
                fill="none"
                stroke="#ff3355"
                strokeWidth="1.6"
                strokeDasharray="24 12"
                opacity="0.7"
              />
              <path
                d="M28 308 L292 48 L296 52 L34 314 Z"
                fill="url(#bladeGrad)"
                opacity="0.82"
              />
            </svg>

            <div className="absolute bottom-4 left-5 right-5 z-20 flex items-center justify-between border-t border-white/15 pt-3 text-xs font-bold tracking-widest text-slate-200">
              <span>SAMS SANIAN AHAMOD</span>
              <span className="text-[#ffcc00]">RANK S+</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
