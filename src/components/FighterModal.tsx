import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FighterData } from '../data/loreData';
import { soundEngine } from '../utils/soundEngine';

interface FighterModalProps {
  fighter: FighterData | null;
  onClose: () => void;
}

const STAT_LABELS: Array<{ key: keyof FighterData['stats']; label: string }> = [
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'technique', label: 'Technique' },
  { key: 'spirit', label: 'Spirit' },
];

export function FighterModal({ fighter, onClose }: FighterModalProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [fighter?.id]);

  useEffect(() => {
    if (!fighter) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.play('click');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fighter, onClose]);

  if (!fighter) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fighter-modal-title"
      data-testid="fighter-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.play('click');
          onClose();
        }
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-[#0d1118] p-6 shadow-2xl sm:p-8"
        style={{
          borderColor: `${fighter.accentColor}88`,
          boxShadow: `0 0 45px ${fighter.accentColor}33`,
        }}
      >
        <button
          type="button"
          onClick={() => {
            soundEngine.play('click');
            onClose();
          }}
          aria-label="Close fighter profile"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-cyan-400 hover:text-[#00ffff] focus-visible:outline-2 focus-visible:outline-[#00ffff]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Portrait */}
          <div className="md:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/15 bg-[#080a0e]">
              {!imgFailed ? (
                <img
                  src={fighter.image}
                  alt={fighter.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4 text-center font-display text-lg font-bold text-slate-300">
                  {fighter.name}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d1118] via-transparent to-transparent" />
            </div>
          </div>

          {/* Lore & Stats */}
          <div className="flex flex-col justify-between md:col-span-7">
            <div>
              <p
                className="font-display text-xs font-bold tracking-[0.2em]"
                style={{ color: fighter.accentColor }}
              >
                {fighter.title.toUpperCase()}
              </p>
              <h3 id="fighter-modal-title" className="font-display mt-1 text-2xl font-black text-white">
                {fighter.name}
              </h3>

              {/* Clean unboxed metadata */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-300">
                <span>Rank: {fighter.rank}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Power: {fighter.powerLevel}</span>
                <span aria-hidden="true">·</span>
                <span>Element: {fighter.element}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Style: <span className="text-slate-200">{fighter.fightingStyle}</span>
              </p>

              {/* Backstory */}
              <p className="mt-4 text-base leading-relaxed text-slate-200">{fighter.lore}</p>

              {/* Signature Move */}
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3.5">
                <p className="font-display text-[11px] font-bold tracking-[0.2em] text-slate-400">
                  SIGNATURE MOVE
                </p>
                <p
                  className="font-display mt-1 text-sm font-extrabold tracking-wide"
                  style={{
                    color: fighter.accentColor,
                    textShadow: `0 0 14px ${fighter.accentColor}88`,
                  }}
                >
                  {fighter.signatureMove}
                </p>
              </div>
            </div>

            {/* Stat Bars */}
            <div className="mt-6 space-y-3">
              {STAT_LABELS.map(({ key, label }) => {
                const value = fighter.stats[key];
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                      <span>{label}</span>
                      <span className="tabular-nums">{value} / 100</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${value}%`,
                          backgroundColor: fighter.accentColor,
                          boxShadow: `0 0 12px ${fighter.accentColor}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
