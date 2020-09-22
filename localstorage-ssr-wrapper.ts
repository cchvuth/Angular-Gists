import { parseJSONStr } from './parse-json-str';

const isAvailable = typeof window != 'undefined';

function storageGet(key: string, fallback: any = null, validator?: (val) => boolean) {
  return isAvailable ? parseJSONStr(localStorage.getItem(key), fallback, validator) : fallback;
}

function storageStore(key, value) {
  if (isAvailable) {
    try {
      return localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      throw new Error(`Storage cannot store ${key}`);
    }
  }
}

function storageRemove(key) {
  if (isAvailable) {
    return localStorage.removeItem(key);
  }
}

function storageClear() {
  if (isAvailable) {
    return localStorage.clear();
  }
}

export { storageGet, storageStore, storageRemove, storageClear };
