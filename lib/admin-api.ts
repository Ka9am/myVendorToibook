'use client';

import type { ApiOffer, OfferStatus } from './api/types';

const TOKEN_KEY = 'toibook_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(path, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data as { message?: string }).message) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const { token } = await request<{ token: string }>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAdminToken(token);
  return token;
}

export type AdminOffer = ApiOffer;

export async function fetchAdminOffers(status?: OfferStatus): Promise<AdminOffer[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<AdminOffer[]>(`/api/admin/offers${qs}`);
}

export type AdminOfferDetail = AdminOffer & {
  vendor: { id: number; name: string; surname: string; email: string } | null;
};

export async function fetchAdminOffer(id: number): Promise<AdminOfferDetail> {
  return request<AdminOfferDetail>(`/api/admin/offers/${id}`);
}

export async function approveOffer(id: number): Promise<void> {
  await request(`/api/admin/offers/${id}/approve`, { method: 'POST' });
}

export async function rejectOffer(id: number, reason: string): Promise<void> {
  await request(`/api/admin/offers/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
