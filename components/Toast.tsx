'use client';

import { useEffect, useState } from 'react';

export type ToastPayload = { message: string; kind?: 'success' | 'error' };
const EVENT = 'toibook-toast';

export function showToast(message: string, kind: 'success' | 'error' = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(EVENT, { detail: { message, kind } }));
}

export default function Toast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handler = (e: Event) => {
      const payload = (e as CustomEvent<ToastPayload>).detail;
      setToast(payload);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setToast(null), 2800);
    };
    window.addEventListener(EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(EVENT, handler as EventListener);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  if (!toast) return null;

  const isError = toast.kind === 'error';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-[fade-in_0.2s_ease]">
      <div
        className="rounded-xl px-4 py-3 text-sm font-medium shadow-xl flex items-center gap-2"
        style={{
          background: isError ? '#FEE2E2' : '#1A1A1A',
          color: isError ? '#991B1B' : 'white',
          border: isError ? '1px solid #FCA5A5' : 'none',
        }}
      >
        {!isError && <span>✓</span>}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
