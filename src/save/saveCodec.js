const REQUIRED_ROOT_KEYS = ['school','world','people','academics','finance','clock','ui'];
const migrations = new Map();

export function encodeSave(state) {
  return JSON.stringify(state);
}

export function decodeSave(text) {
  try {
    let state = JSON.parse(text);
    if (!Number.isInteger(state?.schemaVersion)) return { ok:false, error:'missing-schema-version', original:text };
    if (state.schemaVersion > 1) return { ok:false, error:'unsupported-save-version', original:text };
    while (state.schemaVersion < 1) {
      const migrate = migrations.get(state.schemaVersion);
      if (!migrate) return { ok:false, error:'save-migration-failed', original:text };
      state = migrate(state);
    }
    const missing = REQUIRED_ROOT_KEYS.filter(key => !(key in state));
    if (missing.length) return { ok:false, error:`missing-root-keys:${missing.join(',')}`, original:text };
    return { ok:true, state };
  } catch {
    return { ok:false, error:'invalid-save-json', original:text };
  }
}

export { migrations };
