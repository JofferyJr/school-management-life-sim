export function validateTimetable(periods = []) {
  const errors = [];
  const sorted = [...periods].sort((a, b) => a.startMinute - b.startMinute);
  for (const period of sorted) {
    if (!Number.isFinite(period.startMinute) || !Number.isFinite(period.endMinute) || period.startMinute < 0 || period.endMinute > 1440 || period.startMinute >= period.endMinute) {
      errors.push(`Invalid time range for ${period.label || period.id}`);
    }
  }
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].startMinute < sorted[i - 1].endMinute) {
      errors.push(`${sorted[i].label || sorted[i].id} overlaps ${sorted[i - 1].label || sorted[i - 1].id}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function getCurrentPeriod(periods = [], minuteOfDay) {
  return periods.find(period => minuteOfDay >= period.startMinute && minuteOfDay < period.endMinute) ?? null;
}

export function createDefaultTimetable(curriculum) {
  const start = curriculum?.defaultSchoolDay?.startMinute ?? 480;
  const subjects = curriculum?.requiredSubjects?.length ? curriculum.requiredSubjects : ['General Studies'];
  let cursor = start;
  let id = 0;
  const add = (label, duration, activity, roomType) => {
    const period = { id:`p${++id}`, label, startMinute:cursor, endMinute:cursor + duration, activity };
    if (roomType) period.roomType = roomType;
    cursor += duration;
    return period;
  };
  return [
    add('Arrival', 30, 'arrival'),
    add('Assembly', 20, 'assembly', 'hall'),
    add(subjects[0], 60, 'class', 'classroom'),
    add(subjects[1] ?? subjects[0], 60, 'class', 'classroom'),
    add('Recess', 30, 'recess', 'canteen'),
    add(subjects[2] ?? subjects[0], 60, 'class', 'classroom'),
    add('Lunch', 40, 'lunch', 'canteen'),
    add(subjects[3] ?? subjects[0], 60, 'class', 'classroom'),
    add('Clubs & Sports', 90, 'club', 'club-room'),
    add('After School', 90, 'after-school')
  ];
}
