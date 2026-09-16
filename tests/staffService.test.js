import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStaffApplicant, hireStaff } from '../src/entities/staffService.js';

const baseState = {
  people: { students: [], staff: [], activeStudentId: null },
  finance: { cash: 5000, ledger: [] }
};

test('hiring deducts first salary commitment and adds staff', () => {
  const applicant = generateStaffApplicant('teacher', () => 0.2);
  const result = hireStaff(baseState, applicant);
  assert.equal(result.ok, true);
  assert.equal(result.state.people.staff.length, 1);
  assert.ok(result.state.finance.cash < 5000);
});
