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

const DEV_ONLY_LOCAL_AUTH_SECRET = 'yoytube-local-dev-secret-change-me';
const KNOWN_INSECURE_LOCAL_AUTH_SECRETS = new Set([
  DEV_ONLY_LOCAL_AUTH_SECRET,
  // The literal placeholder documented in .env.example - if someone copies
  // the file without changing it, this must not silently work in prod.
  'change-me-in-production',
]);

export function getLocalAuthSecret(): string {
  const configured = process.env.LOCAL_AUTH_SECRET?.trim();
  const secret = configured || DEV_ONLY_LOCAL_AUTH_SECRET;

  if (
    process.env.NODE_ENV === 'production' &&
    KNOWN_INSECURE_LOCAL_AUTH_SECRETS.has(secret)
  ) {
    throw new Error(
      'LOCAL_AUTH_SECRET is missing or still set to its placeholder value. ' +
        'JWTs signed with a known secret can be forged by anyone. Set a ' +
        'strong random value (e.g. `openssl rand -hex 32`) in your production ' +
        'environment before starting the server.'
    );
  }

  return secret;
}

export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === 'true';
}
