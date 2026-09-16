import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStudent, advanceStudentNeeds } from '../src/entities/studentService.js';

test('generated student is version-ready and has valid housing/needs', () => {
  const student = generateStudent({ curriculumId: 'malaysia', grade: 'Form 1', housingType: 'boarding' }, () => 0.25);
  assert.ok(student.id);
  assert.equal(student.housingType, 'boarding');
  assert.equal(student.curriculumId, 'malaysia');
  assert.ok(student.needs.energy >= 0 && student.needs.energy <= 100);
  assert.ok(Array.isArray(student.traits));
  assert.ok(Array.isArray(student.memories));
});


test('one active hour lowers energy and hunger safely within 0..100', () => {
  const student = {
    needs: { energy:80, hunger:80, health:90, stress:20, hygiene:80, sleep:80, fitness:50, mood:70 }
  };
  const updated = advanceStudentNeeds(student, { minutes:60, activity:'class' });
  assert.ok(updated.needs.energy < 80);
  assert.ok(updated.needs.hunger < 80);
  assert.ok(Object.values(updated.needs).every(v => v >= 0 && v <= 100));
});
