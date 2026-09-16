import { ROOM_DEFINITIONS } from '../data/roomDefinitions.js';

const TOOLS = [
  ['floor', 'Floor'], ['wall', 'Wall'], ['door', 'Door'], ['path', 'Path'], ['erase', 'Erase']
];
const OBJECTS = [
  ['teacher-desk', 'Teacher Desk'], ['student-seat', 'Student Seat'], ['board', 'Board'],
  ['staff-seat', 'Staff Seat'], ['toilet-fixture', 'Toilet'], ['serving-counter', 'Serving Counter'], ['bed', 'Bed']
];
const PRESETS = ['classroom', 'staff-room', 'toilet', 'canteen', 'dorm-room'];

function selectedClass(selection, kind, value) {
  return selection.kind === kind && selection.value === value ? 'selected' : '';
}

export function renderBuildPanel(container, state, selection, actions) {
  if (!container) return;
  const rooms = state.world.campus.rooms ?? [];
  container.innerHTML = `
    <div class="panel-heading"><div><span class="panel-kicker">Management</span><h2>Build Campus</h2></div><span class="panel-count">${rooms.length} rooms</span></div>
    <section class="panel-section"><h3>Free Build</h3><div class="tool-grid">
      ${TOOLS.map(([id,label]) => `<button class="tool-btn ${selectedClass(selection,'tool',id)}" data-build-tool="${id}">${label}</button>`).join('')}
    </div></section>
    <section class="panel-section"><h3>Room Presets</h3><div class="preset-list">
      ${PRESETS.map(id => `<button class="tool-btn wide ${selectedClass(selection,'preset',id)}" data-room-preset="${id}">${ROOM_DEFINITIONS[id].label}</button>`).join('')}
    </div></section>
    <section class="panel-section"><h3>Furniture</h3><div class="tool-grid compact">
      ${OBJECTS.map(([id,label]) => `<button class="tool-btn ${selectedClass(selection,'object',id)}" data-object-tool="${id}">${label}</button>`).join('')}
    </div></section>
    <section class="panel-section room-status"><h3>Room Status</h3>
      ${rooms.length ? rooms.slice(-6).reverse().map(room => `<div class="status-row ${room.status}"><strong>${ROOM_DEFINITIONS[room.type]?.label ?? room.type}</strong><span>${room.status === 'functional' ? 'Functional' : `Incomplete: ${room.missing.join(', ')}`}</span></div>`).join('') : '<p class="panel-empty">Place a room preset to begin.</p>'}
    </section>`;

  container.querySelectorAll('[data-build-tool]').forEach(button => button.addEventListener('click', () => actions.select({ kind:'tool', value:button.dataset.buildTool })));
  container.querySelectorAll('[data-room-preset]').forEach(button => button.addEventListener('click', () => actions.select({ kind:'preset', value:button.dataset.roomPreset })));
  container.querySelectorAll('[data-object-tool]').forEach(button => button.addEventListener('click', () => actions.select({ kind:'object', value:button.dataset.objectTool })));
}
