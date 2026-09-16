import test from 'node:test';
import assert from 'node:assert/strict';
import { createTileMap, setTile } from '../src/world/tileMap.js';
import { canEntityEnterTile, planEntityRoute, advanceEntityAlongRoute } from '../src/entities/npcMovement.js';

test('student cannot enter staff-only tile', () => {
  const tile = { zone:'staff-only', blocked:false };
  assert.equal(canEntityEnterTile({ kind:'student', housingType:'day' }, tile), false);
});

test('staff can route through staff-only but not blocked tiles', () => {
  let map = createTileMap(3, 1);
  map = setTile(map, 1, 0, { zone:'staff-only' });
  const result = planEntityRoute({ kind:'staff', position:{x:0,y:0} }, {x:2,y:0}, map);
  assert.ok(Array.isArray(result.route));
});

test('unreachable route returns readable error', () => {
  let map = createTileMap(2, 1);
  map = setTile(map, 1, 0, { blocked:true });
  assert.deepEqual(planEntityRoute({ kind:'student', position:{x:0,y:0} }, {x:1,y:0}, map), { error:'unreachable' });
});

test('route advancement consumes one tile per in-game minute', () => {
  const entity = { position:{x:0,y:0}, route:[{x:1,y:0},{x:2,y:0}], moveSpeed:1 };
  const next = advanceEntityAlongRoute(entity, 1);
  assert.deepEqual(next.position, {x:1,y:0});
  assert.deepEqual(next.route, [{x:2,y:0}]);
});
