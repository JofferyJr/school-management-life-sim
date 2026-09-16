import test from 'node:test';
import assert from 'node:assert/strict';
import { createTileMap, setTile } from '../src/world/tileMap.js';
import { validateRoom } from '../src/build/roomService.js';

test('classroom is incomplete without door, teacher desk, student seats, and board', () => {
  const map = createTileMap(6, 6);
  const room = { id: 'r1', type: 'classroom', tiles: [{x:1,y:1},{x:2,y:1}] };
  const result = validateRoom(room, map, []);
  assert.equal(result.status, 'incomplete');
  assert.deepEqual(result.missing.sort(), ['board', 'door', 'student-seat', 'teacher-desk'].sort());
});

test('classroom becomes functional when requirements are present', () => {
  let map = createTileMap(6, 6);
  map = setTile(map, 1, 1, { wall: 'door', blocked: false });
  const room = { id: 'r1', type: 'classroom', tiles: [{x:1,y:1},{x:2,y:1}] };
  const objects = [
    { type: 'teacher-desk', x: 1, y: 1 },
    { type: 'student-seat', x: 2, y: 1 },
    { type: 'board', x: 2, y: 1 }
  ];
  assert.equal(validateRoom(room, map, objects).status, 'functional');
});
