import { pickName } from '../data/names.js';

const TRAITS = ['Friendly','Ambitious','Shy','Creative','Curious','Competitive','Calm','Organized'];
const INTERESTS = ['Science','Music','Sports','Art','Reading','Gaming','Robotics','Drama'];
const AMBITIONS = ['Doctor','Engineer','Teacher','Designer','Athlete','Researcher','Entrepreneur','Artist'];

function pick(list, rng) { return list[Math.floor(rng() * list.length) % list.length]; }
function score(rng, min = 45, max = 85) { return Math.round(min + rng() * (max - min)); }

export function generateStudent(options = {}, rng = Math.random) {
  const housingType = options.housingType ?? 'day';
  if (!['day','boarding'].includes(housingType)) throw new RangeError('housingType must be day or boarding');
  const age = Number.isFinite(options.age) ? options.age : 13;
  const year = 2026 - age;
  return {
    id: crypto.randomUUID(),
    kind: 'student',
    name: options.name || pickName(rng),
    birthDate: options.birthDate || `${year}-01-15`,
    age,
    grade: options.grade || 'Form 1',
    curriculumId: options.curriculumId || 'malaysia',
    housingType,
    position: options.position || { x: 2, y: 2 },
    needs: { energy: score(rng,70,95), hunger: score(rng,65,95), health: score(rng,75,100), stress: score(rng,10,35), hygiene: score(rng,70,95), sleep: score(rng,70,95), fitness: score(rng,40,80), mood: score(rng,60,90) },
    traits: [...new Set([pick(TRAITS,rng), pick(TRAITS,rng)])],
    personality: { confidence:score(rng), discipline:score(rng), sociability:score(rng), empathy:score(rng), stressTolerance:score(rng), curiosity:score(rng) },
    interests: [...new Set([pick(INTERESTS,rng), pick(INTERESTS,rng)])],
    strengths: [pick(['Mathematics','Science','Languages','Arts','Sports'],rng)],
    weaknesses: [pick(['Mathematics','Science','Languages','Arts','Sports'],rng)],
    ambition: pick(AMBITIONS,rng),
    attendance: 100,
    results: {},
    promotionStatus: 'enrolled',
    graduationStatus: 'not-graduated',
    memories: [],
    familiarity: {},
    academicProgress: 0,
    currentAction: 'idle',
    route: []
  };
}

export function admitStudent(state, student) {
  if (state.people.students.some(existing => existing.id === student.id)) throw new Error('duplicate-student-id');
  const students = [...state.people.students, student];
  return {
    ...state,
    people: {
      ...state.people,
      students,
      activeStudentId: state.people.activeStudentId ?? student.id
    }
  };
}

const clampNeed = value => Math.max(0, Math.min(100, value));

export function advanceStudentNeeds(student, context = {}) {
  const minutes = Math.max(0, context.minutes ?? 0);
  const activity = context.activity ?? 'idle';
  const rates = {
    energy: -0.06,
    hunger: -0.05,
    health: 0,
    stress: activity === 'class' || activity === 'study' ? 0.035 : -0.008,
    hygiene: -0.015,
    sleep: -0.025,
    fitness: activity === 'sports' ? 0.025 : -0.003,
    mood: -0.006
  };
  if (activity === 'sit' || activity === 'rest') {
    rates.energy = 0.07;
    rates.stress = -0.045;
    rates.mood = 0.02;
  }
  if (activity === 'eat') {
    rates.hunger = 0.6;
    rates.mood = 0.05;
  }
  const needs = Object.fromEntries(Object.entries(student.needs).map(([key, value]) => [key, clampNeed(value + (rates[key] ?? 0) * minutes)]));
  if (needs.hunger < 25 || needs.energy < 20) needs.mood = clampNeed(needs.mood - 0.05 * minutes);
  return { ...student, needs };
}
