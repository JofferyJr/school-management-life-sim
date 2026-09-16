import test from 'node:test';
import assert from 'node:assert/strict';
import { getScheduleIntent } from '../src/academics/scheduleSystem.js';

const entity = { id:'st1', kind:'student', housingType:'day', position:{x:0,y:0} };
const period = { id:'p1', label:'Math', startMinute:480, endMinute:540, activity:'class', roomType:'classroom' };

test('student in class period moves toward a functional classroom', () => {
  const state = {
    clock:{ minuteOfDay:500 },
    academics:{ timetable:[period] },
    world:{ campus:{ width:10, height:10, rooms:[{ id:'r1', type:'classroom', status:'functional', tiles:[{x:5,y:5},{x:6,y:5}] }] } }
  };
  const intent = getScheduleIntent(entity, state);
  assert.equal(intent.type, 'move');
  assert.deepEqual(intent.destination, {x:5,y:5});
  assert.equal(intent.reason, 'class');
});

test('student idles when no matching functional room exists', () => {
  const state = {
    clock:{ minuteOfDay:500 },
    academics:{ timetable:[period] },
    world:{ campus:{ width:10, height:10, rooms:[{ id:'r1', type:'classroom', status:'incomplete', tiles:[{x:5,y:5}] }] } }
  };
  assert.deepEqual(getScheduleIntent(entity, state), { type:'idle', reason:'no-functional-room' });
});

import { createTileMap, setTile } from '../src/world/tileMap.js';

test('schedule destination chooses a walkable room tile when the first room tile is blocked', () => {
  let campus = createTileMap(8, 8);
  campus = setTile(campus, 5, 5, { blocked:true, wall:'basic-wall' });
  campus.rooms = [{ id:'r1', type:'classroom', status:'functional', tiles:[{x:5,y:5},{x:6,y:5}] }];
  const state = { clock:{ minuteOfDay:500 }, academics:{ timetable:[period] }, world:{ campus } };
  assert.deepEqual(getScheduleIntent(entity, state).destination, {x:6,y:5});
});
