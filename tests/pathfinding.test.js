import test from 'node:test';
import assert from 'node:assert/strict';
import { createTileMap, setTile } from '../src/world/tileMap.js';
import { findPath } from '../src/world/pathfinding.js';

test('finds a route around blocked tiles', () => {
  let map = createTileMap(5, 5);
  map = setTile(map, 1, 0, { blocked: true });
  map = setTile(map, 1, 1, { blocked: true });
  const path = findPath(map, { x: 0, y: 0 }, { x: 2, y: 0 });
  assert.deepEqual(path.at(-1), { x: 2, y: 0 });
  assert.ok(path.length > 2);
});

test('returns null for unreachable destination', () => {
  let map = createTileMap(3, 3);
  map = setTile(map, 1, 0, { blocked: true });
  map = setTile(map, 0, 1, { blocked: true });
  assert.equal(findPath(map, { x: 0, y: 0 }, { x: 2, y: 2 }), null);
});
