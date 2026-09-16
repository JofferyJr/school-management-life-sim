import { createNewGame } from './core/gameState.js';
import { createEventBus } from './core/eventBus.js';
import { advanceClock, setClockSpeed } from './core/timeSystem.js';
import { applyBuildAction } from './build/buildService.js';
import { placeRoomPreset, refreshRoomStatuses } from './build/roomService.js';
import { createAppShell } from './ui/appShell.js';
import { renderBuildPanel } from './ui/buildPanel.js';
import { renderHud } from './ui/hud.js';
import { createWorldRenderer } from './world/worldRenderer.js';
import { generateStudent, admitStudent, advanceStudentNeeds } from './entities/studentService.js';
import { generateStaffApplicant, hireStaff } from './entities/staffService.js';
import { planEntityRoute, advanceEntityAlongRoute } from './entities/npcMovement.js';
import { getScheduleIntent } from './academics/scheduleSystem.js';
import { renderPeoplePanel } from './ui/peoplePanel.js';
import { renderTimetablePanel } from './ui/timetablePanel.js';
import { createInputController } from './life/inputController.js';
import { getAvailableInteractions, performInteraction } from './life/interactionService.js';
import { applyDailyFinance } from './management/financeService.js';
import { openSaveRepository, pickStartupSlot } from './save/saveRepository.js';
import { exportCharacter, importCharacter } from './save/characterCodec.js';

const root = document.querySelector('#app');
const canvas = document.querySelector('#game-canvas');
const events = createEventBus();
const renderer = createWorldRenderer(canvas);
const camera = { x: 0, y: 0, zoom: 1 };
let state = null;
let accumulatorMs = 0;
let lastFrame = performance.now();
let buildSelection = { kind: 'tool', value: 'floor' };
let activePanel = 'build';
let pendingStudent = null;
let pendingApplicant = null;
let repositoryPromise = null;

const shell = createAppShell(root, {
  onNewGame(config) {
    state = createNewGame(config);
    accumulatorMs = 0;
    buildSelection = { kind: 'tool', value: 'floor' };
    activePanel = 'build';
    pendingStudent = null;
    pendingApplicant = null;
    events.emit('game:new', state);
    shell.showGame(state);
    bindGameToolbar();
    renderGameUi();
  },
  async onLoadGame() {
    try {
      const repository = await getRepository();
      const records = await repository.list();
      let preferred = null;
      try { preferred = localStorage.getItem('school-life:last-slot'); } catch {}
      const slotId = pickStartupSlot(records, preferred);
      if (!slotId) return { message:'No saved school was found in this browser.' };
      const loaded = await repository.load(slotId);
      if (!loaded) return { message:'The selected save is no longer available.' };
      state = loaded;
      accumulatorMs = 0;
      activePanel = 'build';
      pendingStudent = null;
      pendingApplicant = null;
      shell.showGame(state);
      bindGameToolbar();
      await refreshSaveSlots();
      setUiMessage(`Loaded ${slotId.replace('-', ' ')}.`);
      renderGameUi();
      return { ok:true };
    } catch {
      return { message:'Saved school could not be loaded. Your browser storage was not changed.' };
    }
  },
  onExitGame() {
    state = null;
    accumulatorMs = 0;
    pendingStudent = null;
    pendingApplicant = null;
  }
});

function getRepository() {
  repositoryPromise ??= openSaveRepository();
  return repositoryPromise;
}

async function refreshSaveSlots() {
  const select = document.querySelector('#save-slot');
  if (!select) return;
  const chosen = select.value || 'slot-1';
  try {
    const saved = await (await getRepository()).list();
    const byId = new Map(saved.map(item => [item.slotId, item]));
    for (const option of select.options) {
      const record = byId.get(option.value);
      const number = option.value.split('-')[1];
      option.textContent = record ? `Slot ${number} · ${new Date(record.updatedAt).toLocaleString()}` : `Slot ${number} · Empty`;
    }
    select.value = chosen;
  } catch {
    setUiMessage('Local save storage is unavailable.');
    renderGameUi();
  }
}

