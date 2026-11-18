export type GameMode = 'ai' | 'pvp' | 'training';
export type FighterAction = 'idle' | 'move' | 'jump' | 'dash' | 'guard' | 'attack' | 'hitstun' | 'ko';
export type AttackKind = 'light' | 'heavy' | 'ultimate';

export interface FighterPreset {
  id: string;
  name: string;
  shortName: string;
  color: string;
  accent: string;
  speed: number;
  power: number;
  weaponType: 'katana' | 'fists' | 'iceblade' | 'gauntlets' | 'daggers' | 'voidorb';
  ultimateName: string;
}

export const FIGHTER_PRESETS: Record<string, FighterPreset> = {
  sams: {
    id: 'sams',
    name: 'SAMS SANIAN AHAMOD',
    shortName: 'SAMS',
    color: '#ff3355',
    accent: '#00ffff',
    speed: 350,
    power: 1.12,
    weaponType: 'katana',
    ultimateName: 'CRIMSON ECLIPSE',
  },
  kai: {
    id: 'kai',
    name: "KAI 'THUNDERFANG' TAKEDA",
    shortName: 'KAI',
    color: '#00ffff',
    accent: '#fbbf24',
    speed: 370,
    power: 1.0,
    weaponType: 'fists',
    ultimateName: 'VOLT BREAKER',
  },
  yuki: {
    id: 'yuki',
    name: "YUKI 'FROST VEIL' MIYAMOTO",
    shortName: 'YUKI',
    color: '#38bdf8',
    accent: '#e0f2fe',
    speed: 365,
    power: 1.04,
    weaponType: 'iceblade',
    ultimateName: 'ETERNAL WINTER',
  },
  raijin: {
    id: 'raijin',
    name: "RAIJIN 'IRON SOUL' KUROSAWA",
    shortName: 'RAIJIN',
    color: '#ffcc00',
    accent: '#fb923c',
    speed: 280,
    power: 1.22,
    weaponType: 'gauntlets',
    ultimateName: 'TECTONIC ZERO',
  },
  akane: {
    id: 'akane',
    name: "AKANE 'CRIMSON LILY' HOSHINO",
    shortName: 'AKANE',
    color: '#ff00aa',
    accent: '#ff3355',
    speed: 385,
    power: 1.05,
    weaponType: 'daggers',
    ultimateName: 'SCARLET PETAL STORM',
  },
  zero: {
    id: 'zero',
    name: 'ZERO',
    shortName: 'ZERO',
    color: '#a855f7',
    accent: '#ff00aa',
    speed: 360,
    power: 1.1,
    weaponType: 'voidorb',
    ultimateName: 'EVENT HORIZON',
  },
};

export interface PlayerInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  dash: boolean;
  guard: boolean;
  light: boolean;
  heavy: boolean;
  ultimate: boolean;
}

export const EMPTY_INPUT: PlayerInputState = {
  left: false,
  right: false,
  jump: false,
  dash: false,
  guard: false,
  light: false,
  heavy: false,
  ultimate: false,
};

export interface FighterEntity {
  slot: 1 | 2;
  preset: FighterPreset;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  ghostHp: number;
  spirit: number;
  action: FighterAction;
  actionTimer: number;
  actionDuration: number;
  attackKind: AttackKind | null;
  attackHasHit: boolean;
  hitFlashTimer: number;
  dashCooldown: number;
  invulnTimer: number;
  comboCount: number;
  totalDamageDealt: number;
  scaleX: number;
  scaleY: number;
  walkDistance: number;
}

export interface EnergyWave {
  active: boolean;
  ownerSlot: 1 | 2;
  x: number;
  y: number;
  vx: number;
  radius: number;
  damage: number;
  color: string;
  life: number;
}

export interface CombatEvent {
  type: 'swing' | 'hit' | 'heavyHit' | 'guard' | 'dash' | 'jump' | 'ultimate' | 'ko';
  x: number;
  y: number;
  color: string;
  damage?: number;
  attackerSlot?: 1 | 2;
}

