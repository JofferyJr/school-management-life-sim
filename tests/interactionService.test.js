import test from 'node:test';
import assert from 'node:assert/strict';
import { getAvailableInteractions, performInteraction } from '../src/life/interactionService.js';

const student = { id:'u1', kind:'student', position:{x:1,y:1}, needs:{ energy:60,hunger:40,health:90,stress:20,hygiene:80,sleep:80,fitness:50,mood:60 }, familiarity:{}, academicProgress:0 };
const state = {
  people:{ students:[student], staff:[], activeStudentId:'u1' },
  world:{ campus:{ objects:[{id:'food',type:'serving-counter',x:2,y:1}], rooms:[] } }
};

test('nearby serving counter exposes eat interaction', () => {
  assert.ok(getAvailableInteractions(state, 'u1').some(action => action.id === 'eat'));
});

test('eat interaction restores hunger without exceeding 100', () => {
  const result = performInteraction(state, 'u1', 'eat');
  assert.equal(result.ok, true);
  assert.ok(result.state.people.students[0].needs.hunger > 40);
  assert.ok(result.state.people.students[0].needs.hunger <= 100);
});
