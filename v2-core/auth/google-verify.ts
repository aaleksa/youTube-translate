import { OAuth2Client } from 'google-auth-library';
import { ApiError, UnauthorizedError } from '../errors';
import { getGoogleClientId, isGoogleAuthConfigured } from './google-config';

export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleProfile> {
  if (!isGoogleAuthConfigured()) {
    throw new ApiError(
      'Google sign-in is not configured. Set GOOGLE_CLIENT_ID.',
      503,
      'GOOGLE_NOT_CONFIGURED'
    );
  }

  const clientId = getGoogleClientId();
  const client = new OAuth2Client(clientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedError('Invalid Google token');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified ?? true,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    if (error instanceof ApiError || error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid Google token');
  }
}
