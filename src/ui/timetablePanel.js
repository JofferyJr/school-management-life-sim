import { escapeHtml } from './html.js';
import { validateTimetable } from '../academics/timetable.js';
import { ROOM_DEFINITIONS } from '../data/roomDefinitions.js';

function toTime(minute) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function fromTime(text) {
  const [h,m] = text.split(':').map(Number);
  return h * 60 + m;
}

export function renderTimetablePanel(container, state, actions) {
  if (!container) return;
  const periods = state.academics.timetable ?? [];
  container.innerHTML = `
    <div class="panel-heading"><div><span class="panel-kicker">Academics</span><h2>Timetable</h2></div><span class="panel-count">${periods.length} periods</span></div>
    <form id="timetable-form" class="timetable-list">
      ${periods.map((p,i) => `<div class="period-card" data-index="${i}">
        <input class="period-label" name="label" value="${escapeHtml(p.label)}">
        <div class="period-times"><input type="time" name="start" value="${toTime(p.startMinute)}"><span>→</span><input type="time" name="end" value="${toTime(p.endMinute)}"></div>
        <div class="period-meta"><select name="activity">${['arrival','assembly','class','recess','lunch','club','after-school'].map(v => `<option value="${v}" ${p.activity===v?'selected':''}>${v}</option>`).join('')}</select><select name="roomType"><option value="">No room</option>${Object.keys(ROOM_DEFINITIONS).map(v => `<option value="${v}" ${p.roomType===v?'selected':''}>${ROOM_DEFINITIONS[v].label}</option>`).join('')}</select></div>
      </div>`).join('')}
      <button class="primary-btn" type="submit">Save Timetable</button>
      <div id="timetable-errors" class="error-box" hidden></div>
    </form>`;

  container.querySelector('#timetable-form').addEventListener('submit', event => {
    event.preventDefault();
    const next = [...container.querySelectorAll('.period-card')].map((card, i) => ({
      id: periods[i]?.id ?? `p${i+1}`,
      label: card.querySelector('[name="label"]').value.trim() || `Period ${i+1}`,
      startMinute: fromTime(card.querySelector('[name="start"]').value),
      endMinute: fromTime(card.querySelector('[name="end"]').value),
      activity: card.querySelector('[name="activity"]').value,
      ...(card.querySelector('[name="roomType"]').value ? { roomType: card.querySelector('[name="roomType"]').value } : {})
    }));
    const validation = validateTimetable(next);
    const errorBox = container.querySelector('#timetable-errors');
    if (!validation.ok) {
      errorBox.hidden = false;
      errorBox.textContent = validation.errors.join(' · ');
      return;
    }
    errorBox.hidden = true;
    actions.save(next);
  });
}
