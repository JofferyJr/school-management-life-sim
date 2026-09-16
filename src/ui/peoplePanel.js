import { escapeHtml } from './html.js';
import { getCurriculum } from '../data/curricula.js';
import { STAFF_ROLES, V01_HIREABLE_ROLE_IDS } from '../data/staffRoles.js';

export function renderPeoplePanel(container, state, pending, actions) {
  if (!container) return;
  const curriculum = getCurriculum(state.school.curriculumId);
  const grades = curriculum?.gradeLevels ?? ['Level 1'];
  const students = state.people.students;
  const staff = state.people.staff;
  container.innerHTML = `
    <div class="panel-heading"><div><span class="panel-kicker">Management</span><h2>People</h2></div><span class="panel-count">${students.length + staff.length} people</span></div>
    <section class="panel-section"><h3>Student Admission</h3>
      <div class="inline-fields"><select id="student-grade">${grades.map(g => `<option>${escapeHtml(g)}</option>`).join('')}</select><select id="student-housing"><option value="day">Day Student</option><option value="boarding">Boarding</option></select></div>
      <div class="action-row"><button class="tool-btn wide" id="generate-student">Generate</button><button class="tool-btn wide primary-small" id="admit-student" ${pending.student ? '' : 'disabled'}>Admit</button></div>
      ${pending.student ? `<div class="candidate-card"><strong>${escapeHtml(pending.student.name)}</strong><span>${escapeHtml(pending.student.grade)} · ${escapeHtml(pending.student.housingType)}</span><small>${escapeHtml(pending.student.traits.join(' · '))} · ${escapeHtml(pending.student.ambition)}</small></div>` : ''}
    </section>
    <section class="panel-section"><h3>Staff Recruitment</h3>
      <select id="staff-role">${V01_HIREABLE_ROLE_IDS.map(id => `<option value="${id}">${STAFF_ROLES[id].label}</option>`).join('')}</select>
      <div class="action-row"><button class="tool-btn wide" id="generate-staff">Applicant</button><button class="tool-btn wide primary-small" id="hire-staff" ${pending.applicant ? '' : 'disabled'}>Hire</button></div>
      ${pending.applicant ? `<div class="candidate-card"><strong>${escapeHtml(pending.applicant.name)}</strong><span>${STAFF_ROLES[pending.applicant.roleId]?.label ?? pending.applicant.roleId}</span><small>${pending.applicant.experience} yrs exp · $${pending.applicant.salary.toLocaleString()}/mo</small></div>` : ''}
    </section>
    <section class="panel-section"><h3>Enrolled</h3><div class="people-list">
      ${students.slice(-5).reverse().map(s => `<div><strong>${escapeHtml(s.name)}</strong><span>${escapeHtml(s.grade)} · ${escapeHtml(s.housingType)}</span></div>`).join('') || '<p class="panel-empty">No students yet.</p>'}
    </div></section>
    <section class="panel-section"><h3>Hired Staff</h3><div class="people-list">
      ${staff.slice(-5).reverse().map(s => `<div><strong>${escapeHtml(s.name)}</strong><span>${STAFF_ROLES[s.roleId]?.label ?? s.roleId}</span></div>`).join('') || '<p class="panel-empty">No staff yet.</p>'}
    </div></section>`;

  container.querySelector('#generate-student').addEventListener('click', () => actions.generateStudent({ grade: container.querySelector('#student-grade').value, housingType: container.querySelector('#student-housing').value }));
  container.querySelector('#admit-student').addEventListener('click', () => actions.admitStudent());
  container.querySelector('#generate-staff').addEventListener('click', () => actions.generateApplicant(container.querySelector('#staff-role').value));
  container.querySelector('#hire-staff').addEventListener('click', () => actions.hireStaff());
}
