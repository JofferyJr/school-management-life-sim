import { getRoomDefinition } from '../data/roomDefinitions.js';
import { getTile, isInBounds, setTile } from '../world/tileMap.js';

function pointInRoom(room, x, y) {
  return room.tiles.some(tile => tile.x === x && tile.y === y);
}

export function validateRoom(room, map, objects = map.objects ?? []) {
  const definition = getRoomDefinition(room.type);
  if (!definition) return { status: 'incomplete', missing: ['unknown-room-type'] };
  const missing = [];

  for (const requirement of definition.requirements) {
    if (requirement === 'door') {
      const hasDoor = room.tiles.some(({ x, y }) => getTile(map, x, y)?.wall === 'door');
      if (!hasDoor) missing.push('door');
      continue;
    }
    const hasObject = objects.some(object => object.type === requirement && pointInRoom(room, object.x, object.y));
    if (!hasObject) missing.push(requirement);
  }

  return { status: missing.length ? 'incomplete' : 'functional', missing };
}

export function refreshRoomStatuses(map, rooms = map.rooms ?? []) {
  return rooms.map(room => ({ ...room, ...validateRoom(room, map, map.objects ?? []) }));
}

export function placeRoomPreset(map, rooms, roomType, origin) {
  const definition = getRoomDefinition(roomType);
  if (!definition) return { ok: false, error: 'unknown-room-type', map, rooms, roomId: null };
  const [width, height] = definition.size;
  const tiles = [];
  for (let dy = 0; dy < height; dy += 1) {
    for (let dx = 0; dx < width; dx += 1) {
      const x = origin.x + dx;
      const y = origin.y + dy;
      if (!isInBounds(map, x, y)) return { ok: false, error: 'out-of-bounds', map, rooms, roomId: null };
      tiles.push({ x, y });
    }
  }

  const roomId = crypto.randomUUID();
  let nextMap = map;
  for (const { x, y } of tiles) {
    const dx = x - origin.x;
    const dy = y - origin.y;
    const perimeter = dx === 0 || dy === 0 || dx === width - 1 || dy === height - 1;
    nextMap = setTile(nextMap, x, y, {
      floor: roomType === 'sports-field' ? null : 'basic-floor',
      zone: definition.zone,
      wall: perimeter && roomType !== 'sports-field' ? 'basic-wall' : null,
      blocked: perimeter && roomType !== 'sports-field'
    });
  }
  if (roomType !== 'sports-field') {
    const doorX = origin.x + Math.floor(width / 2);
    const doorY = origin.y + height - 1;
    nextMap = setTile(nextMap, doorX, doorY, { wall: 'door', blocked: false });
  }
  const draft = { id: roomId, type: roomType, tiles, zone: definition.zone };
  const status = validateRoom(draft, nextMap, nextMap.objects ?? []);
  const nextRooms = [...rooms, { ...draft, ...status }];
  nextMap = { ...nextMap, rooms: nextRooms };
  return { ok: true, map: nextMap, rooms: nextRooms, roomId };
}
