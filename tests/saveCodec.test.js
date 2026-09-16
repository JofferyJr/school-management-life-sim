import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeSave, decodeSave } from '../src/save/saveCodec.js';

const state = { schemaVersion:1, school:{name:'Test'}, world:{}, people:{}, academics:{}, finance:{}, clock:{}, ui:{} };

test('save round trip preserves versioned state', () => {
  const decoded = decodeSave(encodeSave(state));
  assert.equal(decoded.ok, true);
  assert.deepEqual(decoded.state, state);
});

test('unsupported save version fails without destroying original text', () => {
  const text = JSON.stringify({ schemaVersion:999, school:{} });
  const decoded = decodeSave(text);
  assert.equal(decoded.ok, false);
  assert.equal(decoded.original, text);
});
