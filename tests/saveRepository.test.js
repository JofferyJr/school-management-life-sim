import test from 'node:test';
import assert from 'node:assert/strict';
import { pickStartupSlot } from '../src/save/saveRepository.js';

test('pickStartupSlot prefers the remembered slot when it still exists', () => {
  const records = [{ slotId:'slot-2' }, { slotId:'slot-1' }];
  assert.equal(pickStartupSlot(records, 'slot-1'), 'slot-1');
});

test('pickStartupSlot falls back to the newest listed save', () => {
  const records = [{ slotId:'slot-3' }, { slotId:'slot-1' }];
  assert.equal(pickStartupSlot(records, 'slot-2'), 'slot-3');
  assert.equal(pickStartupSlot([], 'slot-1'), null);
});