function downloadCharacter(student) {
  const blob = new Blob([exportCharacter(student)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${student.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-school-life-character.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function bindGameToolbar() {
  const saveButton = document.querySelector('#save-game');
  const loadButton = document.querySelector('#load-game');
  const exportButton = document.querySelector('#export-character');
  const importButton = document.querySelector('#import-character');
  const fileInput = document.querySelector('#character-file');
  if (!saveButton) return;

  saveButton.addEventListener('click', async () => {
    const slotId = document.querySelector('#save-slot').value;
    try {
      await (await getRepository()).save(slotId, state);
      setUiMessage(`Saved to ${slotId.replace('-', ' ')}.`);
      await refreshSaveSlots();
      renderGameUi();
    } catch {
      setUiMessage('Save failed. Your current game is still open.');
      renderGameUi();
    }
  });
  loadButton.addEventListener('click', async () => {
    const slotId = document.querySelector('#save-slot').value;
    try {
      const loaded = await (await getRepository()).load(slotId);
      if (!loaded) { setUiMessage('That save slot is empty.'); return renderGameUi(); }
      state = loaded;
      accumulatorMs = 0;
      shell.showGame(state);
      bindGameToolbar();
      await refreshSaveSlots();
      setUiMessage(`Loaded ${slotId.replace('-', ' ')}.`);
      renderGameUi();
    } catch {
      setUiMessage('Load failed. The current game was not replaced.');
      renderGameUi();
    }
  });
  exportButton.addEventListener('click', () => {
    const student = getActiveStudent();
    if (!student) { setUiMessage('Select or admit a student before exporting.'); return renderGameUi(); }
    downloadCharacter(student);
    setUiMessage('Character exported.');
    renderGameUi();
  });
  importButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const decoded = importCharacter(await file.text());
      if (!decoded.ok) { setUiMessage(`Character import rejected: ${decoded.error}`); return renderGameUi(); }
      const base = generateStudent({ curriculumId:state.school.curriculumId, grade:decoded.character.grade ?? 'Form 1', housingType:decoded.character.housingType ?? 'day' });
      const hydrated = { ...base, ...decoded.character, kind:'student', route:decoded.character.route ?? [] };
      state = admitStudent(state, hydrated);
      setUiMessage(`${hydrated.name} imported and admitted.`);
    } catch (error) {
      setUiMessage(String(error?.message).includes('duplicate-student-id') ? 'Character ID already exists in this save.' : 'Character import failed.');
    } finally {
      fileInput.value = '';
    }
    renderGameUi();
  });
  refreshSaveSlots();
}

function setCampus(map) {
  const rooms = refreshRoomStatuses(map, map.rooms ?? []);
  state = { ...state, world: { ...state.world, campus: { ...map, rooms } } };
}

function replaceStudent(updated) {
  state = { ...state, people: { ...state.people, students: state.people.students.map(student => student.id === updated.id ? updated : student) } };
}

function getActiveStudent() {
  return state?.people.students.find(student => student.id === state.people.activeStudentId) ?? null;
}

function setUiMessage(message) {
  state = { ...state, ui: { ...state.ui, message } };
}

function routeEntity(entity, intent) {
  if (intent.type !== 'move') return { ...entity, route: [], currentAction: intent.reason };
  const planned = planEntityRoute(entity, intent.destination, state.world.campus);
  if (planned.error) return { ...entity, route: [], currentAction: 'idle', routeError: planned.error };
  return advanceEntityAlongRoute({ ...entity, route: planned.route, currentAction: intent.reason }, 1);
}

function simulateMinute() {
  let routeFailed = false;
  const students = state.people.students.map(student => {
    const activeInLife = student.id === state.people.activeStudentId && state.ui.mode === 'life';
    const updated = activeInLife
      ? advanceEntityAlongRoute(student, 1)
      : routeEntity(student, getScheduleIntent(student, state));
    if (updated.routeError) routeFailed = true;
    const { routeError, ...clean } = updated;
    return advanceStudentNeeds(clean, { minutes:1, activity:clean.currentAction ?? 'idle' });
  });
  const staff = state.people.staff.map(person => {
    const updated = routeEntity(person, getScheduleIntent(person, state));
    if (updated.routeError) routeFailed = true;
    const { routeError, ...clean } = updated;
    return clean;
  });
  state = { ...state, people: { ...state.people, students, staff } };
  if (routeFailed) setUiMessage('Destination unreachable');
}

function moveActiveBy(dx, dy, { fast = false } = {}) {
  const student = getActiveStudent();
  if (!student) return;
  const distance = fast ? 2 : 1;
  const destination = { x: student.position.x + dx * distance, y: student.position.y + dy * distance };
  const planned = planEntityRoute(student, destination, state.world.campus);
  if (planned.error) {
    setUiMessage(planned.error === 'restricted' ? 'That area is restricted.' : 'Destination unreachable');
  } else {
    replaceStudent(advanceEntityAlongRoute({ ...student, route: planned.route, currentAction: 'player-move' }, distance));
    setUiMessage('');
  }
  renderGameUi();
}

function routeActiveTo(destination) {
  const student = getActiveStudent();
  if (!student) return;
  const planned = planEntityRoute(student, destination, state.world.campus);
  if (planned.error) {
    setUiMessage(planned.error === 'restricted' ? 'That area is restricted.' : 'Destination unreachable');
  } else {
    replaceStudent({ ...student, route: planned.route, currentAction: 'walking' });
    setUiMessage('');
  }
  renderGameUi();
}

function performActiveInteraction(actionId) {
  const student = getActiveStudent();
  if (!student) return;
  const result = performInteraction(state, student.id, actionId);
  state = result.state;
  setUiMessage(result.message);
  const menu = document.querySelector('#context-menu');
  if (menu) menu.hidden = true;
  renderGameUi();
}

function showContextMenu(screen) {
  const student = getActiveStudent();
  const menu = document.querySelector('#context-menu');
  if (!student || !menu) return;
  const actions = getAvailableInteractions(state, student.id);
  if (!actions.length) { setUiMessage('Nothing nearby to interact with.'); renderGameUi(); return; }
  menu.innerHTML = actions.map(action => `<button data-interaction="${action.id}">${action.label}</button>`).join('');
  menu.style.left = `${Math.min(screen.x, window.innerWidth - 180)}px`;
  menu.style.top = `${Math.min(screen.y, window.innerHeight - 180)}px`;
  menu.hidden = false;
  menu.querySelectorAll('[data-interaction]').forEach(button => button.addEventListener('click', () => performActiveInteraction(button.dataset.interaction)));
}

function renderGameUi() {
  if (!state) return;
  renderHud(document.querySelector('#hud-root'), state, {
    setSpeed(speed) { state = { ...state, clock: setClockSpeed(state.clock, speed) }; renderGameUi(); },
    setMode(mode) {
      if (mode === 'life' && !getActiveStudent()) { setUiMessage('Admit a student before entering Life Sim.'); return renderGameUi(); }
      state = { ...state, ui: { ...state.ui, mode, message: '' } };
      renderGameUi();
    },
    setActiveStudent(id) { state = { ...state, people: { ...state.people, activeStudentId:id } }; renderGameUi(); }
  });

  const sidePanel = document.querySelector('#side-panel');
  const tabs = document.querySelector('#panel-tabs');
  const content = document.querySelector('#panel-content');
  if (sidePanel) sidePanel.hidden = state.ui.mode === 'life';
  if (tabs && content && state.ui.mode === 'management') {
    tabs.innerHTML = `<button data-panel="build" class="${activePanel === 'build' ? 'active' : ''}">Build</button><button data-panel="people" class="${activePanel === 'people' ? 'active' : ''}">People</button><button data-panel="timetable" class="${activePanel === 'timetable' ? 'active' : ''}">Timetable</button>`;
    tabs.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => { activePanel = button.dataset.panel; renderGameUi(); }));
    if (activePanel === 'build') {
      renderBuildPanel(content, state, buildSelection, { select(selection) { buildSelection = selection; renderGameUi(); } });
    } else if (activePanel === 'people') {
      renderPeoplePanel(content, state, { student: pendingStudent, applicant: pendingApplicant }, {
        generateStudent(options) { pendingStudent = generateStudent({ ...options, curriculumId: state.school.curriculumId }); renderGameUi(); },
        admitStudent() {
          if (!pendingStudent) return;
          try { state = admitStudent(state, pendingStudent); pendingStudent = null; setUiMessage('Student admitted.'); }
          catch { setUiMessage('Student could not be admitted.'); }
          renderGameUi();
        },
        generateApplicant(roleId) { pendingApplicant = generateStaffApplicant(roleId); renderGameUi(); },
        hireStaff() {
          if (!pendingApplicant) return;
          const result = hireStaff(state, pendingApplicant);
          if (result.ok) { state = result.state; pendingApplicant = null; setUiMessage('Staff member hired.'); }
          else setUiMessage(result.error === 'insufficient-cash' ? 'Not enough cash to hire this applicant.' : 'Staff could not be hired.');
          renderGameUi();
        }
      });
    } else {
      renderTimetablePanel(content, state, {
        save(periods) { state = { ...state, academics: { ...state.academics, timetable: periods } }; setUiMessage('Timetable updated.'); renderGameUi(); }
      });
    }
  }
  shell.showMessage(state.ui.message);
}

