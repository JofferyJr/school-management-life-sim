const clamp = value => Math.max(0, Math.min(100, value));
const distance = (a,b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function getStudent(state, id) {
  return state.people.students.find(student => student.id === id) ?? null;
}
function nearbyObjects(state, student) {
  return (state.world.campus.objects ?? []).filter(object => distance(object, student.position) <= 1);
}
function nearbyPeople(state, student) {
  return [...(state.people.students ?? []), ...(state.people.staff ?? [])].filter(person => person.id !== student.id && person.position && distance(person.position, student.position) <= 1);
}
function roomAt(state, student) {
  return (state.world.campus.rooms ?? []).find(room => room.tiles?.some(tile => tile.x === student.position.x && tile.y === student.position.y));
}

export function getAvailableInteractions(state, studentId) {
  const student = getStudent(state, studentId);
  if (!student) return [];
  const objects = nearbyObjects(state, student);
  const people = nearbyPeople(state, student);
  const room = roomAt(state, student);
  const actions = [];
  if (objects.some(o => ['student-seat','staff-seat','bed'].includes(o.type))) actions.push({ id:'sit', label:'Sit / Rest' });
  if (objects.some(o => o.type === 'serving-counter') || ['canteen','dining-hall'].includes(room?.type)) actions.push({ id:'eat', label:'Eat' });
  if (objects.some(o => ['board','teacher-desk'].includes(o.type)) || ['classroom','library','study-room'].includes(room?.type)) actions.push({ id:'study', label:'Study' });
  if (people.length) actions.push({ id:'talk', label:`Talk to ${people[0].name ?? 'nearby person'}` });
  if (objects.length || people.length || room) actions.push({ id:'inspect', label:'Inspect' });
  return actions;
}

export function performInteraction(state, studentId, actionId) {
  const student = getStudent(state, studentId);
  if (!student) return { state, ok:false, message:'Student not found.' };
  const available = getAvailableInteractions(state, studentId);
  if (!available.some(action => action.id === actionId)) return { state, ok:false, message:'That action is not available here.' };
  if (actionId === 'inspect') return { state, ok:true, message:'You take a closer look at the nearby area.' };

  let updated = { ...student, needs:{ ...student.needs } };
  let message = '';
  if (actionId === 'eat') {
    updated.needs.hunger = clamp(updated.needs.hunger + 35);
    updated.needs.mood = clamp(updated.needs.mood + 6);
    updated.currentAction = 'eat';
    message = 'You have something to eat.';
  } else if (actionId === 'sit') {
    updated.needs.energy = clamp(updated.needs.energy + 12);
    updated.needs.stress = clamp(updated.needs.stress - 6);
    updated.currentAction = 'sit';
    message = 'You rest for a while.';
  } else if (actionId === 'study') {
    updated.needs.stress = clamp(updated.needs.stress + 4);
    updated.academicProgress = (updated.academicProgress ?? 0) + 1;
    updated.currentAction = 'study';
    message = 'You spend some time studying.';
  } else if (actionId === 'talk') {
    const target = nearbyPeople(state, student)[0];
    const familiarity = { ...(updated.familiarity ?? {}) };
    familiarity[target.id] = (familiarity[target.id] ?? 0) + 1;
    updated.familiarity = familiarity;
    updated.currentAction = 'talk';
    message = `You talk with ${target.name ?? 'a nearby person'}.`;
  }
  const students = state.people.students.map(item => item.id === studentId ? updated : item);
  return { state:{ ...state, people:{ ...state.people, students } }, ok:true, message };
}
