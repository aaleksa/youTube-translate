import type {
  AuthTokens,
  AuthUser,
  ConfirmForgotPasswordInput,
  ConfirmSignUpInput,
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  SignUpInput,
} from '../types';
import { isEmailVerificationEnabled, isLocalBackend } from '../storage/config';
import * as localAuth from '../storage/local-auth-store';
import { ApiError } from '../errors';

async function getProvider() {
  if (isLocalBackend()) {
    return localAuth;
  }

  try {
    return await import(
      /* webpackIgnore: true */
      './cognito-auth-service'
    );
  } catch {
    const { ApiError } = await import('../errors');
    throw new ApiError(
      'AWS Cognito mode is not available. Install AWS dependencies or set STORAGE_BACKEND=local.',
      503,
      'COGNITO_UNAVAILABLE'
    );
  }
}

export async function signUp(input: SignUpInput): Promise<{ success: true }> {
  const provider = await getProvider();
  return provider.signUp(input);
}

export async function confirmSignUp(
  input: ConfirmSignUpInput
): Promise<{ success: true }> {
  if (!isEmailVerificationEnabled()) {
    return { success: true };
  }

  const provider = await getProvider();
  return provider.confirmSignUp(input);
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const provider = await getProvider();
  return provider.login(input);
}

export async function refreshTokens(
  input: RefreshTokenInput
): Promise<AuthTokens> {
  const provider = await getProvider();
  return provider.refreshTokens(input);
}

export async function logout(input: {
  accessToken?: string;
  refreshToken?: string;
}): Promise<{ success: true }> {
  const provider = await getProvider();
  return provider.logout(input);
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<{ success: true }> {
  if (!isEmailVerificationEnabled()) {
    throw new ApiError(
      'Password reset by email is not available yet.',
      503,
      'EMAIL_NOT_CONFIGURED'
    );
  }

  const provider = await getProvider();
  return provider.forgotPassword(input);
}

export async function confirmForgotPassword(
  input: ConfirmForgotPasswordInput
): Promise<{ success: true }> {
  if (!isEmailVerificationEnabled()) {
    throw new ApiError(
      'Password reset by email is not available yet.',
      503,
      'EMAIL_NOT_CONFIGURED'
    );
  }

  const provider = await getProvider();
  return provider.confirmForgotPassword(input);
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  if (isLocalBackend()) {
    return localAuth.getCurrentUser(accessToken);
  }

  const { verifyAccessToken } = await import('../auth/jwt-verifier');
  const context = await verifyAccessToken(accessToken);
  return {
    userId: context.userId,
    email: context.email,
  };
}
