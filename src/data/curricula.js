const CURRICULA = {
  malaysia: {
    id: 'malaysia',
    label: 'Malaysia',
    gradeLevels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'],
    requiredSubjects: ['Bahasa Melayu', 'English', 'Mathematics', 'Science', 'History'],
    defaultSchoolDay: { startMinute: 420, endMinute: 960 }
  },
  uk: {
    id: 'uk',
    label: 'UK-style',
    gradeLevels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'],
    requiredSubjects: ['English', 'Mathematics', 'Science'],
    defaultSchoolDay: { startMinute: 510, endMinute: 930 }
  },
  us: {
    id: 'us',
    label: 'US-style',
    gradeLevels: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    requiredSubjects: ['English Language Arts', 'Mathematics', 'Science', 'Social Studies'],
    defaultSchoolDay: { startMinute: 480, endMinute: 900 }
  },
  japan: {
    id: 'japan',
    label: 'Japan-style',
    gradeLevels: ['Elementary 1', 'Elementary 2', 'Elementary 3', 'Elementary 4', 'Elementary 5', 'Elementary 6', 'Junior High 1', 'Junior High 2', 'Junior High 3', 'Senior High 1', 'Senior High 2', 'Senior High 3'],
    requiredSubjects: ['Japanese', 'Mathematics', 'Science', 'Social Studies'],
    defaultSchoolDay: { startMinute: 480, endMinute: 960 }
  },
  custom: {
    id: 'custom',
    label: 'Custom / Fictional',
    gradeLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'],
    requiredSubjects: ['Language', 'Mathematics', 'Science'],
    defaultSchoolDay: { startMinute: 480, endMinute: 960 }
  }
};

export function getCurriculum(id) {
  return CURRICULA[id] ?? null;
}

export function listCurricula() {
  return Object.values(CURRICULA);
}
