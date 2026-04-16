export type UserRole = 'client' | 'vendor';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  city?: string;
  phone?: string;
};

const SESSION_KEY = 'toibook_user';

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function register(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
}): AuthUser {
  const user: AuthUser = {
    id: `user_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    companyName: data.companyName,
  };
  setUser(user);
  return user;
}

export function login(email: string, _password: string): AuthUser | null {
  // Without backend: check if user exists in localStorage or create demo user
  const current = getUser();
  if (current && current.email === email) return current;

  // Demo fallback — создаём тестового пользователя
  const demo: AuthUser = {
    id: `user_demo_${Date.now()}`,
    name: email.split('@')[0],
    email,
    role: 'client',
  };
  setUser(demo);
  return demo;
}

export function logout(): void {
  clearUser();
}
