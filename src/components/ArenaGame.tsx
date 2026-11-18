import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Swords, Zap } from 'lucide-react';
import { FIGHTERS } from '../data/loreData';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  EMPTY_INPUT,
  FIGHTER_PRESETS,
  FighterEntity,
  GROUND_Y,
  MatchState,
  PlayerInputState,
  createInitialMatchState,
  stepMatch,
} from '../game/combatEngine';
import { soundEngine } from '../utils/soundEngine';

export interface ExternalLaunchRequest {
  p1Id: string;
  p2Id: string;
  nonce: number;
}

interface ArenaGameProps {
  launchRequest?: ExternalLaunchRequest | null;
}

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface PooledPopup {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
}

const PARTICLE_POOL_SIZE = 96;
const POPUP_POOL_SIZE = 24;

function createParticlePool(): PooledParticle[] {
  return Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 1,
    size: 3,
    color: '#00ffff',
  }));
}

function createPopupPool(): PooledPopup[] {
  return Array.from({ length: POPUP_POOL_SIZE }, () => ({
    active: false,
    x: 0,
    y: 0,
    vy: 0,
    life: 0,
    text: '',
    color: '#ffffff',
  }));
}

function pickDefaultRival(heroId: string): string {
  return heroId === 'zero' ? 'sams' : 'zero';
}

