import { getTile, isInBounds, setTile } from '../world/tileMap.js';

export function applyBuildAction(map, action) {
  const { x, y } = action;
  if (!isInBounds(map, x, y)) return { ok: false, error: 'out-of-bounds', map };
  let nextMap = map;
  switch (action.type) {
    case 'floor': nextMap = setTile(map, x, y, { floor: 'basic-floor' }); break;
    case 'wall': nextMap = setTile(map, x, y, { wall: 'basic-wall', blocked: true }); break;
    case 'door': nextMap = setTile(map, x, y, { wall: 'door', blocked: false }); break;
    case 'fence': nextMap = setTile(map, x, y, { wall: 'fence', blocked: true }); break;
    case 'path': nextMap = setTile(map, x, y, { floor: 'path', blocked: false }); break;
    case 'erase': {
      const tile = getTile(map, x, y);
      const objects = (map.objects ?? []).filter(object => object.id !== tile.objectId);
      nextMap = setTile({ ...map, objects }, x, y, { floor: null, wall: null, objectId: null, blocked: false });
      break;
    }
    case 'object': {
      const object = { id: crypto.randomUUID(), type: action.objectType, x, y };
      const objects = [...(map.objects ?? []), object];
      nextMap = setTile({ ...map, objects }, x, y, { objectId: object.id, blocked: false });
      break;
    }
    default: return { ok: false, error: 'unknown-build-action', map };
  }
  return { ok: true, map: nextMap };
}
