import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../src/ui/html.js';

test('escapeHtml neutralizes markup and attribute delimiters from imported text', () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="boom()"> O'Reilly & friends`),
    '&lt;img src=x onerror=&quot;boom()&quot;&gt; O&#39;Reilly &amp; friends'
  );
});

test('escapeHtml handles nullish values without rendering undefined', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
});
