export const ATLAS_PATH = './assets/classroom-pack/atlas.png';

const frame = (id, x, y) => Object.freeze({ id, source: Object.freeze([x, y, 128, 128]) });

export const CLASSROOM_PACK_FRAMES = Object.freeze({
  floor: frame('floor', 0, 0),
  wall: frame('wall', 128, 0),
  door: frame('door', 256, 0),
  board: frame('board', 0, 128),
  'teacher-desk': frame('teacher-desk', 128, 128),
  'student-seat': frame('student-seat', 256, 128),
  'staff-seat': frame('staff-seat', 0, 256),
  'serving-counter': frame('serving-counter', 128, 256),
  'toilet-fixture': frame('toilet-fixture', 256, 256)
});

export function getTileSpriteFrame(tile) {
  if (!tile) return null;
  if (tile.wall === 'door') return CLASSROOM_PACK_FRAMES.door;
  if (tile.wall === 'basic-wall') return CLASSROOM_PACK_FRAMES.wall;
  if (tile.floor === 'basic-floor') return CLASSROOM_PACK_FRAMES.floor;
  return null;
}

export function getObjectSpriteFrame(objectType) {
  return CLASSROOM_PACK_FRAMES[objectType] ?? null;
}