export interface MatchState {
  arenaWidth: number;
  arenaHeight: number;
  groundY: number;
  mode: GameMode;
  p1: FighterEntity;
  p2: FighterEntity;
  waves: EnergyWave[];
  hitstopTimer: number;
  trauma: number;
  koSlowmoTimer: number;
  finished: boolean;
  winnerSlot: 1 | 2 | null;
  elapsedSec: number;
  aiDecisionTimer: number;
  aiCurrentInput: PlayerInputState;
}

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 460;
export const GROUND_Y = 384;
const GRAVITY = 1850;
const JUMP_VELOCITY = -700;

function createFighter(slot: 1 | 2, presetId: string): FighterEntity {
  const preset = FIGHTER_PRESETS[presetId] ?? FIGHTER_PRESETS.sams;
  return {
    slot,
    preset,
    x: slot === 1 ? 230 : 730,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    facing: slot === 1 ? 1 : -1,
    hp: 100,
    maxHp: 100,
    ghostHp: 100,
    spirit: 40,
    action: 'idle',
    actionTimer: 0,
    actionDuration: 0,
    attackKind: null,
    attackHasHit: false,
    hitFlashTimer: 0,
    dashCooldown: 0,
    invulnTimer: 0,
    comboCount: 0,
    totalDamageDealt: 0,
    scaleX: 1,
    scaleY: 1,
    walkDistance: 0,
  };
}

export function createInitialMatchState(
  p1Id: string,
  p2Id: string,
  mode: GameMode = 'ai'
): MatchState {
  return {
    arenaWidth: ARENA_WIDTH,
    arenaHeight: ARENA_HEIGHT,
    groundY: GROUND_Y,
    mode,
    p1: createFighter(1, p1Id),
    p2: createFighter(2, p2Id),
    waves: [],
    hitstopTimer: 0,
    trauma: 0,
    koSlowmoTimer: 0,
    finished: false,
    winnerSlot: null,
    elapsedSec: 0,
    aiDecisionTimer: 0,
    aiCurrentInput: { ...EMPTY_INPUT },
  };
}

export function computeAiInput(state: MatchState, dt: number, roll = Math.random()): PlayerInputState {
  const ai = state.p2;
  const target = state.p1;
  const dx = target.x - ai.x;
  const dist = Math.abs(dx);

  state.aiDecisionTimer -= dt;
  if (state.aiDecisionTimer > 0) {
    // Keep one-shot attack triggers single-frame
    return {
      ...state.aiCurrentInput,
      jump: false,
      dash: false,
      light: false,
      heavy: false,
      ultimate: false,
    };
  }

  state.aiDecisionTimer = 0.18 + roll * 0.22;
  const next: PlayerInputState = { ...EMPTY_INPUT };

  // Guard if player is attacking close by
  if (target.action === 'attack' && dist < 135 && roll < 0.52) {
    next.guard = true;
    state.aiCurrentInput = next;
    return next;
  }

  // Ultimate if full spirit and aligned
  if (ai.spirit >= 100 && dist < 420 && roll < 0.7) {
    next.ultimate = true;
    state.aiCurrentInput = next;
    return next;
  }

  if (dist > 140) {
    if (dx < 0) next.left = true;
    else next.right = true;

    if (dist > 280 && ai.dashCooldown <= 0 && roll < 0.32) {
      next.dash = true;
    } else if (roll < 0.14 && ai.y >= GROUND_Y) {
      next.jump = true;
    }
  } else {
    if (roll < 0.45) {
      next.light = true;
    } else if (roll < 0.75) {
      next.heavy = true;
    } else if (roll < 0.88) {
      next.guard = true;
    } else if (ai.dashCooldown <= 0) {
      next.dash = true;
      if (dx < 0) next.right = true;
      else next.left = true;
    }
  }

  state.aiCurrentInput = next;
  return next;
}

function getAttackTimings(kind: AttackKind): {
  windup: number;
  activeEnd: number;
  duration: number;
  reach: number;
  damage: number;
  knockback: number;
  hitstop: number;
} {
  if (kind === 'light') {
    return {
      windup: 0.07,
      activeEnd: 0.17,
      duration: 0.28,
      reach: 96,
      damage: 7,
      knockback: 180,
      hitstop: 0.03,
    };
  }
  if (kind === 'heavy') {
    return {
      windup: 0.26, // readable telegraph window!
      activeEnd: 0.39,
      duration: 0.56,
      reach: 122,
      damage: 16,
      knockback: 420,
      hitstop: 0.06,
    };
  }
  return {
    windup: 0.3,
    activeEnd: 0.5,
    duration: 0.72,
    reach: 155,
    damage: 28,
    knockback: 560,
    hitstop: 0.08,
  };
}

