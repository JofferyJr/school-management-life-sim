import { findPath } from '../world/pathfinding.js';
import { getTile } from '../world/tileMap.js';

export function canEntityEnterTile(entity, tile) {
  if (!tile || tile.blocked) return false;
  if (tile.zone === 'restricted') return entity.access?.includes('restricted') ?? false;
  if (entity.kind === 'staff') return ['public','academic','sports','staff-only','dormitory'].includes(tile.zone);
  if (entity.kind === 'student') {
    if (tile.zone === 'dormitory') return entity.housingType === 'boarding';
    return ['public','academic','sports'].includes(tile.zone);
  }
  return tile.zone === 'public';
}

export function planEntityRoute(entity, destination, map) {
  const destinationTile = getTile(map, destination.x, destination.y);
  if (!destinationTile || destinationTile.blocked) return { error:'unreachable' };
  if (!canEntityEnterTile(entity, destinationTile)) return { error:'restricted' };
  const route = findPath(map, entity.position, destination, tile => canEntityEnterTile(entity, tile));
  if (!route) return { error:'unreachable' };
  return { route };
}

export function advanceEntityAlongRoute(entity, deltaMinutes) {
  const route = [...(entity.route ?? [])];
  const moveSpeed = entity.moveSpeed ?? 1;
  let steps = Math.max(0, Math.floor(deltaMinutes * moveSpeed));
  let position = { ...entity.position };
  while (steps > 0 && route.length) {
    position = route.shift();
    steps -= 1;
  }
  return {
    ...entity,
    position,
    route,
    currentAction: route.length ? 'moving' : (entity.currentAction === 'moving' ? 'idle' : entity.currentAction)
  };
}
