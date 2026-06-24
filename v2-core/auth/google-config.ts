import { ApiError } from '../errors';

export function getGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    ''
  );
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(getGoogleClientId());
}
