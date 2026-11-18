import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARENA_WIDTH,
  EMPTY_INPUT,
  GROUND_Y,
  computeAiInput,
  createInitialMatchState,
  stepMatch,
} from './combatEngine';

test('createInitialMatchState spawns fighters inside arena bounds with full HP and no time limit', () => {
  const match = createInitialMatchState('sams', 'zero', 'ai');
  assert.equal(match.p1.hp, 100);
  assert.equal(match.p2.hp, 100);
  assert.equal(match.p1.y, GROUND_Y);
  assert.equal(match.p2.y, GROUND_Y);
  assert.ok(match.p1.x > 0 && match.p1.x < ARENA_WIDTH);
  assert.ok(match.p2.x > 0 && match.p2.x < ARENA_WIDTH);
  assert.equal(match.finished, false);
});

test('stepMatch clamps large dt and moves fighters within arena boundaries', () => {
  const match = createInitialMatchState('kai', 'yuki', 'pvp');
  const startX = match.p1.x;
  stepMatch(match, { ...EMPTY_INPUT, right: true }, EMPTY_INPUT, 5.0);
  // Clamped to max 0.05s step, so movement is bounded
  assert.ok(match.p1.x > startX);
  assert.ok(match.p1.x - startX < 30);

  // Pushing left edge never escapes bounds
  match.p1.x = 55;
  stepMatch(match, { ...EMPTY_INPUT, left: true }, EMPTY_INPUT, 0.05);
  assert.ok(match.p1.x >= 54);
});

test('melee attacks deal damage, trigger hitstop, guard mitigates damage, and KO sets winnerSlot', () => {
  const match = createInitialMatchState('sams', 'zero', 'pvp');
  match.p1.x = 400;
  match.p2.x = 465;

  // Trigger heavy attack on P1
  stepMatch(match, { ...EMPTY_INPUT, heavy: true }, EMPTY_INPUT, 0.016);
  // Advance past 0.26s windup into active frames
  for (let i = 0; i < 18; i++) {
    stepMatch(match, EMPTY_INPUT, EMPTY_INPUT, 0.016);
  }
  assert.ok(match.p2.hp < 100, 'Heavy strike should damage P2');
  assert.ok(match.p1.totalDamageDealt > 0);

  // Test Guard reduces incoming damage
  const guardMatch = createInitialMatchState('sams', 'zero', 'pvp');
  guardMatch.p1.x = 400;
  guardMatch.p2.x = 460;
  stepMatch(guardMatch, { ...EMPTY_INPUT, light: true }, { ...EMPTY_INPUT, guard: true }, 0.016);
  for (let i = 0; i < 8; i++) {
    stepMatch(guardMatch, EMPTY_INPUT, { ...EMPTY_INPUT, guard: true }, 0.016);
  }
  assert.ok(guardMatch.p2.hp >= 97, 'Guarding should mitigate light attack damage');

  // Test KO triggers winnerSlot and finished state
  const koMatch = createInitialMatchState('sams', 'zero', 'pvp');
  koMatch.p2.hp = 5;
  koMatch.p1.x = 400;
  koMatch.p2.x = 450;
  stepMatch(koMatch, { ...EMPTY_INPUT, light: true }, EMPTY_INPUT, 0.016);
  for (let i = 0; i < 45; i++) {
    stepMatch(koMatch, EMPTY_INPUT, EMPTY_INPUT, 0.04);
  }
  assert.equal(koMatch.winnerSlot, 1);
  assert.equal(koMatch.finished, true);
});

test('computeAiInput approaches when far and attacks when close', () => {
  const farMatch = createInitialMatchState('sams', 'zero', 'ai');
  farMatch.p1.x = 150;
  farMatch.p2.x = 750;
  const farDecision = computeAiInput(farMatch, 0.2, 0.5);
  assert.equal(farDecision.left, true);

  const closeMatch = createInitialMatchState('sams', 'zero', 'ai');
  closeMatch.p1.x = 400;
  closeMatch.p2.x = 480;
  const closeDecision = computeAiInput(closeMatch, 0.2, 0.2);
  assert.equal(closeDecision.light, true);
});
