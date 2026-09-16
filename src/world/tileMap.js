const BASE_TILE = Object.freeze({
  terrain: 'grass',
  floor: null,
  wall: null,
  objectId: null,
  zone: 'public',
  blocked: false
});

export function createTileMap(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError('Map dimensions must be positive integers');
  }
  return {
    width,
    height,
    tiles: Array.from({ length: width * height }, () => ({ ...BASE_TILE })),
    rooms: [],
    objects: []
  };
}

export function isInBounds(map, x, y) {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < map.width && y < map.height;
}

export function getTile(map, x, y) {
  if (!isInBounds(map, x, y)) return null;
  return map.tiles[y * map.width + x];
}

export function setTile(map, x, y, patch) {
  if (!isInBounds(map, x, y)) return map;
  const index = y * map.width + x;
  const tiles = map.tiles.slice();
  tiles[index] = { ...tiles[index], ...patch };
  return { ...map, tiles };
}
