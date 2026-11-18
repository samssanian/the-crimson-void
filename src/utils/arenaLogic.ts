export interface ArenaMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
  source: 'contact' | 'seed';
}

export interface ContactValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    email?: string;
    message?: string;
  };
}

export interface BattleClashResult {
  winner: string;
  loser: string;
  clashSummary: string;
  damageDealt: number;
  criticalHit: boolean;
}

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export const ADMIN_PASSCODE = '866461';
export const FLOWER_GRID_SIZE = 20;
export const REQUIRED_ROSE_COUNT = 3;
export const MAX_ADMIN_AUTH_ATTEMPTS = 3;
export const ADMIN_LOCKOUT_SECONDS = 10;

export type FlowerSpecies =
  | 'rose'
  | 'sunflower'
  | 'tulip'
  | 'cherry'
  | 'daisy'
  | 'lotus'
  | 'hibiscus';

export interface FlowerTile {
  id: string;
  species: FlowerSpecies;
  variant: number;
}

const BASE_FLOWER_SPECIES_POOL: readonly FlowerSpecies[] = [
  'rose',
  'rose',
  'rose',
  'sunflower',
  'sunflower',
  'sunflower',
  'tulip',
  'tulip',
  'tulip',
  'cherry',
  'cherry',
  'cherry',
  'daisy',
  'daisy',
  'daisy',
  'lotus',
  'lotus',
  'lotus',
  'hibiscus',
  'hibiscus',
];

export function generateFlowerVerificationGrid(rng: () => number = Math.random): FlowerTile[] {
  const pool: FlowerTile[] = BASE_FLOWER_SPECIES_POOL.map((species, idx) => ({
    id: `flower-${idx}-${species}`,
    species,
    variant: idx % 3,
  }));

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.max(0, Math.min(0.999999, rng())) * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  return pool;
}

export function verifyRoseSelection(
  tiles: FlowerTile[],
  selectedIds: string[]
): { verified: boolean; reason?: string } {
  const uniqueIds = Array.from(new Set(selectedIds));
  if (uniqueIds.length !== REQUIRED_ROSE_COUNT) {
    return {
      verified: false,
      reason: `Select exactly ${REQUIRED_ROSE_COUNT} roses (${uniqueIds.length} selected).`,
    };
  }

  const tileById = new Map(tiles.map((t) => [t.id, t]));
  const allRoses = uniqueIds.every((id) => tileById.get(id)?.species === 'rose');

  if (!allRoses) {
    return {
      verified: false,
      reason: 'Floral verification failed. Only the 3 roses unlock the seal.',
    };
  }

  return { verified: true };
}

export function validateContactForm(
  name: string,
  email: string,
  message: string
): ContactValidationResult {
  const errors: ContactValidationResult['errors'] = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Warrior name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Enter a valid frequency email address.';
  }

  if (trimmedMessage.length < 5) {
    errors.message = 'Whisper must be at least 5 characters long.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function verifyAdminPasscode(input: string): boolean {
  return input.trim() === ADMIN_PASSCODE;
}

export function createArenaMessage(
  name: string,
  email: string,
  message: string,
  now = new Date()
): ArenaMessage {
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: now.toISOString(),
    read: false,
    source: 'contact',
  };
}

export function getUnreadCount(messages: ArenaMessage[]): number {
  return messages.filter((m) => !m.read).length;
}

export function resolveBattleClash(
  fighterA: string,
  fighterB: string,
  powerA: number,
  powerB: number,
  roll = Math.random()
): BattleClashResult {
  const clampedRoll = Math.max(0, Math.min(0.9999, roll));
  const totalPower = Math.max(1, powerA + powerB);
  const thresholdA = powerA / totalPower;
  const aWins = clampedRoll < thresholdA;
  const winner = aWins ? fighterA : fighterB;
  const loser = aWins ? fighterB : fighterA;
  const criticalHit = clampedRoll > 0.72 || clampedRoll < 0.22;
  const damageDealt = Math.round(4200 + clampedRoll * 5800);

  return {
    winner,
    loser,
    damageDealt,
    criticalHit,
    clashSummary: criticalHit
      ? `CRITICAL OVERDRIVE! ${winner} breaks through ${loser}'s guard for ${damageDealt.toLocaleString()} void damage!`
      : `${winner} claims dimensional priority over ${loser} (${damageDealt.toLocaleString()} impact).`,
  };
}

export function advanceKonamiSequence(history: string[], rawKey: string): {
  nextHistory: string[];
  matched: boolean;
} {
  const normalized = rawKey.length === 1 ? rawKey.toLowerCase() : rawKey;
  const nextHistory = [...history, normalized].slice(-KONAMI_SEQUENCE.length);
  const matched =
    nextHistory.length === KONAMI_SEQUENCE.length &&
    KONAMI_SEQUENCE.every((expected, idx) => nextHistory[idx] === expected);
  return { nextHistory: matched ? [] : nextHistory, matched };
}

export function checkTripleKeyPress(
  key: string,
  targetKey: string,
  prevCount: number,
  prevTimestamp: number,
  nowMs: number,
  windowMs = Infinity
): { count: number; timestamp: number; triggered: boolean } {
  if (key.toLowerCase() !== targetKey.toLowerCase()) {
    return { count: 0, timestamp: prevTimestamp, triggered: false };
  }
  const withinWindow = !Number.isFinite(windowMs) || nowMs - prevTimestamp <= windowMs;
  const nextCount = withinWindow ? prevCount + 1 : 1;
  if (nextCount >= 3) {
    return { count: 0, timestamp: nowMs, triggered: true };
  }
  return { count: nextCount, timestamp: nowMs, triggered: false };
}

export const INITIAL_SEED_MESSAGES: ArenaMessage[] = [
  {
    id: 'seed-1',
    name: 'Kai Takeda',
    email: 'kai@thunder-dojo.jp',
    message: 'Guardian Sams — the Void Council locked the upper gate. Meet me before Yuki freezes the eastern ring.',
    createdAt: '2026-11-18T01:30:00.000Z',
    read: false,
    source: 'seed',
  },
  {
    id: 'seed-2',
    name: 'Akane Hoshino',
    email: 'akane@crimson-lily.org',
    message: 'Zero was spotted near the Rift Core. Keep your blade drawn.',
    createdAt: '2026-11-18T00:45:00.000Z',
    read: true,
    source: 'seed',
  },
];
