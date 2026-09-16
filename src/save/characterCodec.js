const FORMAT = 'school-life-character';
const VERSION = 1;

export function exportCharacter(student) {
  return JSON.stringify({ format:FORMAT, version:VERSION, ...student }, null, 2);
}

export function importCharacter(text) {
  try {
    const character = JSON.parse(text);
    if (character?.format !== FORMAT) return { ok:false, error:'unsupported-character-format' };
    if (character?.version !== VERSION) return { ok:false, error:'unsupported-character-version' };
    for (const key of ['id','name','birthDate']) {
      if (typeof character[key] !== 'string' || character[key].trim() === '') return { ok:false, error:`missing-character-field:${key}` };
    }
    const { format, version, ...student } = character;
    return { ok:true, character:student };
  } catch {
    return { ok:false, error:'invalid-character-json' };
  }
}
