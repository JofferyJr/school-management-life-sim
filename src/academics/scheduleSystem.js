import { getCurrentPeriod } from './timetable.js';
import { getTile } from '../world/tileMap.js';

const ACTIVITY_ROOMS = {
  class: 'classroom',
  recess: 'canteen',
  lunch: 'canteen',
  club: 'club-room',
  assembly: 'hall'
};

function findFunctionalRoom(state, type) {
  return (state.world?.campus?.rooms ?? []).find(room => room.type === type && room.status === 'functional' && room.tiles?.length);
}

function roomDestination(state, room) {
  const campus = state.world?.campus;
  if (!Array.isArray(campus?.tiles)) return { ...room.tiles[0] };
  return { ...(room.tiles.find(({ x, y }) => !getTile(campus, x, y)?.blocked) ?? room.tiles[0]) };
}

export function getScheduleIntent(entity, state) {
  const period = getCurrentPeriod(state.academics?.timetable ?? [], state.clock?.minuteOfDay ?? 0);
  const campus = state.world?.campus;
  if (!campus || !period) return { type:'idle', reason:'no-active-period' };

  if (period.activity === 'arrival') {
    return { type:'move', destination:{ x:0, y:Math.floor(campus.height / 2) }, reason:'arrival' };
  }
  if (period.activity === 'after-school') {
    if (entity.kind === 'student' && entity.housingType === 'boarding') {
      const dorm = findFunctionalRoom(state, 'dorm-room') ?? findFunctionalRoom(state, 'canteen');
      if (!dorm) return { type:'idle', reason:'no-functional-room' };
      return { type:'move', destination:roomDestination(state, dorm), reason:'boarding-after-school' };
    }
    return { type:'move', destination:{ x:0, y:Math.floor(campus.height / 2) }, reason:'after-school' };
  }

  const roomType = period.roomType ?? ACTIVITY_ROOMS[period.activity];
  if (!roomType) return { type:'idle', reason:period.activity || 'idle' };
  const room = findFunctionalRoom(state, roomType);
  if (!room) return { type:'idle', reason:'no-functional-room' };
  return { type:'move', destination:roomDestination(state, room), reason:period.activity };
}
