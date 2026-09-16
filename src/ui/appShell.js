import { escapeHtml } from './html.js';
import { renderNewGameScreen } from './newGameScreen.js';

export function createAppShell(root, { onNewGame, onLoadGame, onExitGame }) {
  const canvas = document.querySelector('#game-canvas');
  let currentState = null;

  return {
    showTitle() {
      currentState = null;
      canvas.hidden = true;
      renderNewGameScreen(root, { onCreate: onNewGame, onLoad: onLoadGame });
    },
    showGame(state) {
      currentState = state;
      root.innerHTML = `
        <main class="game-shell">
          <header class="game-topbar">
            <div class="school-title"><strong>${escapeHtml(state.school.name)}</strong><span>${escapeHtml(state.school.schoolType)} · ${escapeHtml(state.school.ownership)}</span></div>
            <div id="hud-root" class="hud-root"></div>
            <div class="save-toolbar" id="save-toolbar">
              <select id="save-slot" aria-label="Save slot"><option value="slot-1">Slot 1</option><option value="slot-2">Slot 2</option><option value="slot-3">Slot 3</option></select>
              <button class="mini-btn" id="save-game">Save</button><button class="mini-btn" id="load-game">Load</button>
              <button class="mini-btn" id="export-character">Export</button><button class="mini-btn" id="import-character">Import</button>
              <input id="character-file" type="file" accept="application/json,.json" hidden>
            </div>
            <button class="secondary-btn" id="back-to-title">New School</button>
          </header>
          <section class="game-stage"><div class="canvas-host">Campus simulation ready.</div><aside id="side-panel" class="side-panel"><nav id="panel-tabs" class="panel-tabs"></nav><div id="panel-content"></div></aside><div id="context-menu" class="context-menu" hidden></div><div id="game-message" class="game-message" hidden></div></section>
        </main>`;
      canvas.hidden = false;
      root.querySelector('#back-to-title').addEventListener('click', () => {
        onExitGame?.();
        this.showTitle();
      });
    },
    showMessage(text) {
      if (!currentState) return;
      const el = root.querySelector('#game-message');
      if (!el) return;
      el.textContent = text;
      el.hidden = !text;
    }
  };
}
