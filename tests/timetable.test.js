import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentPeriod, validateTimetable } from '../src/academics/timetable.js';

const periods = [
  { id:'p1', label:'Math', startMinute:480, endMinute:540, activity:'class', roomType:'classroom' },
  { id:'p2', label:'Recess', startMinute:540, endMinute:570, activity:'recess', roomType:'canteen' }
];

test('finds active period', () => {
  assert.equal(getCurrentPeriod(periods, 500).id, 'p1');
  assert.equal(getCurrentPeriod(periods, 550).id, 'p2');
});

test('rejects overlapping periods', () => {
  const invalid = [...periods, { id:'p3', label:'Overlap', startMinute:530, endMinute:560, activity:'class' }];
  assert.equal(validateTimetable(invalid).ok, false);
});
