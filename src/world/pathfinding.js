import { getTile, isInBounds } from './tileMap.js';

const DIRECTIONS = [
  { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
];
const keyOf = ({ x, y }) => `${x},${y}`;
const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function findPath(map, start, goal, canEnter = (tile) => !tile.blocked) {
  if (!isInBounds(map, start.x, start.y) || !isInBounds(map, goal.x, goal.y)) return null;
  const goalTile = getTile(map, goal.x, goal.y);
  if (!goalTile || goalTile.blocked || !canEnter(goalTile, goal)) return null;
  if (start.x === goal.x && start.y === goal.y) return [];

  const open = [{ ...start, g: 0, f: distance(start, goal) }];
  const bestG = new Map([[keyOf(start), 0]]);
  const cameFrom = new Map();

  while (open.length) {
    open.sort((a, b) => a.f - b.f || a.g - b.g);
    const current = open.shift();
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let cursor = { x: goal.x, y: goal.y };
      while (!(cursor.x === start.x && cursor.y === start.y)) {
        path.push(cursor);
        cursor = cameFrom.get(keyOf(cursor));
      }
      return path.reverse();
    }

    for (const dir of DIRECTIONS) {
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      if (!isInBounds(map, next.x, next.y)) continue;
      const tile = getTile(map, next.x, next.y);
      if (!tile || tile.blocked || !canEnter(tile, next)) continue;
      const tentativeG = current.g + 1;
      const nextKey = keyOf(next);
      if (tentativeG >= (bestG.get(nextKey) ?? Infinity)) continue;
      bestG.set(nextKey, tentativeG);
      cameFrom.set(nextKey, { x: current.x, y: current.y });
      open.push({ ...next, g: tentativeG, f: tentativeG + distance(next, goal) });
    }
  }
  return null;
}
