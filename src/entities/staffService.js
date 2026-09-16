import { pickName } from '../data/names.js';
import { getStaffRole } from '../data/staffRoles.js';

function score(rng, min = 45, max = 85) { return Math.round(min + rng() * (max - min)); }

export function generateStaffApplicant(roleId, rng = Math.random) {
  const role = getStaffRole(roleId);
  if (!role) throw new RangeError(`Unknown staff role: ${roleId}`);
  const experience = Math.floor(rng() * 16);
  return {
    id: crypto.randomUUID(),
    kind: 'staff',
    name: pickName(rng),
    roleId,
    salary: Math.round(role.baseSalary * (1 + experience * 0.015)),
    experience,
    qualifications: experience > 8 ? ['Degree','Senior Certification'] : ['Degree'],
    stats: {
      teaching: score(rng), subjectKnowledge: score(rng), classroomManagement: score(rng),
      patience: score(rng), communication: score(rng), mentoring: score(rng)
    },
    energy: score(rng,70,95),
    stress: score(rng,10,30),
    jobSatisfaction: score(rng,60,90),
    position: { x: 3, y: 3 },
    route: []
  };
}

export function hireStaff(state, applicant) {
  if (state.people.staff.some(existing => existing.id === applicant.id)) return { state, ok:false, error:'duplicate-staff-id' };
  const onboardingCost = applicant.salary;
  if (state.finance.cash < onboardingCost) return { state, ok:false, error:'insufficient-cash' };
  const ledgerEntry = {
    id: crypto.randomUUID(), day: state.clock?.day ?? 1, category:'staff-onboarding',
    amount: -onboardingCost, description: `Hired ${applicant.name}`
  };
  return {
    ok: true,
    state: {
      ...state,
      people: { ...state.people, staff: [...state.people.staff, applicant] },
      finance: { ...state.finance, cash: state.finance.cash - onboardingCost, ledger: [...state.finance.ledger, ledgerEntry] }
    }
  };
}
