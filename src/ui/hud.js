import { escapeHtml } from './html.js';
import { formatTime } from '../core/timeSystem.js';
import { getCurrentPeriod } from '../academics/timetable.js';

function meter(label, value) {
  const safe = Math.round(Math.max(0, Math.min(100, value ?? 0)));
  return `<div class="need-row"><span>${label}</span><div class="need-track"><i style="width:${safe}%"></i></div><b>${safe}</b></div>`;
}

export function renderHud(container, state, actions) {
  if (!container || !state) return;
  const speeds = [0, 1, 2, 4, 8];
  const students = state.people.students ?? [];
  const active = students.find(student => student.id === state.people.activeStudentId) ?? null;
  const period = getCurrentPeriod(state.academics.timetable ?? [], state.clock.minuteOfDay);
  container.innerHTML = `
    <div class="hud-summary">
      <span class="hud-chip">Day ${state.clock.day}</span>
      <strong class="hud-time">${formatTime(state.clock.minuteOfDay)}</strong>
      <span class="hud-money">$${Math.round(state.finance.cash).toLocaleString()}</span>
    </div>
    <div class="mode-controls">
      <button type="button" data-mode="management" class="mode-btn ${state.ui.mode === 'management' ? 'active' : ''}">Manage</button>
      <button type="button" data-mode="life" class="mode-btn ${state.ui.mode === 'life' ? 'active' : ''}" ${students.length ? '' : 'disabled'}>Life Sim</button>
    </div>
    <select class="student-picker" aria-label="Active student" ${students.length ? '' : 'disabled'}>
      ${students.length ? students.map(student => `<option value="${escapeHtml(student.id)}" ${student.id === state.people.activeStudentId ? 'selected' : ''}>${escapeHtml(student.name)}</option>`).join('') : '<option>No students</option>'}
    </select>
    <div class="speed-controls" aria-label="Simulation speed">
      ${speeds.map(speed => `<button type="button" class="speed-btn ${state.clock.speed === speed ? 'active' : ''}" data-speed="${speed}">${speed === 0 ? 'Pause' : `${speed}×`}</button>`).join('')}
    </div>
    ${active ? `<section class="active-status">
      <div class="active-status-head"><div><strong>${escapeHtml(active.name)}</strong><span>${escapeHtml(active.grade)} · ${escapeHtml(active.housingType)}</span></div><small>${escapeHtml(period?.label ?? 'Free time')} · ${escapeHtml(active.currentAction ?? 'idle')}</small></div>
      ${meter('Energy',active.needs.energy)}${meter('Hunger',active.needs.hunger)}${meter('Stress',active.needs.stress)}${meter('Mood',active.needs.mood)}
    </section>` : ''}
    ${state.ui.mode === 'management' ? `<section class="finance-mini"><div class="finance-mini-head"><strong>Finance</strong><span>$${Math.round(state.finance.cash).toLocaleString()}</span></div>${(state.finance.ledger ?? []).slice(-5).reverse().map(tx => `<div class="finance-line"><span>${escapeHtml(tx.description)}</span><b class="${tx.amount >= 0 ? 'positive' : 'negative'}">${tx.amount >= 0 ? '+' : '-'}$${Math.abs(tx.amount).toFixed(0)}</b></div>`).join('') || '<small>No transactions yet.</small>'}</section>` : ''}`;

  container.querySelectorAll('[data-speed]').forEach(button => button.addEventListener('click', () => actions.setSpeed(Number(button.dataset.speed))));
  container.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => actions.setMode(button.dataset.mode)));
  const picker = container.querySelector('.student-picker');
  if (students.length) picker.addEventListener('change', () => actions.setActiveStudent(picker.value));
}