canvas.addEventListener('click', event => {
  if (!state || state.ui.mode !== 'management') return;
  const rect = canvas.getBoundingClientRect();
  const tile = renderer.screenToTile(event.clientX - rect.left, event.clientY - rect.top, camera);
  const map = state.world.campus;
  let result;
  if (buildSelection.kind === 'preset') result = placeRoomPreset(map, map.rooms ?? [], buildSelection.value, tile);
  else if (buildSelection.kind === 'object') result = applyBuildAction(map, { type: 'object', objectType: buildSelection.value, ...tile });
  else result = applyBuildAction(map, { type: buildSelection.value, ...tile });
  if (!result.ok) setUiMessage(result.error === 'out-of-bounds' ? 'Build location is outside the campus.' : 'Build action could not be completed.');
  else { setCampus(result.map); setUiMessage(''); }
  renderGameUi();
});

createInputController(canvas, {
  getMode: () => state?.ui.mode,
  screenToTile: (x,y) => renderer.screenToTile(x,y,camera),
  onStep: moveActiveBy,
  onPathRequest: routeActiveTo,
  onInteract: () => {
    if (!state) return;
    const student = getActiveStudent();
    const actions = student ? getAvailableInteractions(state, student.id) : [];
    if (!actions.length) { setUiMessage('Nothing nearby to interact with.'); renderGameUi(); return; }
    performActiveInteraction(actions[0].id);
  },
  onPause: () => { if (state) { state = { ...state, clock:setClockSpeed(state.clock,0) }; renderGameUi(); } },
  onContext: (_tile, screen) => { if (state) showContextMenu(screen); }
});

function frame(now) {
  const elapsed = Math.min(now - lastFrame, 250);
  lastFrame = now;
  if (state && !state.clock.paused && state.clock.speed > 0) {
    accumulatorMs += elapsed;
    let changed = false;
    while (accumulatorMs >= 1000) {
      accumulatorMs -= 1000;
      const result = advanceClock(state.clock, 1000);
      state = { ...state, clock: result.clock };
      if (result.emitted.includes('minute')) simulateMinute();
      if (result.emitted.includes('day')) state = applyDailyFinance(state);
      for (const eventName of result.emitted) events.emit(`time:${eventName}`, state);
      changed = true;
    }
    if (changed) renderGameUi();
  }
  if (state) renderer.render(state, camera);
  requestAnimationFrame(frame);
}

shell.showTitle();
requestAnimationFrame(frame);
