'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAdminToken, isAdminAuthenticated } from '@/lib/admin-api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(isAdminAuthenticated());
  }, [pathname]);

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (authed === false && !isLogin) {
      router.replace('/admin/login');
    }
  }, [authed, isLogin, router]);

  const handleLogout = () => {
    clearAdminToken();
    router.replace('/admin/login');
  };

  if (isLogin) return <>{children}</>;

  if (authed !== true) {
    return (
      <div className="flex items-center justify-center py-20 text-sm" style={{ color: 'var(--text-sub)' }}>
        Проверка доступа…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header
        className="flex items-center justify-between bg-white border rounded-2xl px-5 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: 'var(--gold-dark)' }}
          >
            ToiBook · Админка
          </Link>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--gold-light)', color: 'var(--gold-dark)' }}
          >
            admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--text-sub)' }}
        >
          Выйти
        </button>
      </header>
      {children}
    </div>
  );
}
