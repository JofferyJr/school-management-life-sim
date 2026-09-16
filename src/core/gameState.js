import { getCurriculum } from '../data/curricula.js';
import { createTileMap } from '../world/tileMap.js';
import { createDefaultTimetable } from '../academics/timetable.js';

const REQUIRED_TEXT_FIELDS = ['schoolName', 'schoolType', 'ownership', 'curriculumId', 'startingLocation', 'difficulty'];

export function validateNewGameConfig(config = {}) {
  const errors = [];
  for (const field of REQUIRED_TEXT_FIELDS) {
    if (typeof config[field] !== 'string' || config[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  }
  if (config.curriculumId && !getCurriculum(config.curriculumId)) {
    errors.push(`Unknown curriculum: ${config.curriculumId}`);
  }
  return { ok: errors.length === 0, errors };
}

export function createNewGame(config) {
  const validation = validateNewGameConfig(config);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const curriculum = getCurriculum(config.curriculumId);

  return {
    schemaVersion: 1,
    school: {
      id: crypto.randomUUID(),
      name: config.schoolName.trim(),
      schoolType: config.schoolType,
      ownership: config.ownership,
      curriculumId: config.curriculumId,
      startingLocation: config.startingLocation,
      difficulty: config.difficulty
    },
    world: { campus: createTileMap(40, 30) },
    people: { students: [], staff: [], activeStudentId: null },
    academics: { timetable: createDefaultTimetable(curriculum) },
    finance: { cash: 100000, ledger: [] },
    clock: { day: 1, minuteOfDay: 420, speed: 1, paused: false },
    ui: { mode: 'management', message: '' }
  };
}
