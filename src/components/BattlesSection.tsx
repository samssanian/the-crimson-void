import { useState } from 'react';
import { BATTLES, BattleData } from '../data/loreData';
import { BattleClashResult, resolveBattleClash } from '../utils/arenaLogic';
import { soundEngine } from '../utils/soundEngine';
import { ArenaGame, ExternalLaunchRequest } from './ArenaGame';
import { ScrollReveal } from './ScrollReveal';

interface BattlesSectionProps {
  onTriggerShake: () => void;
  onTriggerBurst: (x: number, y: number, colors?: string[]) => void;
}

const ACCENT_MAP: Record<BattleData['accent'], { border: string; badge: string; btn: string }> = {
  red: {
    border: 'border-[#ff3355]/50',
    badge: 'text-[#ff3355]',
    btn: 'from-[#ff3355] to-[#ff00aa]',
  },
  cyan: {
    border: 'border-[#00ffff]/45',
    badge: 'text-[#00ffff]',
    btn: 'from-[#00c8ff] to-[#3b82f6]',
  },
  magenta: {
    border: 'border-[#ff00aa]/45',
    badge: 'text-[#ff00aa]',
    btn: 'from-[#a855f7] to-[#ff00aa]',
  },
};

const BATTLE_FIGHTER_IDS: Record<string, { p1: string; p2: string }> = {
  'rift-duel': { p1: 'sams', p2: 'zero' },
  'frozen-sky': { p1: 'yuki', p2: 'kai' },
  'iron-rose': { p1: 'akane', p2: 'raijin' },
};

const TICKER_ITEMS = [
  'LIVE ARENA: OPEN ACCESS — ANYONE CAN PLAY ANYTIME WITH NO TIME LIMIT · ',
  'SAMS SANIAN AHAMOD HOLDS CENTER PLATFORM · ',
  'ZERO DETECTED AT SECTOR 01 · ',
  'YUKI VS KAI: LIGHTNING & ABSOLUTE ZERO CLASH · ',
  'AKANE DEFECTED FROM VOID COUNCIL · ',
];

export function BattlesSection({ onTriggerShake, onTriggerBurst }: BattlesSectionProps) {
  const [results, setResults] = useState<Record<string, BattleClashResult>>({});
  const [launchRequest, setLaunchRequest] = useState<ExternalLaunchRequest | null>(null);

  const handleFight = (battle: BattleData, clientX: number, clientY: number) => {
    soundEngine.unlock();
    soundEngine.play('fight');
    onTriggerShake();
    onTriggerBurst(clientX, clientY, ['#ff3355', '#00ffff', '#ffcc00']);

    const clash = resolveBattleClash(
      battle.fighterA,
      battle.fighterB,
      battle.powerA,
      battle.powerB
    );
    setResults((prev) => ({ ...prev, [battle.id]: clash }));

    const pair = BATTLE_FIGHTER_IDS[battle.id] ?? { p1: 'sams', p2: 'zero' };
    setLaunchRequest({ p1Id: pair.p1, p2Id: pair.p2, nonce: Date.now() });

    const arenaEl = document.getElementById('arena-arcade');
    arenaEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section id="battles" className="relative overflow-hidden border-b border-cyan-500/20 px-4 py-20 sm:px-6 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-[#ff3355]/10 blur-[120px]"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Live Ticker */}
        <div
          aria-label="Live arena broadcast ticker"
          className="mb-10 overflow-hidden rounded-lg border border-[#ff3355]/40 bg-[#140911]/90 py-2.5"
        >
          <div className="animate-ticker-scroll inline-block whitespace-nowrap font-display text-xs font-bold tracking-[0.2em] text-[#ff88a8]">
            {TICKER_ITEMS.join('').repeat(2)}
          </div>
        </div>

        <ScrollReveal>
          <div className="mb-8 max-w-2xl">
            <p className="font-body text-sm font-bold tracking-[0.22em] text-[#ffcc00]">
              DIMENSIONAL COLISEUM · PLAYABLE ANYTIME
            </p>
            <h2
              className="font-display mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              🏟️ BATTLES / PLAY THE ARENA GAME
            </h2>
            <p className="mt-3 text-base text-slate-300">
              Pick your warrior and hit PLAY NOW — move with Left/Right, Jump, and tap Attack for combos and Super Slash. No time limits!
            </p>
          </div>
        </ScrollReveal>

        {/* Playable Real-Time 2D Anime Fighting Game */}
        <div id="arena-arcade">
          <ArenaGame launchRequest={launchRequest} />
        </div>

        {/* 3 Story Battle Matchups */}
        <div className="grid gap-6 lg:grid-cols-3">
          {BATTLES.map((battle, idx) => {
            const style = ACCENT_MAP[battle.accent];
            const result = results[battle.id];

            return (
              <ScrollReveal key={battle.id} delayMs={idx * 90}>
                <article
                  className={`flex h-full flex-col justify-between rounded-2xl border ${style.border} bg-[#0d111a]/90 p-6 backdrop-blur-md transition duration-200 hover:-translate-y-0.5`}
                >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-display text-xs font-extrabold tracking-widest ${style.badge}`}>
                      {battle.tag}
                    </span>
                    <span className="font-display text-xs font-bold text-[#00ffff]">
                      OPEN ANYTIME
                    </span>
                  </div>

                  <h3 className="font-display mt-3 text-xl font-black text-white">
                    {battle.title}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-[#00ffff]">{battle.matchup}</p>
                  <p className="mt-3 text-base leading-relaxed text-slate-300">{battle.story}</p>
                </div>

                <div className="mt-6">
                  {result && (
                    <div
                      data-testid={`battle-result-${battle.id}`}
                      className="mb-4 rounded-lg border border-[#ffcc00]/40 bg-[#ffcc00]/10 p-3 text-sm font-semibold text-[#ffe899]"
                    >
                      {result.clashSummary}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleFight(battle, rect.left + rect.width / 2, rect.top + rect.height / 2);
                    }}
                    onMouseEnter={() => soundEngine.play('hover')}
                    className={`font-display min-h-[46px] w-full cursor-pointer rounded-lg bg-gradient-to-r ${style.btn} px-5 py-3 text-sm font-black tracking-[0.2em] text-white shadow-lg transition hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[#00ffff]`}
                  >
                    FIGHT!
                  </button>
                </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
