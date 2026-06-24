'use client';

import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from '@react-oauth/google';
import { isGoogleAuthConfiguredOnClient } from '../../lib/v2/config';
import { useI18n } from '../InterfaceLanguageProvider';

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onSuccess: (idToken: string) => Promise<void>;
  onError: (message: string) => void;
}

export default function GoogleSignInButton({
  disabled = false,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const { t } = useI18n();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

  if (!isGoogleAuthConfiguredOnClient() || !clientId) {
    return null;
  }

  const handleSuccess = async (response: CredentialResponse) => {
    const idToken = response.credential;
    if (!idToken) {
      onError(t('auth.errorGeneric'));
      return;
    }

    try {
      await onSuccess(idToken);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('auth.errorGeneric');
      onError(message);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex flex-col items-center gap-2">
        <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
          <GoogleLogin
            onSuccess={(response) => void handleSuccess(response)}
            onError={() => onError(t('auth.errorGeneric'))}
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
