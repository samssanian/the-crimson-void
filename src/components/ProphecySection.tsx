import { useEffect, useRef, useState } from 'react';
import { PROPHECY_LINES, PROPHECY_MILESTONES, SECRET_CHAPTER } from '../data/loreData';
import { soundEngine } from '../utils/soundEngine';
import { ScrollReveal } from './ScrollReveal';

const RUNES =
  '᚛ ᚜ CRIMSON VOID ᛉ 2187 ᚛ NEO-KYOTO RIFT ᛈ SAMS SANIAN AHAMOD ᛉ SEVEN THRONES ᚜ ETERNAL BLADE ᛉ ';

export function ProphecySection() {
  const bannerRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [finishedTyping, setFinishedTyping] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const fullProphecy = PROPHECY_LINES.join('\n');

  useEffect(() => {
    const el = bannerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || finishedTyping) return;
    const timer = window.setInterval(() => {
      setTypedChars((prev) => {
        const next = prev + 1;
        if (next % 6 === 0) {
          soundEngine.play('whisper');
        }
        if (next >= fullProphecy.length) {
          window.clearInterval(timer);
          setFinishedTyping(true);
          soundEngine.play('boom');
        }
        return next;
      });
    }, 32);

    return () => window.clearInterval(timer);
  }, [started, finishedTyping, fullProphecy.length]);

  const handleBannerSecretClick = () => {
    soundEngine.unlock();
    if (secretUnlocked) return;
    const next = secretClicks + 1;
    setSecretClicks(next);
    soundEngine.play('tick');
    if (next >= 5) {
      setSecretUnlocked(true);
      soundEngine.play('pageFlip');
      soundEngine.play('sparkle');
    }
  };

  return (
    <section
      id="prophecy"
      ref={bannerRef}
      className="relative overflow-hidden border-b border-[#ff3355]/25 bg-gradient-to-b from-[#160710] via-[#10060c] to-[#0a0c0f] px-4 py-20 sm:px-6"
    >
      {/* Animated Glowing Runes Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 overflow-hidden whitespace-nowrap font-display text-lg font-bold tracking-[0.4em] text-[#ff3355]/20"
      >
        <div className="animate-rune-scroll inline-block">{RUNES.repeat(4)}</div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 overflow-hidden whitespace-nowrap font-display text-lg font-bold tracking-[0.4em] text-[#00ffff]/15"
      >
        <div className="animate-rune-scroll inline-block" style={{ animationDirection: 'reverse' }}>
          {RUNES.repeat(4)}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Clickable Prophecy Banner (5x Easter Egg) */}
        <button
          type="button"
          onClick={handleBannerSecretClick}
          data-testid="prophecy-banner"
          aria-label="The Crimson Void Prophecy Banner"
          className="w-full cursor-pointer rounded-2xl border border-[#ff3355]/45 bg-[#120810]/85 p-6 text-left shadow-[0_0_45px_rgba(255,51,85,0.2)] backdrop-blur-md transition hover:border-[#ff00aa]/70 focus-visible:outline-2 focus-visible:outline-[#00ffff] sm:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-display text-xs font-bold tracking-[0.25em] text-[#ff3355]">
              🔮 THE PROPHECY OF THE SEVENTH SEAL
            </span>
            <span className="font-body text-xs font-semibold tracking-wider text-slate-400">
              {secretUnlocked
                ? 'SECRET ARCHIVE UNLOCKED'
                : secretClicks > 0
                  ? `SEAL RESONANCE ${secretClicks}/5`
                  : 'INSCRIBED IN VOID STONE'}
            </span>
          </div>

          <pre
            className="font-display mt-6 whitespace-pre-wrap text-xl font-extrabold leading-relaxed text-white sm:text-3xl"
            style={{ textShadow: '0 0 18px rgba(255, 51, 85, 0.55)' }}
          >
            {fullProphecy.slice(0, typedChars)}
            {!finishedTyping && (
              <span className="ml-1 inline-block h-6 w-2.5 animate-pulse bg-[#ff3355] align-middle" />
            )}
          </pre>
        </button>

        {/* Secret Chapter Easter Egg (5x Clicks on Prophecy Banner) */}
        {secretUnlocked && (
          <article
            data-testid="secret-chapter"
            className="mt-6 rounded-2xl border border-[#ffcc00]/60 bg-gradient-to-br from-[#1b1407]/95 via-[#110d17]/95 to-[#0a0c0f] p-6 shadow-[0_0_32px_rgba(255,204,0,0.22)] sm:p-8"
          >
            <p className="font-display text-xs font-bold tracking-[0.24em] text-[#ffcc00]">
              {SECRET_CHAPTER.subtitle}
            </p>
            <h3 className="font-display mt-2 text-2xl font-black text-white">
              {SECRET_CHAPTER.title}
            </h3>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-200">
              {SECRET_CHAPTER.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        )}

        {/* Glowing Timeline (3 Milestones) */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROPHECY_MILESTONES.map((item, idx) => (
            <ScrollReveal key={item.era} delayMs={idx * 90}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-[#0d1017]/88 p-6 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-[#ff3355]/45">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-full bg-[#ff3355] shadow-[0_0_12px_#ff3355]"
                  />
                  <span className="font-display text-xs font-bold tracking-widest text-[#00ffff]">
                    0{idx + 1}. {item.era}
                  </span>
                </div>
                <h3 className="font-display mt-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
