/**
 * Authentication. Screens only use `auth` (the AuthService below).
 *
 *  - With EXPO_PUBLIC_API_URL set, it talks to the Laravel backend
 *    (Sanctum token auth, see LARAVEL_API.md).
 *  - Without it, a local mock keeps accounts on this phone so every screen
 *    works today. In mock mode the email code is always 123456.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { api, apiConfigured, setToken } from '@/lib/api';
import { uid } from '@/lib/storage';
import { AuthError, type Role, type User } from './types';

export interface SignUpInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

export interface AuthService {
  readonly mode: 'laravel' | 'demo';
  signUp(input: SignUpInput): Promise<User>;
  logIn(email: string, password: string): Promise<User>;
  logOut(): Promise<void>;
  /** Send a 6-digit code to verify a new account's email. */
  sendVerifyCode(email: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<User>;
  /** Send a 6-digit password reset code. Never reveals whether the email exists. */
  forgotPassword(email: string): Promise<void>;
  checkResetCode(email: string, code: string): Promise<void>;
  resetPassword(email: string, code: string, password: string): Promise<void>;
  markProfileComplete(userId: string): Promise<User>;
}

/* ------------------------------------------------------------ validation (shared by both modes) */

export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
/** Nigerian mobile: 080…, 081…, 070…, 090…, 091… or +234… */
export const validPhone = (p: string) => /^(?:\+?234|0)[789][01]\d{8}$/.test(p.replace(/[\s-]/g, ''));

export function passwordProblems(p: string) {
  const issues: string[] = [];
  if (p.length < 8) issues.push('at least 8 characters');
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) issues.push('letters and numbers');
  return issues;
}

function checkSignUp(i: SignUpInput) {
  if (i.name.trim().length < 2) throw new AuthError('Enter your full name.', 'name');
  if (!validEmail(i.email)) throw new AuthError('Enter a valid email address.', 'email');
  if (!validPhone(i.phone)) throw new AuthError('Enter a Nigerian phone number, e.g. 0803 123 4567.', 'phone');
  const p = passwordProblems(i.password);
  if (p.length) throw new AuthError(`Password needs ${p.join(' and ')}.`, 'password');
}

/* ------------------------------------------------------------ demo (on-device) */

export const DEMO_CODE = '123456';
type Stored = User & { passwordHash: string };
const USERS = 'auth-users';

const hash = (s: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `dogwalk:${s}`);
const strip = ({ passwordHash: _ignored, ...u }: Stored): User => u;

async function readUsers(): Promise<Stored[]> {
  const raw = await AsyncStorage.getItem(USERS);
  return raw ? (JSON.parse(raw) as Stored[]) : [];
}
const writeUsers = (u: Stored[]) => AsyncStorage.setItem(USERS, JSON.stringify(u));

export const demoAuth: AuthService = {
  mode: 'demo',
  async signUp(input) {
    checkSignUp(input);
    const users = await readUsers();
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) throw new AuthError('An account with this email already exists. Log in instead.', 'email');
    const user: Stored = {
      id: `u_${uid()}`,
      name: input.name.trim(),
      email,
      phone: input.phone.replace(/[\s-]/g, ''),
      role: input.role,
      emailVerified: false,
      profileComplete: false,
      passwordHash: await hash(input.password),
    };
    await writeUsers([...users, user]);
    return strip(user);
  },
  async logIn(email, password) {
    const users = await readUsers();
    const u = users.find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.passwordHash !== (await hash(password))) throw new AuthError('Email or password is incorrect.', 'password');
    return strip(u);
  },
  async logOut() {},
  async sendVerifyCode() {},
  async verifyEmail(email, code) {
    if (code !== DEMO_CODE) throw new AuthError('That code is not right. Check the latest email and try again.', 'code');
    const users = await readUsers();
    const u = users.find((x) => x.email === email.trim().toLowerCase());
    if (!u) throw new AuthError('Account not found.', 'email');
    u.emailVerified = true;
    await writeUsers(users);
    return strip(u);
  },
  async forgotPassword() {},
  async checkResetCode(_email, code) {
    if (code !== DEMO_CODE) throw new AuthError('That code is not right or has expired.', 'code');
  },
  async resetPassword(email, code, password) {
    await this.checkResetCode(email, code);
    const p = passwordProblems(password);
    if (p.length) throw new AuthError(`Password needs ${p.join(' and ')}.`, 'password');
    const users = await readUsers();
    const u = users.find((x) => x.email === email.trim().toLowerCase());
    if (u) {
      u.passwordHash = await hash(password);
      await writeUsers(users);
    }
  },
  async markProfileComplete(userId) {
    const users = await readUsers();
    const u = users.find((x) => x.id === userId);
    if (!u) throw new AuthError('Account not found.');
    u.profileComplete = true;
    await writeUsers(users);
    return strip(u);
  },
};

/* ------------------------------------------------------------ Laravel */

type ApiUser = { id: number | string; name: string; email: string; phone: string; role: Role; email_verified_at: string | null; profile_complete: boolean };
const fromApi = (u: ApiUser): User => ({
  id: String(u.id),
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  emailVerified: Boolean(u.email_verified_at),
  profileComplete: u.profile_complete,
});

export const laravelAuth: AuthService = {
  mode: 'laravel',
  async signUp(input) {
    checkSignUp(input);
    const r = await api<{ user: ApiUser; token: string }>('POST', '/auth/register', {
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone,
      password: input.password,
      password_confirmation: input.password,
      role: input.role,
      device_name: 'dogwalk-app',
    });
    await setToken(r.token);
    return fromApi(r.user);
  },
  async logIn(email, password) {
    const r = await api<{ user: ApiUser; token: string }>('POST', '/auth/login', { email, password, device_name: 'dogwalk-app' });
    await setToken(r.token);
    return fromApi(r.user);
  },
  async logOut() {
    await api('POST', '/auth/logout').catch(() => {});
    await setToken(null);
  },
  async sendVerifyCode() {
    await api('POST', '/auth/email/code');
  },
  async verifyEmail(_email, code) {
    return fromApi((await api<{ user: ApiUser }>('POST', '/auth/email/verify', { code })).user);
  },
  async forgotPassword(email) {
    await api('POST', '/auth/password/forgot', { email });
  },
  async checkResetCode(email, code) {
    await api('POST', '/auth/password/check-code', { email, code });
  },
  async resetPassword(email, code, password) {
    await api('POST', '/auth/password/reset', { email, code, password, password_confirmation: password });
  },
  async markProfileComplete() {
    return fromApi((await api<{ user: ApiUser }>('GET', '/me')).user);
  },
};

export const auth: AuthService = apiConfigured ? laravelAuth : demoAuth;
