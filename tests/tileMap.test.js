import test from 'node:test';
import assert from 'node:assert/strict';
import { createTileMap, getTile, setTile } from '../src/world/tileMap.js';

test('creates walkable 40x30 grass map', () => {
  const map = createTileMap(40, 30);
  assert.equal(map.tiles.length, 1200);
  assert.deepEqual(getTile(map, 0, 0), {
    terrain: 'grass', floor: null, wall: null, objectId: null,
    zone: 'public', blocked: false
  });
});

test('setTile returns updated map without mutating source', () => {
  const original = createTileMap(2, 2);
  const updated = setTile(original, 1, 1, { blocked: true, wall: 'basic-wall' });
  assert.equal(getTile(original, 1, 1).blocked, false);
  assert.equal(getTile(updated, 1, 1).blocked, true);
});
