import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContactForm,
  formatCountdown,
  verifyAdminPasscode,
  generateFlowerVerificationGrid,
  verifyRoseSelection,
  FLOWER_GRID_SIZE,
  REQUIRED_ROSE_COUNT,
  createArenaMessage,
  getUnreadCount,
  resolveBattleClash,
  advanceKonamiSequence,
  checkTripleKeyPress,
  KONAMI_SEQUENCE,
} from './arenaLogic';

test('validateContactForm rejects empty or invalid inputs and accepts valid data', () => {
  const invalid = validateContactForm('A', 'bad-email', 'hi');
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.message);

  const valid = validateContactForm('Sams Warrior', 'warrior@void.jp', 'Hold the line at Neo-Kyoto!');
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('formatCountdown pads minutes and seconds and clamps negatives', () => {
  assert.equal(formatCountdown(265), '04:25');
  assert.equal(formatCountdown(5), '00:05');
  assert.equal(formatCountdown(-10), '00:00');
});

test('verifyAdminPasscode validates 866461 only and rejects old or invalid passcodes', () => {
  assert.equal(verifyAdminPasscode('866461'), true);
  assert.equal(verifyAdminPasscode(' 866461 '), true);
  assert.equal(verifyAdminPasscode('admin123'), false);
  assert.equal(verifyAdminPasscode('wrongpass'), false);
});

test('generateFlowerVerificationGrid builds 20 flowers with exactly 3 roses and verifyRoseSelection enforces 3 roses', () => {
  const grid = generateFlowerVerificationGrid(() => 0.42);
  assert.equal(grid.length, FLOWER_GRID_SIZE);
  const roses = grid.filter((tile) => tile.species === 'rose');
  const nonRoses = grid.filter((tile) => tile.species !== 'rose');
  assert.equal(roses.length, REQUIRED_ROSE_COUNT);
  assert.equal(nonRoses.length, 17);

  // Too few selected
  const tooFew = verifyRoseSelection(grid, [roses[0].id, roses[1].id]);
  assert.equal(tooFew.verified, false);

  // Mixed rose + non-rose fails
  const mixed = verifyRoseSelection(grid, [roses[0].id, roses[1].id, nonRoses[0].id]);
  assert.equal(mixed.verified, false);

  // 4 selected fails even if 3 are roses
  const tooMany = verifyRoseSelection(grid, [roses[0].id, roses[1].id, roses[2].id, nonRoses[0].id]);
  assert.equal(tooMany.verified, false);

  // Exact 3 roses succeeds
  const exactRoses = verifyRoseSelection(grid, roses.map((r) => r.id));
  assert.equal(exactRoses.verified, true);
});

test('createArenaMessage and getUnreadCount track unread state', () => {
  const m1 = createArenaMessage('Yuki', 'yuki@snowfall.jp', 'Frost veil ready.', new Date('2026-11-18T00:00:00Z'));
  const m2 = { ...createArenaMessage('Raijin', 'raijin@iron.jp', 'Guard set.'), read: true };
  assert.equal(m1.read, false);
  assert.equal(m1.source, 'contact');
  assert.equal(getUnreadCount([m1, m2]), 1);
});

test('resolveBattleClash determines winner deterministically based on roll', () => {
  const resA = resolveBattleClash('Sams', 'Zero', 90, 10, 0.1);
  assert.equal(resA.winner, 'Sams');
  assert.equal(resA.criticalHit, true);

  const resB = resolveBattleClash('Sams', 'Zero', 50, 50, 0.8);
  assert.equal(resB.winner, 'Zero');
  assert.equal(resB.criticalHit, true);
});

test('advanceKonamiSequence matches full Konami sequence', () => {
  let history: string[] = [];
  let matched = false;
  for (let i = 0; i < KONAMI_SEQUENCE.length; i++) {
    const res = advanceKonamiSequence(history, KONAMI_SEQUENCE[i]);
    history = res.nextHistory;
    matched = res.matched;
    if (i < KONAMI_SEQUENCE.length - 1) {
      assert.equal(matched, false);
    }
  }
  assert.equal(matched, true);
  assert.deepEqual(history, []);
});

test('checkTripleKeyPress triggers Ultra Instinct on 3 K presses with no time limit', () => {
  const s1 = checkTripleKeyPress('k', 'k', 0, 0, 1000);
  assert.equal(s1.count, 1);
  assert.equal(s1.triggered, false);

  const s2 = checkTripleKeyPress('K', 'k', s1.count, s1.timestamp, 60000);
  assert.equal(s2.count, 2);
  assert.equal(s2.triggered, false);

  const s3 = checkTripleKeyPress('k', 'k', s2.count, s2.timestamp, 120000);
  assert.equal(s3.triggered, true);
  assert.equal(s3.count, 0);
});
