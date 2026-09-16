import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTitleActions } from '../src/ui/newGameScreen.js';

test('title actions include a load control when loading is available', () => {
  const html = renderTitleActions({ canLoad: true });
  assert.match(html, /id="load-saved-game"/);
  assert.match(html, /Continue saved school/);
});

test('title actions omit load control when loading is unavailable', () => {
  const html = renderTitleActions({ canLoad: false });
  assert.doesNotMatch(html, /id="load-saved-game"/);
});
