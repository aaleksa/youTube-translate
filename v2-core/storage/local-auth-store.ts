import { randomInt, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { ApiError, ConflictError, NotFoundError, UnauthorizedError } from '../errors';
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
import { getLocalDatabase } from '../storage/local-db';
import { issueLocalTokens } from '../auth/local-jwt';

interface LocalUserRow {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: number;
  resetCode: string | null;
  resetCodeExpiresAt: number | null;
  createdAt: number;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getUserByEmail(email: string): LocalUserRow | null {
  const db = getLocalDatabase();
  return (
    (db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(normalizeEmail(email)) as LocalUserRow | undefined) ?? null
  );
}

function getUserById(userId: string): LocalUserRow | null {
  const db = getLocalDatabase();
  return (
    (db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId) as
      | LocalUserRow
      | undefined) ?? null
  );
}

export function saveRefreshToken(
  token: string,
  userId: string,
  expiresAt: number
): void {
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?, ?, ?)`
  ).run(token, userId, expiresAt);
}

function getRefreshToken(token: string): { userId: string; expiresAt: number } | null {
  const db = getLocalDatabase();
  const row = db
    .prepare(`SELECT userId, expiresAt FROM refresh_tokens WHERE token = ?`)
    .get(token) as { userId: string; expiresAt: number } | undefined;

  if (!row) return null;
  if (row.expiresAt < Date.now()) {
    db.prepare(`DELETE FROM refresh_tokens WHERE token = ?`).run(token);
    return null;
  }

  return row;
}

function revokeRefreshToken(token: string): void {
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM refresh_tokens WHERE token = ?`).run(token);
}

function revokeAllRefreshTokens(userId: string): void {
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM refresh_tokens WHERE userId = ?`).run(userId);
}

function toAuthUser(user: LocalUserRow): AuthUser {
  return {
    userId: user.id,
    email: user.email,
    emailVerified: user.emailVerified === 1,
  };
}

export async function signUp(input: SignUpInput): Promise<{ success: true }> {
  const email = normalizeEmail(input.email);
  if (!email || input.password.length < 8) {
    throw new ApiError('Email and password (min 8 chars) are required', 400);
  }

  if (getUserByEmail(email)) {
    throw new ConflictError('An account with this email already exists');
  }

  const db = getLocalDatabase();
  const passwordHash = await bcrypt.hash(input.password, 12);

  db.prepare(
    `INSERT INTO users (id, email, passwordHash, emailVerified, createdAt)
     VALUES (?, ?, ?, 1, ?)`
  ).run(randomUUID(), email, passwordHash, Date.now());

  return { success: true };
}

export async function confirmSignUp(
  input: ConfirmSignUpInput
): Promise<{ success: true }> {
  const user = getUserByEmail(input.email);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return { success: true };
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const user = getUserByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return issueLocalTokens({ userId: user.id, email: user.email });
}

export async function refreshTokens(
  input: RefreshTokenInput
): Promise<AuthTokens> {
  const stored = getRefreshToken(input.refreshToken);
  if (!stored) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = getUserById(stored.userId);
  if (!user) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  revokeRefreshToken(input.refreshToken);
  return issueLocalTokens({ userId: user.id, email: user.email });
}

export async function logout(input: {
  refreshToken?: string;
}): Promise<{ success: true }> {
  if (input.refreshToken) {
    revokeRefreshToken(input.refreshToken);
  }
  return { success: true };
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<{ success: true; devResetCode?: string }> {
  const user = getUserByEmail(input.email);
  if (!user) {
    return { success: true };
  }

  const resetCode = String(randomInt(100000, 999999));
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const db = getLocalDatabase();

  db.prepare(
    `UPDATE users SET resetCode = ?, resetCodeExpiresAt = ? WHERE id = ?`
  ).run(resetCode, expiresAt, user.id);

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[local-auth] Password reset code for ${user.email}: ${resetCode}`);
    return { success: true, devResetCode: resetCode };
  }

  return { success: true };
}

export async function confirmForgotPassword(
  input: ConfirmForgotPasswordInput
): Promise<{ success: true }> {
  const user = getUserByEmail(input.email);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (
    !user.resetCode ||
    !user.resetCodeExpiresAt ||
    user.resetCodeExpiresAt < Date.now() ||
    user.resetCode !== input.code.trim()
  ) {
    throw new ApiError('Invalid or expired reset code', 400, 'INVALID_RESET_CODE');
  }

  const db = getLocalDatabase();
  const passwordHash = await bcrypt.hash(input.newPassword, 12);

  db.prepare(
    `UPDATE users
     SET passwordHash = ?, resetCode = NULL, resetCodeExpiresAt = NULL
     WHERE id = ?`
  ).run(passwordHash, user.id);

  revokeAllRefreshTokens(user.id);
  return { success: true };
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const { verifyLocalAccessToken } = await import('../auth/local-jwt');
  const context = await verifyLocalAccessToken(accessToken);
  const user = getUserById(context.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toAuthUser(user);
}
