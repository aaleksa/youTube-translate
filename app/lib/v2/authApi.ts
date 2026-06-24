import type {
  AuthTokens,
  AuthUser,
  ConfirmForgotPasswordInput,
  ConfirmSignUpInput,
  ForgotPasswordInput,
  LoginInput,
  SignUpInput,
} from '../../../v2-core/types';
import { apiGet, apiPost } from './apiClient';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUser,
} from './tokenStorage';

export async function signUp(input: SignUpInput): Promise<void> {
  await apiPost('/auth/signup', input);
}

export async function confirmSignUp(input: ConfirmSignUpInput): Promise<void> {
  await apiPost('/auth/confirm', input);
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const tokens = await apiPost<AuthTokens>('/auth/login', input);
  saveTokens(tokens);
  const user = await getCurrentUser();
  saveUser(user);
  return user;
}

export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  const tokens = await apiPost<AuthTokens>('/auth/google', { idToken });
  saveTokens(tokens);
  const user = await getCurrentUser();
  saveUser(user);
  return user;
}

export async function logout(): Promise<void> {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  try {
    await apiPost('/auth/logout', { accessToken, refreshToken });
  } finally {
    clearAuthStorage();
  }
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  await apiPost('/auth/forgot-password', input);
}

export async function confirmForgotPassword(
  input: ConfirmForgotPasswordInput
): Promise<void> {
  await apiPost('/auth/confirm-forgot-password', input);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const user = await apiGet<AuthUser>('/me');
  saveUser(user);
  return user;
}
