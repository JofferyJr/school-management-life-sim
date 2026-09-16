import test from 'node:test';
import assert from 'node:assert/strict';
import { ATLAS_PATH, getTileSpriteFrame, getObjectSpriteFrame } from '../src/assets/classroomPack.js';

test('classroom asset atlas uses a GitHub-Pages-safe relative path', () => {
  assert.equal(ATLAS_PATH, './assets/classroom-pack/atlas.png');
});

test('floor, wall and door resolve to distinct atlas frames', () => {
  const floor = getTileSpriteFrame({ floor: 'basic-floor', wall: null });
  const wall = getTileSpriteFrame({ floor: 'basic-floor', wall: 'basic-wall' });
  const door = getTileSpriteFrame({ floor: 'basic-floor', wall: 'door' });
  assert.equal(floor?.id, 'floor');
  assert.equal(wall?.id, 'wall');
  assert.equal(door?.id, 'door');
  assert.notDeepEqual(floor?.source, wall?.source);
  assert.notDeepEqual(wall?.source, door?.source);
});

test('supported furniture maps to asset frames while unknown objects fall back', () => {
  for (const type of ['teacher-desk', 'student-seat', 'board', 'staff-seat', 'toilet-fixture', 'serving-counter']) {
    assert.equal(getObjectSpriteFrame(type)?.id, type);
  }
  assert.equal(getObjectSpriteFrame('bed'), null);
  assert.equal(getObjectSpriteFrame('unknown-object'), null);
});
