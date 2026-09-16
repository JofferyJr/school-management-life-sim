import { encodeSave, decodeSave } from './saveCodec.js';

const DB_NAME = 'school-life-sim';
const DB_VERSION = 1;
const STORE = 'saves';

export function pickStartupSlot(records, preferredSlot) {
  if (preferredSlot && records.some(record => record.slotId === preferredSlot)) return preferredSlot;
  return records[0]?.slotId ?? null;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('IndexedDB is not available in this browser'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath:'slotId' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open save database'));
  });
}

export async function openSaveRepository() {
  const db = await openDatabase();
  const storeFor = mode => db.transaction(STORE, mode).objectStore(STORE);
  return {
    async save(slotId, state) {
      const record = { slotId, updatedAt:new Date().toISOString(), schemaVersion:state.schemaVersion, payload:encodeSave(state) };
      await requestToPromise(storeFor('readwrite').put(record));
      try { localStorage.setItem('school-life:last-slot', slotId); } catch {}
      return record;
    },
    async load(slotId) {
      const record = await requestToPromise(storeFor('readonly').get(slotId));
      if (!record) return null;
      const decoded = decodeSave(record.payload);
      if (!decoded.ok) throw new Error(`Save could not be loaded: ${decoded.error}`);
      return decoded.state;
    },
    async list() {
      const records = await requestToPromise(storeFor('readonly').getAll());
      return records.sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).map(({ payload, ...meta }) => meta);
    },
    async remove(slotId) {
      await requestToPromise(storeFor('readwrite').delete(slotId));
    }
  };
}