function updateFighterPreAttack(
  f: FighterEntity,
  opponent: FighterEntity,
  input: PlayerInputState,
  dt: number,
  events: CombatEvent[],
  waves: EnergyWave[]
): void {
  f.hitFlashTimer = Math.max(0, f.hitFlashTimer - dt);
  f.dashCooldown = Math.max(0, f.dashCooldown - dt);
  f.invulnTimer = Math.max(0, f.invulnTimer - dt);
  f.ghostHp += (f.hp - f.ghostHp) * Math.min(1, dt * 4.5);

  // Squash-and-stretch exponential recovery
  f.scaleX += (1 - f.scaleX) * Math.min(1, dt * 14);
  f.scaleY += (1 - f.scaleY) * Math.min(1, dt * 14);

  if (f.action === 'ko') {
    f.vx *= Math.pow(0.08, dt);
    return;
  }

  if (f.action === 'hitstun') {
    f.actionTimer += dt;
    f.vx *= Math.pow(0.04, dt);
    if (f.actionTimer >= f.actionDuration) {
      f.action = 'idle';
      f.actionTimer = 0;
    }
    return;
  }

  if (f.action === 'dash') {
    f.actionTimer += dt;
    if (f.actionTimer >= f.actionDuration) {
      f.action = 'idle';
      f.vx *= 0.35;
    }
    return;
  }

  if (f.action === 'attack' && f.attackKind) {
    f.actionTimer += dt;
    f.vx *= Math.pow(0.02, dt);
    if (f.actionTimer >= f.actionDuration) {
      f.action = 'idle';
      f.attackKind = null;
      f.attackHasHit = false;
    }
    return;
  }

  // Face opponent when idle or moving on ground
  if (f.x !== opponent.x) {
    f.facing = opponent.x > f.x ? 1 : -1;
  }

  // Start Ultimate
  if (input.ultimate && f.spirit >= 100) {
    f.spirit = 0;
    f.action = 'attack';
    f.attackKind = 'ultimate';
    f.attackHasHit = false;
    f.actionTimer = 0;
    f.actionDuration = getAttackTimings('ultimate').duration;
    f.invulnTimer = 0.35;
    f.vx = f.facing * 220;
    events.push({ type: 'ultimate', x: f.x, y: f.y - 50, color: f.preset.color, attackerSlot: f.slot });

    // Launch projectile wave across the arena
    waves.push({
      active: true,
      ownerSlot: f.slot,
      x: f.x + f.facing * 52,
      y: f.y - 46,
      vx: f.facing * 680,
      radius: 26,
      damage: Math.round(24 * f.preset.power),
      color: f.preset.accent,
      life: 1.4,
    });
    return;
  }

  // Start Heavy or Light attack
  if (input.heavy) {
    f.action = 'attack';
    f.attackKind = 'heavy';
    f.attackHasHit = false;
    f.actionTimer = 0;
    f.actionDuration = getAttackTimings('heavy').duration;
    f.vx = f.facing * 120;
    events.push({ type: 'swing', x: f.x, y: f.y - 45, color: f.preset.color, attackerSlot: f.slot });
    return;
  }

  if (input.light) {
    f.action = 'attack';
    f.attackKind = 'light';
    f.attackHasHit = false;
    f.actionTimer = 0;
    f.actionDuration = getAttackTimings('light').duration;
    f.vx = f.facing * 90;
    events.push({ type: 'swing', x: f.x, y: f.y - 45, color: f.preset.accent, attackerSlot: f.slot });
    return;
  }

  // Dash
  if (input.dash && f.dashCooldown <= 0) {
    const dir = input.left ? -1 : input.right ? 1 : f.facing;
    f.action = 'dash';
    f.actionTimer = 0;
    f.actionDuration = 0.18;
    f.dashCooldown = 0.55;
    f.invulnTimer = 0.18;
    f.vx = dir * 720;
    f.scaleX = 1.24;
    f.scaleY = 0.82;
    events.push({ type: 'dash', x: f.x, y: f.y - 35, color: f.preset.accent, attackerSlot: f.slot });
    return;
  }

  // Guard
  if (input.guard && f.y >= GROUND_Y) {
    f.action = 'guard';
    f.vx = 0;
    return;
  }

  // Horizontal movement
  const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  f.vx = moveDir * f.preset.speed;
  if (moveDir !== 0 && f.y >= GROUND_Y) {
    f.action = 'move';
    f.walkDistance += Math.abs(f.vx) * dt;
  } else if (f.y >= GROUND_Y) {
    f.action = 'idle';
  }

  // Jump
  if (input.jump && f.y >= GROUND_Y) {
    f.vy = JUMP_VELOCITY;
    f.action = 'jump';
    f.scaleX = 0.82;
    f.scaleY = 1.22;
    events.push({ type: 'jump', x: f.x, y: f.y, color: f.preset.accent, attackerSlot: f.slot });
  }
}

