const ALLOWED_SPEEDS = new Set([0, 1, 2, 4, 8]);

export function setClockSpeed(clock, speed) {
  if (!ALLOWED_SPEEDS.has(speed)) throw new RangeError(`Unsupported clock speed: ${speed}`);
  return { ...clock, speed, paused: speed === 0 };
}

export function advanceClock(clock, realDeltaMs) {
  if (clock.paused || clock.speed === 0 || realDeltaMs <= 0) {
    return { clock: { ...clock }, emitted: [] };
  }

  const deltaMinutes = Math.floor((realDeltaMs / 1000) * clock.speed);
  if (deltaMinutes <= 0) return { clock: { ...clock }, emitted: [] };

  const totalMinutes = clock.minuteOfDay + deltaMinutes;
  const daysAdvanced = Math.floor(totalMinutes / 1440);
  const nextDay = clock.day + daysAdvanced;
  const nextClock = {
    ...clock,
    day: nextDay,
    minuteOfDay: totalMinutes % 1440,
    paused: false
  };
  const emitted = ['minute'];
  if (daysAdvanced > 0) {
    emitted.push('day');
    if (Math.floor((nextDay - 1) / 7) > Math.floor((clock.day - 1) / 7)) emitted.push('week');
  }
  return { clock: nextClock, emitted };
}

export function formatTime(minuteOfDay) {
  const hours = Math.floor(minuteOfDay / 60) % 24;
  const minutes = Math.floor(minuteOfDay % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
