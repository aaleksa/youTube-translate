export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return '/api/v2';
}

export function isBackendV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_BACKEND_V2_ENABLED !== 'false';
}

export function isLocalBackendOnClient(): boolean {
  return process.env.NEXT_PUBLIC_STORAGE_BACKEND !== 'dynamodb';
}

export function isEmailVerificationEnabledOnClient(): boolean {
  return process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED === 'true';
}