function integratePhysics(f: FighterEntity, dt: number): void {
  const wasAirborne = f.y < GROUND_Y;
  f.x += f.vx * dt;
  f.vy += GRAVITY * dt;
  f.y += f.vy * dt;

  if (f.y >= GROUND_Y) {
    f.y = GROUND_Y;
    if (wasAirborne && f.vy > 120) {
      f.scaleX = 1.22;
      f.scaleY = 0.78;
    }
    f.vy = 0;
    if (f.action === 'jump') {
      f.action = 'idle';
    }
  }

  // Keep inside arena bounds
  f.x = Math.max(54, Math.min(ARENA_WIDTH - 54, f.x));
}

function applyHit(
  state: MatchState,
  attacker: FighterEntity,
  defender: FighterEntity,
  rawDamage: number,
  knockback: number,
  hitstop: number,
  isHeavy: boolean,
  events: CombatEvent[]
): void {
  if (defender.invulnTimer > 0 || defender.action === 'ko') return;

  const isGuarding = defender.action === 'guard' && defender.facing !== attacker.facing;
  const finalDamage = isGuarding ? Math.max(1, Math.round(rawDamage * 0.2)) : rawDamage;

  if (state.mode !== 'training') {
    defender.hp = Math.max(0, defender.hp - finalDamage);
  } else {
    // In training mode, showcase damage without locking out play
    defender.hp = Math.max(15, defender.hp - finalDamage);
  }

  attacker.totalDamageDealt += finalDamage;
  attacker.spirit = Math.min(100, attacker.spirit + (isGuarding ? 8 : 16));
  defender.spirit = Math.min(100, defender.spirit + 10);

  if (isGuarding) {
    defender.vx = attacker.facing * (knockback * 0.35);
    state.hitstopTimer = Math.max(state.hitstopTimer, 0.025);
    events.push({
      type: 'guard',
      x: defender.x,
      y: defender.y - 48,
      color: '#00ffff',
      damage: finalDamage,
      attackerSlot: attacker.slot,
    });
    return;
  }

  attacker.comboCount += 1;
  defender.comboCount = 0;
  defender.hitFlashTimer = 0.07;
  defender.vx = attacker.facing * knockback;
  defender.vy = isHeavy ? -240 : -90;
  defender.action = defender.hp <= 0 ? 'ko' : 'hitstun';
  defender.actionTimer = 0;
  defender.actionDuration = isHeavy ? 0.34 : 0.2;
  defender.attackKind = null;

  state.hitstopTimer = Math.max(state.hitstopTimer, hitstop);
  state.trauma = Math.min(1, state.trauma + (isHeavy ? 0.65 : 0.28));

  events.push({
    type: defender.hp <= 0 ? 'ko' : isHeavy ? 'heavyHit' : 'hit',
    x: defender.x,
    y: defender.y - 52,
    color: attacker.preset.color,
    damage: finalDamage,
    attackerSlot: attacker.slot,
  });

  if (defender.hp <= 0 && !state.finished) {
    state.winnerSlot = attacker.slot;
    state.koSlowmoTimer = 0.55;
  }
}

