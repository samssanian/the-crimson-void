import { useState, MouseEvent } from 'react';
import { FIGHTERS, FighterData } from '../data/loreData';
import { soundEngine } from '../utils/soundEngine';
import { FighterModal } from './FighterModal';
import { ScrollReveal } from './ScrollReveal';

function FighterCard({
  fighter,
  onSelect,
}: {
  fighter: FighterData;
  onSelect: (fighter: FighterData) => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [imgFailed, setImgFailed] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 8, ry: px * 8 });
  };

  return (
    <button
      type="button"
      onClick={() => {
        soundEngine.unlock();
        soundEngine.play('select');
        onSelect(fighter);
      }}
      onMouseEnter={() => soundEngine.play('hover')}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setTilt({ rx: 0, ry: 0 });
        soundEngine.play('hoverOut');
      }}
      aria-label={`Inspect ${fighter.name} — ${fighter.title}`}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        borderColor: `${fighter.accentColor}44`,
      }}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-[#0d1118]/90 text-left transition-transform duration-150 hover:shadow-[0_0_32px_rgba(255,51,85,0.22)] focus-visible:outline-2 focus-visible:outline-[#00ffff]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#080a0e]">
        {!imgFailed ? (
          <img
            src={fighter.image}
            alt={fighter.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-black p-4 font-display text-lg font-bold text-slate-300">
            {fighter.name}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d1118] via-[#0d1118]/25 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-bold tracking-wider">
            <span style={{ color: fighter.accentColor }}>{fighter.rank}</span>
            <span className="text-slate-400">{fighter.element}</span>
          </div>
          <h3 className="font-display mt-2 text-lg font-black leading-snug text-white transition-colors group-hover:text-[#00ffff]">
            {fighter.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-300">{fighter.title}</p>
        </div>

        <p className="font-display mt-4 text-xs font-bold tracking-widest text-slate-400 transition-colors group-hover:text-[#ffcc00]">
          VIEW DOSSIER &amp; STATS →
        </p>
      </div>
    </button>
  );
}

export function FightersSection() {
  const [selectedFighter, setSelectedFighter] = useState<FighterData | null>(null);

  return (
    <section
      id="fighters"
      className="relative overflow-hidden border-b border-cyan-500/20 px-4 py-20 sm:px-6 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-12 h-80 w-80 rounded-full bg-[#a855f7]/12 blur-[120px]"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-12 max-w-2xl">
            <p className="font-body text-sm font-bold tracking-[0.22em] text-[#ff3355]">
              WARRIOR ROSTER · CRIMSON VOID
            </p>
            <h2
              className="font-display mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              ⚔️ FIGHTERS OF THE RIFT
            </h2>
            <p className="mt-3 text-base text-slate-300">
              Select any combatant to inspect their dimensional rank, lore dossier, signature technique, and combat telemetry.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FIGHTERS.map((fighter, idx) => (
            <ScrollReveal key={fighter.id} delayMs={idx * 70}>
              <FighterCard fighter={fighter} onSelect={setSelectedFighter} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      <FighterModal fighter={selectedFighter} onClose={() => setSelectedFighter(null)} />
    </section>
  );
}
