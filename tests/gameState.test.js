import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, validateNewGameConfig } from '../src/core/gameState.js';

test('valid new game creates a versioned 40x30 campus state', () => {
  const config = {
    schoolName: 'Senai Academy',
    schoolType: 'secondary',
    ownership: 'public',
    curriculumId: 'malaysia',
    startingLocation: 'small-town',
    difficulty: 'normal'
  };

  assert.deepEqual(validateNewGameConfig(config), { ok: true, errors: [] });
  const state = createNewGame(config);
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.school.name, 'Senai Academy');
  assert.equal(state.school.curriculumId, 'malaysia');
  assert.equal(state.world.campus.width, 40);
  assert.equal(state.world.campus.height, 30);
  assert.deepEqual(state.people.students, []);
  assert.deepEqual(state.people.staff, []);
});

test('missing curriculum blocks new game creation', () => {
  const result = validateNewGameConfig({
    schoolName: 'Broken School',
    schoolType: 'secondary',
    ownership: 'public',
    curriculumId: 'missing',
    startingLocation: 'small-town',
    difficulty: 'normal'
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /curriculum/i);
});
