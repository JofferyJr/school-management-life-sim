import test from 'node:test';
import assert from 'node:assert/strict';
import { exportCharacter, importCharacter } from '../src/save/characterCodec.js';

test('exports and imports supported character format', () => {
  const student = { id:'u1', name:'Alicia Tan', birthDate:'2011-04-18', traits:[], interests:[], strengths:[], weaknesses:[], ambition:'' };
  const result = importCharacter(exportCharacter(student));
  assert.equal(result.ok, true);
  assert.equal(result.character.id, 'u1');
});

test('rejects malformed or unsupported character files safely', () => {
  assert.equal(importCharacter('{bad').ok, false);
  assert.equal(importCharacter(JSON.stringify({ format:'other', version:1 })).ok, false);
});