function checkMeleeHits(state: MatchState, attacker: FighterEntity, defender: FighterEntity, events: CombatEvent[]): void {
  if (attacker.action !== 'attack' || !attacker.attackKind || attacker.attackHasHit) return;
  const timings = getAttackTimings(attacker.attackKind);
  if (attacker.actionTimer < timings.windup || attacker.actionTimer > timings.activeEnd) return;

  const dx = (defender.x - attacker.x) * attacker.facing;
  const dy = Math.abs(defender.y - attacker.y);
  if (dx >= -20 && dx <= timings.reach && dy <= 85) {
    attacker.attackHasHit = true;
    const dmg = Math.round(timings.damage * attacker.preset.power);
    applyHit(
      state,
      attacker,
      defender,
      dmg,
      timings.knockback,
      timings.hitstop,
      attacker.attackKind !== 'light',
      events
    );
  }
}

export function stepMatch(
  state: MatchState,
  p1Input: PlayerInputState,
  p2RawInput: PlayerInputState,
  rawDt: number
): CombatEvent[] {
  const events: CombatEvent[] = [];
  const dt = Math.min(Math.max(rawDt, 0), 0.05);

  state.trauma = Math.max(0, state.trauma - dt * 2.4);

  if (state.finished) return events;

  if (state.hitstopTimer > 0) {
    state.hitstopTimer = Math.max(0, state.hitstopTimer - dt);
    state.p1.hitFlashTimer = Math.max(0, state.p1.hitFlashTimer - dt);
    state.p2.hitFlashTimer = Math.max(0, state.p2.hitFlashTimer - dt);
    return events;
  }

  let simDt = dt;
  if (state.koSlowmoTimer > 0) {
    state.koSlowmoTimer -= dt;
    simDt = dt * 0.25;
    if (state.koSlowmoTimer <= 0) {
      state.finished = true;
    }
  }

  state.elapsedSec += simDt;

  const p2Input = state.mode === 'ai' ? computeAiInput(state, simDt) : p2RawInput;

  updateFighterPreAttack(state.p1, state.p2, p1Input, simDt, events, state.waves);
  updateFighterPreAttack(state.p2, state.p1, p2Input, simDt, events, state.waves);

  integratePhysics(state.p1, simDt);
  integratePhysics(state.p2, simDt);

  // Soft body separation so fighters don't stack identically
  const sepDx = state.p2.x - state.p1.x;
  const sepDy = Math.abs(state.p2.y - state.p1.y);
  if (Math.abs(sepDx) < 42 && sepDy < 64 && state.p1.action !== 'dash' && state.p2.action !== 'dash') {
    const push = (42 - Math.abs(sepDx)) * 0.5;
    const sign = sepDx >= 0 ? 1 : -1;
    state.p1.x = Math.max(54, state.p1.x - sign * push);
    state.p2.x = Math.min(ARENA_WIDTH - 54, state.p2.x + sign * push);
  }

  checkMeleeHits(state, state.p1, state.p2, events);
  checkMeleeHits(state, state.p2, state.p1, events);

  // Update energy waves
  for (const w of state.waves) {
    if (!w.active) continue;
    w.x += w.vx * simDt;
    w.life -= simDt;
    const target = w.ownerSlot === 1 ? state.p2 : state.p1;
    const owner = w.ownerSlot === 1 ? state.p1 : state.p2;
    if (Math.abs(w.x - target.x) < w.radius + 26 && Math.abs(w.y - (target.y - 45)) < 68) {
      w.active = false;
      applyHit(state, owner, target, w.damage, 480, 0.07, true, events);
    } else if (w.life <= 0 || w.x < -50 || w.x > ARENA_WIDTH + 50) {
      w.active = false;
    }
  }
  state.waves = state.waves.filter((w) => w.active);

  // Passive Spirit regeneration so anyone can unleash ultimates regularly
  state.p1.spirit = Math.min(100, state.p1.spirit + simDt * 4.5);
  state.p2.spirit = Math.min(100, state.p2.spirit + simDt * 4.5);

  return events;
}
