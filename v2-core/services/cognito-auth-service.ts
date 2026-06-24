// @ts-nocheck — AWS Cognito; enable when STORAGE_BACKEND=dynamodb
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  RevokeTokenCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { ApiError } from '../errors';
import type {
  AuthTokens,
  ConfirmForgotPasswordInput,
  ConfirmSignUpInput,
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  SignUpInput,
} from '../types';
import { getCognitoConfig } from '../auth/config';

function getCognitoClient(): CognitoIdentityProviderClient {
  const { region } = getCognitoConfig();
  return new CognitoIdentityProviderClient({ region });
}

function mapCognitoError(error: unknown): never {
  const name =
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof error.name === 'string'
      ? error.name
      : 'UnknownError';

  const message =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : 'Authentication failed';

  switch (name) {
    case 'UsernameExistsException':
      throw new ApiError('An account with this email already exists', 409, name);
    case 'NotAuthorizedException':
      throw new ApiError('Invalid email or password', 401, name);
    case 'UserNotConfirmedException':
      throw new ApiError('Email is not confirmed yet', 403, name);
    case 'CodeMismatchException':
      throw new ApiError('Invalid confirmation code', 400, name);
    case 'ExpiredCodeException':
      throw new ApiError('Confirmation code has expired', 400, name);
    case 'InvalidPasswordException':
      throw new ApiError(message, 400, name);
    default:
      throw new ApiError(message, 400, name);
  }
}

function mapAuthResult(
  authenticationResult: {
    AccessToken?: string;
    RefreshToken?: string;
    IdToken?: string;
    ExpiresIn?: number;
  } | undefined
): AuthTokens {
  if (
    !authenticationResult?.AccessToken ||
    !authenticationResult.RefreshToken ||
    !authenticationResult.IdToken
  ) {
    throw new ApiError('Authentication tokens were not returned', 500, 'AUTH_TOKENS_MISSING');
  }

  return {
    accessToken: authenticationResult.AccessToken,
    refreshToken: authenticationResult.RefreshToken,
    idToken: authenticationResult.IdToken,
    expiresIn: authenticationResult.ExpiresIn ?? 3600,
  };
}

export async function signUp(input: SignUpInput): Promise<{ success: true }> {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();

  try {
    await client.send(
      new SignUpCommand({
        ClientId: clientId,
        Username: input.email,
        Password: input.password,
        UserAttributes: [{ Name: 'email', Value: input.email }],
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}

export async function confirmSignUp(
  input: ConfirmSignUpInput
): Promise<{ success: true }> {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();

  try {
    await client.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: input.email,
        ConfirmationCode: input.code,
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();

  try {
    const result = await client.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: input.email,
          PASSWORD: input.password,
        },
      })
    );

    return mapAuthResult(result.AuthenticationResult);
  } catch (error) {
    mapCognitoError(error);
  }
}

export async function refreshTokens(
  input: RefreshTokenInput
): Promise<AuthTokens> {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();

  try {
    const result = await client.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: clientId,
        AuthParameters: {
          REFRESH_TOKEN: input.refreshToken,
        },
      })
    );

    const tokens = mapAuthResult(result.AuthenticationResult);
    return {
      ...tokens,
      refreshToken: input.refreshToken,
    };
  } catch (error) {
    mapCognitoError(error);
  }
}

export async function logout(input: {
  accessToken?: string;
  refreshToken?: string;
}): Promise<{ success: true }> {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();

  try {
    if (input.accessToken) {
      await client.send(
        new GlobalSignOutCommand({
          AccessToken: input.accessToken,
        })
      );
    } else if (input.refreshToken) {
      await client.send(
        new RevokeTokenCommand({
          ClientId: clientId,
          Token: input.refreshToken,
        })
      );
    }

    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<{ success: true }> {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();

  try {
    await client.send(
      new ForgotPasswordCommand({
        ClientId: clientId,
        Username: input.email,
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}

export async function confirmForgotPassword(
  input: ConfirmForgotPasswordInput
): Promise<{ success: true }> {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();

  try {
    await client.send(
      new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: input.email,
        ConfirmationCode: input.code,
        Password: input.newPassword,
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}
