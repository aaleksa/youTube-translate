import { userScopedStorageKey } from './v2/userStorage';

export function resolveAiCacheKey(logicalKey: string): string {
  return userScopedStorageKey(logicalKey);
}

export function getAiCacheRaw(logicalKey: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(resolveAiCacheKey(logicalKey));
}

export function setAiCacheRaw(logicalKey: string, value: string): void {
  localStorage.setItem(resolveAiCacheKey(logicalKey), value);
}

export function removeAiCacheRaw(logicalKey: string): void {
  localStorage.removeItem(resolveAiCacheKey(logicalKey));
}

export function removeAiCacheKeysWithLogicalPrefix(logicalPrefix: string): void {
  if (typeof window === 'undefined') return;

  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (!key) continue;

    const logical = key.includes('::') ? key.slice(0, key.indexOf('::')) : key;
    if (logical.startsWith(logicalPrefix)) {
      localStorage.removeItem(key);
    }
  }
}
