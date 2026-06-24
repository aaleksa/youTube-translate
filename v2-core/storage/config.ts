import { isCognitoConfigured } from '../auth/config';

export type StorageBackend = 'local' | 'dynamodb';

export function getStorageBackend(): StorageBackend {
  const configured = process.env.STORAGE_BACKEND?.trim().toLowerCase();
  if (configured === 'local' || configured === 'dynamodb') {
    return configured;
  }
  return isCognitoConfigured() ? 'dynamodb' : 'local';
}

export function isLocalBackend(): boolean {
  return getStorageBackend() === 'local';
}

export function getLocalDbPath(): string {
  return process.env.LOCAL_DB_PATH ?? 'data/local.db';
}

export function getLocalAuthSecret(): string {
  return process.env.LOCAL_AUTH_SECRET ?? 'yoytube-local-dev-secret-change-me';
}

export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === 'true';
}