export function ArenaGame({ launchRequest }: ArenaGameProps) {
  const [phase, setPhase] = useState<'select' | 'playing' | 'paused' | 'gameover'>('select');
  const [p1Id, setP1Id] = useState<string>('sams');
  const [p2Id, setP2Id] = useState<string>('zero');
  const [superReady, setSuperReady] = useState(false);
  const [winnerSummary, setWinnerSummary] = useState<{
    winnerName: string;
    playerWon: boolean;
    p1Damage: number;
    elapsedSec: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const matchRef = useRef<MatchState>(createInitialMatchState('sams', 'zero', 'ai'));
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const comboStepRef = useRef(0);

  // High-frequency HUD refs (updated without 60Hz React re-renders)
  const p1HpBarRef = useRef<HTMLDivElement | null>(null);
  const p1GhostBarRef = useRef<HTMLDivElement | null>(null);
  const p1SpiritBarRef = useRef<HTMLDivElement | null>(null);
  const p1HpTextRef = useRef<HTMLSpanElement | null>(null);
  const p1ComboRef = useRef<HTMLSpanElement | null>(null);

  const p2HpBarRef = useRef<HTMLDivElement | null>(null);
  const p2GhostBarRef = useRef<HTMLDivElement | null>(null);
  const p2SpiritBarRef = useRef<HTMLDivElement | null>(null);
  const p2HpTextRef = useRef<HTMLSpanElement | null>(null);
  const p2ComboRef = useRef<HTMLSpanElement | null>(null);

  // Simple unified input buffers
  const keysHeldRef = useRef<Set<string>>(new Set());
  const keysJustPressedRef = useRef<Set<string>>(new Set());
  const touchHeldRef = useRef<{ left?: boolean; right?: boolean }>({});
  const touchActionRef = useRef<{ jump?: boolean; attack?: boolean }>({});

  const particlePoolRef = useRef<PooledParticle[]>(createParticlePool());
  const particleCursorRef = useRef<number>(0);
  const popupPoolRef = useRef<PooledPopup[]>(createPopupPool());
  const popupCursorRef = useRef<number>(0);

  const spawnPooledParticles = useCallback(
    (x: number, y: number, count: number, color: string) => {
      const pool = particlePoolRef.current;
      for (let i = 0; i < count; i++) {
        const idx = particleCursorRef.current % PARTICLE_POOL_SIZE;
        particleCursorRef.current = idx + 1;
        const p = pool[idx];
        const angle = Math.random() * Math.PI * 2;
        const speed = 90 + Math.random() * 260;
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 60;
        p.maxLife = 0.25 + Math.random() * 0.35;
        p.life = p.maxLife;
        p.size = 2 + Math.random() * 3.5;
        p.color = color;
      }
    },
    []
  );

  const spawnPooledPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const pool = popupPoolRef.current;
    const idx = popupCursorRef.current % POPUP_POOL_SIZE;
    popupCursorRef.current = idx + 1;
    const pop = pool[idx];
    pop.active = true;
    pop.x = x;
    pop.y = y;
    pop.vy = -55;
    pop.life = 0.65;
    pop.text = text;
    pop.color = color;
  }, []);

  const startFight = useCallback(
    (overrideP1?: string, overrideP2?: string) => {
      const f1 = overrideP1 ?? p1Id;
      const f2 = overrideP2 ?? pickDefaultRival(f1);
      setP1Id(f1);
      setP2Id(f2);
      matchRef.current = createInitialMatchState(f1, f2, 'ai');
      comboStepRef.current = 0;
      keysHeldRef.current.clear();
      keysJustPressedRef.current.clear();
      touchHeldRef.current = {};
      touchActionRef.current = {};
      setSuperReady(false);
      setWinnerSummary(null);
      setPhase('playing');
      soundEngine.unlock();
      soundEngine.play('fight');
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    [p1Id]
  );

  // Story battle cards jump straight into playing that matchup
  useEffect(() => {
    if (!launchRequest) return;
    startFight(launchRequest.p1Id, launchRequest.p2Id);
  }, [launchRequest, startFight]);

  // Keyboard Listeners (A/D or Arrows to move, W/Up to jump, Space/F/Enter to attack!)
  useEffect(() => {
    const clearInputs = () => {
      keysHeldRef.current.clear();
      keysJustPressedRef.current.clear();
      touchHeldRef.current = {};
      touchActionRef.current = {};
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const k = e.key.toLowerCase();

      if (phaseRef.current === 'playing' || phaseRef.current === 'paused') {
        if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
          e.preventDefault();
        }
        if ((k === 'escape' || k === 'p') && !e.repeat) {
          soundEngine.play('click');
          setPhase((prev) => (prev === 'playing' ? 'paused' : 'playing'));
          clearInputs();
          return;
        }
      }

      if (!e.repeat && !keysHeldRef.current.has(k)) {
        keysJustPressedRef.current.add(k);
      }
      keysHeldRef.current.add(k);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', clearInputs);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', clearInputs);
    };
  }, []);

  // Main 60 FPS Game Loop & Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();

    const drawFighter = (f: FighterEntity, timeSec: number) => {
      const bob =
        f.action === 'move'
          ? Math.sin(f.walkDistance * 0.08) * 3.5
          : Math.sin(timeSec * 3.6 + f.slot) * 2;
      const isHitFlash = f.hitFlashTimer > 0;
      const primary = isHitFlash ? '#ffffff' : f.preset.color;
      const accent = isHitFlash ? '#ffffff' : f.preset.accent;

      ctx.save();
      ctx.translate(f.x, f.y + bob);
      ctx.scale(f.facing * f.scaleX, f.scaleY);

      if (f.action === 'ko') {
        ctx.rotate(-0.65);
        ctx.globalAlpha = 0.72;
      }

      // Ground shadow
      ctx.save();
      ctx.scale(1 / f.scaleX, 1 / f.scaleY);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, GROUND_Y - f.y + 4, 28, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Golden Super Slash Ready Aura
      if (f.spirit >= 100 && f.action !== 'ko') {
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, -44, 34 + Math.sin(timeSec * 10) * 3, 52, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Guard shield
      if (f.action === 'guard') {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.16)';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(8, -42, 42, -Math.PI * 0.55, Math.PI * 0.55);
        ctx.stroke();
        ctx.fill();
      }

      // Body coat
      ctx.fillStyle = '#111622';
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-18, -16);
      ctx.lineTo(-14, -66);
      ctx.lineTo(14, -66);
      ctx.lineTo(20, -16);
      ctx.lineTo(8, -2);
      ctx.lineTo(-10, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Scarf
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(-6, -64);
      ctx.quadraticCurveTo(-28 - Math.sin(timeSec * 8) * 6, -54, -38, -38);
      ctx.lineTo(-12, -52);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.fillStyle = '#192030';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(2, -80, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.fillRect(6, -83, 7, 3.5);

      // Slash arc
      if (f.action === 'attack' && f.attackKind) {
        const isActive =
          (f.attackKind === 'light' && f.actionTimer >= 0.06) ||
          (f.attackKind === 'heavy' && f.actionTimer >= 0.25) ||
          (f.attackKind === 'ultimate' && f.actionTimer >= 0.22);

        if (isActive) {
          ctx.strokeStyle = f.attackKind === 'ultimate' ? '#ffcc00' : accent;
          ctx.lineWidth = f.attackKind === 'light' ? 5 : 9;
          ctx.beginPath();
          ctx.arc(22, -46, f.attackKind === 'light' ? 46 : 66, -1.1, 1.0);
          ctx.stroke();
        }
      }

      // Weapon
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (f.preset.weaponType === 'katana' || f.preset.weaponType === 'iceblade') {
        ctx.moveTo(8, -42);
        ctx.lineTo(44, -74);
      } else if (f.preset.weaponType === 'daggers') {
        ctx.moveTo(10, -40);
        ctx.lineTo(34, -56);
      } else {
        ctx.moveTo(10, -46);
        ctx.lineTo(26, -46);
      }
      ctx.stroke();

      // Label above head
      ctx.save();
      ctx.scale(f.facing, 1);
      ctx.fillStyle = f.slot === 1 ? '#00ffff' : '#ff00aa';
      ctx.font = 'bold 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.slot === 1 ? 'YOU' : 'RIVAL', 0, -104);
      ctx.restore();

      ctx.restore();
    };

    const renderFrame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);
      const timeSec = now / 1000;
      const match = matchRef.current;

      if (phaseRef.current === 'playing') {
        const held = keysHeldRef.current;
        const just = keysJustPressedRef.current;
        const tHeld = touchHeldRef.current;
        const tAct = touchActionRef.current;

        const wantAttack =
          just.has(' ') || just.has('f') || just.has('g') || just.has('j') || Boolean(tAct.attack);

        let light = false;
        let heavy = false;
        let ultimate = false;

        if (wantAttack) {
          if (match.p1.spirit >= 100) {
            ultimate = true;
            comboStepRef.current = 0;
          } else {
            comboStepRef.current = (comboStepRef.current + 1) % 3;
            if (comboStepRef.current === 0) heavy = true;
            else light = true;
          }
        }

        const p1Input: PlayerInputState = {
          left: held.has('a') || held.has('arrowleft') || Boolean(tHeld.left),
          right: held.has('d') || held.has('arrowright') || Boolean(tHeld.right),
          jump: just.has('w') || just.has('arrowup') || Boolean(tAct.jump),
          dash: just.has('shift'),
          guard: held.has('s') || held.has('arrowdown'),
          light,
          heavy,
          ultimate,
        };

        keysJustPressedRef.current.clear();
        touchActionRef.current = {};

        const events = stepMatch(match, p1Input, EMPTY_INPUT, dt);

        for (const ev of events) {
          if (ev.type === 'swing') soundEngine.play('whoosh');
          else if (ev.type === 'jump') {
            soundEngine.play('pop');
            spawnPooledParticles(ev.x, ev.y, 5, ev.color);
          } else if (ev.type === 'hit') {
            soundEngine.play('click');
            spawnPooledParticles(ev.x, ev.y, 12, ev.color);
            if (ev.damage) spawnPooledPopup(ev.x, ev.y - 20, `-${ev.damage}`, '#ffffff');
          } else if (ev.type === 'heavyHit') {
            soundEngine.play('shing');
            soundEngine.play('boom');
            spawnPooledParticles(ev.x, ev.y, 24, ev.color);
            if (ev.damage) spawnPooledPopup(ev.x, ev.y - 24, `-${ev.damage}!`, '#ffcc00');
          } else if (ev.type === 'guard') {
            soundEngine.play('tick');
            spawnPooledParticles(ev.x, ev.y, 10, '#00ffff');
            spawnPooledPopup(ev.x, ev.y - 20, 'BLOCK', '#00ffff');
          } else if (ev.type === 'ultimate') {
            soundEngine.play('charge');
            soundEngine.play('shing');
            spawnPooledParticles(ev.x, ev.y, 28, '#ffcc00');
            spawnPooledPopup(ev.x, ev.y - 36, 'SUPER SLASH!', '#ffcc00');
          } else if (ev.type === 'ko') {
            soundEngine.play('boom');
            soundEngine.play('shing');
            spawnPooledParticles(ev.x, ev.y, 40, '#ff3355');
            spawnPooledPopup(ev.x, ev.y - 30, 'K.O.!', '#ff3355');
          }
        }

        // Sync Super button highlight only on boolean edge
        const isSuper = match.p1.spirit >= 100;
        setSuperReady((prev) => (prev === isSuper ? prev : isSuper));

        // Direct DOM HUD updates
        if (p1HpBarRef.current) p1HpBarRef.current.style.width = `${match.p1.hp}%`;
        if (p1GhostBarRef.current) p1GhostBarRef.current.style.width = `${match.p1.ghostHp}%`;
        if (p1SpiritBarRef.current) p1SpiritBarRef.current.style.width = `${match.p1.spirit}%`;
        if (p1HpTextRef.current) p1HpTextRef.current.textContent = `${Math.round(match.p1.hp)} HP`;
        if (p1ComboRef.current) {
          p1ComboRef.current.textContent =
            match.p1.comboCount >= 2 ? `${match.p1.comboCount} HIT COMBO!` : '';
        }

        if (p2HpBarRef.current) p2HpBarRef.current.style.width = `${match.p2.hp}%`;
        if (p2GhostBarRef.current) p2GhostBarRef.current.style.width = `${match.p2.ghostHp}%`;
        if (p2SpiritBarRef.current) p2SpiritBarRef.current.style.width = `${match.p2.spirit}%`;
        if (p2HpTextRef.current) p2HpTextRef.current.textContent = `${Math.round(match.p2.hp)} HP`;
        if (p2ComboRef.current) {
          p2ComboRef.current.textContent =
            match.p2.comboCount >= 2 ? `${match.p2.comboCount} HIT COMBO!` : '';
        }

        if (match.finished && match.winnerSlot) {
          const winner = match.winnerSlot === 1 ? match.p1 : match.p2;
          setWinnerSummary({
            winnerName: winner.preset.name,
            playerWon: match.winnerSlot === 1,
            p1Damage: match.p1.totalDamageDealt,
            elapsedSec: Math.round(match.elapsedSec),
          });
          soundEngine.play('success');
          setPhase('gameover');
        }
      }

      // Draw Arena
      ctx.save();
      const shakeMag = match.trauma * match.trauma * 14;
      if (shakeMag > 0.2) {
        ctx.translate(
          (Math.random() - 0.5) * shakeMag * 2,
          (Math.random() - 0.5) * shakeMag * 2
        );
      }

      const bgGrad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
      bgGrad.addColorStop(0, '#070812');
      bgGrad.addColorStop(0.65, '#150819');
      bgGrad.addColorStop(1, '#0b0e14');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Rift fracture
      ctx.strokeStyle = 'rgba(255, 51, 85, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(390, 20);
      ctx.lineTo(465, 110);
      ctx.lineTo(445, 190);
      ctx.lineTo(525, 290);
      ctx.stroke();

      // Floor
      ctx.fillStyle = '#0e131e';
      ctx.fillRect(0, GROUND_Y, ARENA_WIDTH, ARENA_HEIGHT - GROUND_Y);

      ctx.strokeStyle = 'rgba(0, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(ARENA_WIDTH, GROUND_Y);
      ctx.stroke();

      for (const w of match.waves) {
        ctx.save();
        ctx.fillStyle = w.color;
        ctx.shadowColor = w.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawFighter(match.p1, timeSec);
      drawFighter(match.p2, timeSec);

      for (const p of particlePoolRef.current) {
        if (!p.active) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 380 * dt;
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const pop of popupPoolRef.current) {
        if (!pop.active) continue;
        pop.y += pop.vy * dt;
        pop.life -= dt;
        if (pop.life <= 0) {
          pop.active = false;
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, pop.life * 2);
        ctx.font = '900 18px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      }

      ctx.restore();
      animId = window.requestAnimationFrame(renderFrame);
    };

    animId = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(animId);
  }, [spawnPooledParticles, spawnPooledPopup]);

  const p1Preset = FIGHTER_PRESETS[p1Id] ?? FIGHTER_PRESETS.sams;
  const p2Preset = FIGHTER_PRESETS[p2Id] ?? FIGHTER_PRESETS.zero;

  return (
    <div
      data-testid="playable-arena-game"
      className="mb-12 overflow-hidden rounded-2xl border border-[#00ffff]/40 bg-[#090c12] shadow-[0_0_40px_rgba(0,255,255,0.14)]"
    >
      {/* Arena Canvas Stage */}
      <div
        className={`relative w-full overflow-hidden bg-gradient-to-b from-[#070812] from-50% to-[#0e131e] to-50% sm:aspect-[960/460] ${
          phase === 'select' ? 'aspect-[4/3] min-h-[295px]' : 'aspect-[16/10] min-h-[235px]'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          data-testid="arena-game-canvas"
          onClick={() => {
            if (phase === 'playing') {
              soundEngine.unlock();
              touchActionRef.current.attack = true;
            }
          }}
          className="h-full w-full cursor-pointer object-contain"
        />

        {/* Simple Top HUD */}
        {(phase === 'playing' || phase === 'paused') && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-1.5 p-2 sm:gap-4 sm:p-4">
            {/* Player HP */}
            <div className="w-[42%] max-w-sm rounded-lg border border-cyan-400/35 bg-[#0a0e16]/85 p-1.5 sm:w-[41%] sm:p-3">
              <div className="flex items-center justify-between gap-1 text-[9px] font-bold tracking-wider sm:text-xs">
                <span className="font-display truncate text-[#00ffff]">
                  YOU · {p1Preset.shortName}
                </span>
                <span ref={p1HpTextRef} className="font-display whitespace-nowrap shrink-0 tabular-nums text-white">
                  100 HP
                </span>
              </div>
              <div className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded bg-slate-800 sm:h-3">
                <div
                  ref={p1GhostBarRef}
                  className="absolute inset-y-0 left-0 bg-amber-300/60"
                  style={{ width: '100%' }}
                />
                <div
                  ref={p1HpBarRef}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff3355] to-[#00ffff]"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-800">
                  <div
                    ref={p1SpiritBarRef}
                    className="h-full bg-[#ffcc00]"
                    style={{ width: '40%' }}
                  />
                </div>
                <span
                  ref={p1ComboRef}
                  className="font-display whitespace-nowrap text-[9px] font-black tracking-wider text-[#ffcc00] sm:text-[10px]"
                />
              </div>
            </div>

            {/* Pause Button */}
            <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  soundEngine.play('click');
                  setPhase((prev) => (prev === 'playing' ? 'paused' : 'playing'));
                }}
                aria-label="Pause game"
                className="flex h-8 w-8 items-center justify-center rounded border border-white/25 bg-[#0d111a]/90 text-white hover:border-[#00ffff] hover:text-[#00ffff]"
              >
                <Pause className="h-4 w-4" />
              </button>
            </div>

            {/* Rival HP */}
            <div className="w-[42%] max-w-sm rounded-lg border border-[#ff00aa]/35 bg-[#0a0e16]/85 p-1.5 sm:w-[41%] sm:p-3">
              <div className="flex items-center justify-between gap-1 text-[9px] font-bold tracking-wider sm:text-xs">
                <span ref={p2HpTextRef} className="font-display whitespace-nowrap shrink-0 tabular-nums text-white">
                  100 HP
                </span>
                <span className="font-display truncate text-[#ff88dd]">
                  RIVAL · {p2Preset.shortName}
                </span>
              </div>
              <div className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded bg-slate-800 sm:h-3">
                <div
                  ref={p2GhostBarRef}
                  className="absolute inset-y-0 right-0 bg-amber-300/60"
                  style={{ width: '100%' }}
                />
                <div
                  ref={p2HpBarRef}
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-[#a855f7] to-[#ff00aa]"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span
                  ref={p2ComboRef}
                  className="font-display whitespace-nowrap text-[9px] font-black tracking-wider text-[#ffcc00] sm:text-[10px]"
                />
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-800">
                  <div
                    ref={p2SpiritBarRef}
                    className="ml-auto h-full bg-[#ffcc00]"
                    style={{ width: '40%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple 1-Step Fighter Select Screen */}
        {phase === 'select' && (
          <div
            data-testid="game-select-overlay"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#07090f]/92 p-4 text-center sm:p-6"
          >
            <p className="font-display text-xs font-bold tracking-[0.22em] text-[#ffcc00]">
              SIMPLE ARCADE FIGHTER · PLAY ANYTIME
            </p>
            <h3 className="font-display mt-1 text-xl font-black text-white sm:text-3xl">
              PICK YOUR WARRIOR
            </h3>

            <div className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-2 sm:grid-cols-6">
              {FIGHTERS.map((f) => {
                const selected = p1Id === f.id;
                const preset = FIGHTER_PRESETS[f.id];
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      soundEngine.play('select');
                      setP1Id(f.id);
                      setP2Id(pickDefaultRival(f.id));
                    }}
                    className={`font-display flex min-h-[48px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-xs font-bold transition ${
                      selected
                        ? 'border-[#00ffff] bg-[#00ffff]/20 text-white shadow-[0_0_16px_rgba(0,255,255,0.35)]'
                        : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/40'
                    }`}
                  >
                    <span>{preset.shortName}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              data-start="true"
              onClick={() => startFight()}
              className="font-display mt-5 flex min-h-[50px] cursor-pointer items-center gap-2 rounded-xl bg-[#ff3355] px-10 py-3 text-base font-black tracking-widest text-white shadow-[0_0_26px_rgba(255,51,85,0.6)] transition hover:scale-[1.04]"
            >
              <Play className="h-5 w-5" aria-hidden="true" />
              PLAY NOW
            </button>

            <p className="mt-3 text-xs font-semibold text-slate-400">
              Move: ← / → or A / D · Jump: ↑ or W · Attack: Space / F / Click
            </p>
          </div>
        )}

        {/* Simple Pause Screen */}
        {phase === 'paused' && (
          <div
            data-testid="game-pause-overlay"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-4"
          >
            <div className="w-full max-w-xs rounded-2xl border border-[#00ffff]/45 bg-[#0c1018] p-6 text-center">
              <h3 className="font-display text-2xl font-black text-white">PAUSED</h3>
              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setPhase('playing');
                  }}
                  className="font-display min-h-[44px] rounded-lg bg-[#00ffff] px-5 text-sm font-black text-[#07090f]"
                >
                  RESUME
                </button>
                <button
                  type="button"
                  onClick={() => startFight()}
                  className="font-display min-h-[44px] rounded-lg border border-white/20 bg-white/5 px-5 text-sm font-bold text-white"
                >
                  RESTART
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setPhase('select');
                  }}
                  className="font-display min-h-[44px] rounded-lg border border-white/15 px-5 text-xs font-bold text-slate-300"
                >
                  SWITCH WARRIOR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simple Victory / Try Again Screen */}
        {phase === 'gameover' && winnerSummary && (
          <div
            data-testid="game-victory-overlay"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl border border-[#ffcc00]/60 bg-[#0c1018] p-6 text-center">
              <p className="font-display text-xs font-bold tracking-[0.24em] text-[#ffcc00]">
                {winnerSummary.playerWon ? 'YOU WIN!' : 'RIVAL WINS!'}
              </p>
              <h3 className="font-display mt-1 text-2xl font-black text-white">
                {winnerSummary.winnerName}
              </h3>

              <div className="mt-4 flex justify-center gap-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                <div>
                  <p className="text-slate-400">DAMAGE</p>
                  <p className="font-display tabular-nums mt-0.5 text-base font-black text-[#00ffff]">
                    {winnerSummary.p1Damage}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">TIME</p>
                  <p className="font-display tabular-nums mt-0.5 text-base font-black text-[#ffcc00]">
                    {winnerSummary.elapsedSec}s
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  data-start="true"
                  onClick={() => startFight()}
                  className="font-display flex min-h-[44px] items-center gap-2 rounded-lg bg-[#ff3355] px-6 text-sm font-black tracking-wider text-white"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  PLAY AGAIN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setPhase('select');
                  }}
                  className="font-display min-h-[44px] rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 text-xs font-bold text-[#00ffff]"
                >
                  CHANGE WARRIOR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Super Simple 4-Button Arcade Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0b0f17] px-3 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={() => {
              soundEngine.unlock();
              touchHeldRef.current.left = true;
            }}
            onPointerUp={() => {
              touchHeldRef.current.left = false;
            }}
            onPointerLeave={() => {
              touchHeldRef.current.left = false;
            }}
            onPointerCancel={() => {
              touchHeldRef.current.left = false;
            }}
            aria-label="Move Left"
            className="font-display min-h-[46px] min-w-[56px] touch-none select-none rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-black text-white active:bg-[#00ffff] active:text-black"
          >
            ◀
          </button>
          <button
            type="button"
            onPointerDown={() => {
              soundEngine.unlock();
              touchHeldRef.current.right = true;
            }}
            onPointerUp={() => {
              touchHeldRef.current.right = false;
            }}
            onPointerLeave={() => {
              touchHeldRef.current.right = false;
            }}
            onPointerCancel={() => {
              touchHeldRef.current.right = false;
            }}
            aria-label="Move Right"
            className="font-display min-h-[46px] min-w-[56px] touch-none select-none rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-black text-white active:bg-[#00ffff] active:text-black"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              touchActionRef.current.jump = true;
            }}
            className="font-display min-h-[46px] touch-none select-none rounded-xl border border-cyan-400/45 bg-cyan-500/15 px-5 text-xs font-black tracking-wider text-[#00ffff] active:bg-[#00ffff] active:text-black"
          >
            ▲ JUMP
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.unlock();
            touchActionRef.current.attack = true;
          }}
          className={`font-display flex min-h-[46px] flex-1 touch-none select-none items-center justify-center gap-2 rounded-xl px-6 text-sm font-black tracking-widest transition sm:max-w-[240px] ${
            superReady
              ? 'border border-[#ffcc00] bg-[#ffcc00] text-black shadow-[0_0_22px_rgba(255,204,0,0.65)]'
              : 'border border-[#ff3355] bg-[#ff3355] text-white shadow-[0_0_16px_rgba(255,51,85,0.45)] active:scale-95'
          }`}
        >
          {superReady ? (
            <>
              <Zap className="h-4 w-4 fill-current" aria-hidden="true" />
              SUPER SLASH!
            </>
          ) : (
            <>
              <Swords className="h-4 w-4" aria-hidden="true" />
              ATTACK
            </>
          )}
        </button>
      </div>
    </div>
  );
}
