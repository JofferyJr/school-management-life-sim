import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, setClockSpeed } from '../src/core/timeSystem.js';

test('1x advances one game minute per real second', () => {
  const start = { day: 1, minuteOfDay: 420, speed: 1, paused: false };
  const result = advanceClock(start, 1000);
  assert.equal(result.clock.minuteOfDay, 421);
  assert.deepEqual(result.emitted, ['minute']);
});

test('8x advances eight game minutes and rolls day after midnight', () => {
  const start = { day: 1, minuteOfDay: 1438, speed: 8, paused: false };
  const result = advanceClock(start, 1000);
  assert.equal(result.clock.day, 2);
  assert.equal(result.clock.minuteOfDay, 6);
  assert.ok(result.emitted.includes('day'));
});

test('pause does not advance', () => {
  const start = setClockSpeed({ day: 1, minuteOfDay: 420, speed: 1, paused: false }, 0);
  assert.deepEqual(advanceClock(start, 1000).clock, start);
});
