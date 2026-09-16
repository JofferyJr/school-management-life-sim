import { listCurricula } from '../data/curricula.js';
import { validateNewGameConfig } from '../core/gameState.js';

const SCHOOL_TYPES = [
  ['primary', 'Primary School'],
  ['secondary', 'Secondary School'],
  ['combined', 'Combined School'],
  ['boarding', 'Boarding School'],
  ['vocational', 'Vocational / Technical'],
  ['pre-university', 'Pre-University / College Prep']
];
const OWNERSHIP = [['public','Public / Government'],['private','Private'],['international','International'],['independent','Independent / Custom']];

function options(entries) {
  return entries.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
}

export function renderTitleActions({ canLoad = false } = {}) {
  return canLoad ? '<button class="secondary-btn" id="load-saved-game" type="button">Continue saved school</button>' : '';
}

export function renderNewGameScreen(container, { onCreate, onLoad }) {
  container.innerHTML = `
    <main class="title-screen">
      <section class="hero-card">
        <div>
          <div class="brand-kicker">School management × life simulation</div>
          <h1>Campus Life Architect</h1>
          <p class="lead">Build a school from the ground up, hire the people who make it run, shape student development, then step into the campus and live one student's day yourself.</p>
          <div class="feature-pills"><span>Hybrid building</span><span>Living students</span><span>Staff management</span><span>Life Sim controls</span><span>Expandable town</span></div>
        </div>
        <form class="new-game-form" id="new-game-form">
          <h2>Create a school</h2>
          <div id="new-game-errors" hidden></div>
          <div class="form-grid">
            <div class="field full"><label for="school-name">School name</label><input id="school-name" name="schoolName" value="Senai Academy" maxlength="60" required></div>
            <div class="field"><label for="school-type">School type</label><select id="school-type" name="schoolType">${options(SCHOOL_TYPES)}</select></div>
            <div class="field"><label for="ownership">Ownership</label><select id="ownership" name="ownership">${options(OWNERSHIP)}</select></div>
            <div class="field"><label for="curriculum">Curriculum</label><select id="curriculum" name="curriculumId">${options(listCurricula().map(c => [c.id, c.label]))}</select></div>
            <div class="field"><label for="location">Starting location</label><select id="location" name="startingLocation"><option value="small-town">Small Town</option></select></div>
            <div class="field full"><label for="difficulty">Difficulty</label><select id="difficulty" name="difficulty"><option value="relaxed">Relaxed</option><option value="normal" selected>Normal</option><option value="challenging">Challenging</option></select></div>
          </div>
          <div class="title-actions"><button class="primary-btn" type="submit">Open the gates</button>${renderTitleActions({ canLoad: typeof onLoad === 'function' })}</div>
          <div id="title-message" class="error-box" hidden></div>
        </form>
      </section>
    </main>`;

  const form = container.querySelector('#new-game-form');
  const errorBox = container.querySelector('#new-game-errors');
  const loadButton = container.querySelector('#load-saved-game');
  if (loadButton) {
    loadButton.addEventListener('click', async () => {
      loadButton.disabled = true;
      const message = container.querySelector('#title-message');
      try {
        const result = await onLoad();
        if (result?.message && message) {
          message.hidden = false;
          message.textContent = result.message;
        }
      } finally {
        loadButton.disabled = false;
      }
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const config = Object.fromEntries(new FormData(form).entries());
    const result = validateNewGameConfig(config);
    if (!result.ok) {
      errorBox.hidden = false;
      errorBox.className = 'error-box';
      errorBox.textContent = result.errors.join(' · ');
      return;
    }
    errorBox.hidden = true;
    onCreate(config);
  });
}
