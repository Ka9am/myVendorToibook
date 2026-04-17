import { User, Role } from './types';

const SESSION_KEY = 'toibook_session';
const USERS_KEY = 'toibook_users';

export type UserRole = Role;

export type AuthUser = Omit<User, 'password'>;

// ── Users list ──────────────────────────────────────────────────────────────

export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveAllUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUserById(id: string): AuthUser | null {
  const u = getAllUsers().find((x) => x.id === id);
  if (!u) return null;
  return stripPassword(u);
}

function stripPassword(u: User): AuthUser {
  const { password: _p, ...rest } = u;
  return rest;
}

// ── Session ─────────────────────────────────────────────────────────────────

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  const users = getAllUsers();
  const i = users.findIndex((u) => u.id === user.id);
  if (i >= 0) {
    users[i] = { ...users[i], ...user };
    saveAllUsers(users);
  }
}

export function clearUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ── Auth actions ────────────────────────────────────────────────────────────

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

export function register(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
  companyName?: string;
}): AuthResult {
  const users = getAllUsers();
  const email = data.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: 'Пользователь с таким email уже зарегистрирован' };
  }
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: data.name.trim(),
    email,
    password: data.password,
    role: data.role,
    companyName: data.companyName?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveAllUsers(users);
  const auth = stripPassword(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
  return { ok: true, user: auth };
}

export function login(email: string, password: string): AuthResult {
  const target = email.trim().toLowerCase();
  const user = getAllUsers().find((u) => u.email.toLowerCase() === target);
  if (!user || user.password !== password) {
    return { ok: false, error: 'Неверный email или пароль' };
  }
  const auth = stripPassword(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
  return { ok: true, user: auth };
}

export function logout(): void {
  clearUser();
}
