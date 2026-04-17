'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, logout, AuthUser } from '@/lib/auth';
import { getVendorBookings, getFavorites } from '@/lib/storage';

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (u?.role === 'vendor') {
      setPendingCount(getVendorBookings(u.id).filter((b) => b.status === 'pending').length);
    }
    if (u?.role === 'client') {
      setFavCount(getFavorites(u.id).length);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: 'var(--gold-dark)' }}>
            ToiBook
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-sub)' }}>
          <Link href="/" className="hover:text-[--gold-dark] transition-colors">Каталог</Link>

          {user?.role === 'vendor' && (
            <>
              <Link href="/vendor/dashboard" className="hover:text-[--gold-dark] transition-colors">Мои офферы</Link>
              <Link href="/vendor/leads" className="hover:text-[--gold-dark] transition-colors relative">
                Заявки
                {pendingCount > 0 && (
                  <span
                    className="absolute -top-2 -right-5 text-[10px] font-bold text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
                    style={{ background: '#E53935' }}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user?.role === 'client' && (
            <>
              <Link href="/favorites" className="hover:text-[--gold-dark] transition-colors relative">
                Избранное
                {favCount > 0 && (
                  <span
                    className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--gold-light)', color: 'var(--gold-dark)' }}
                  >
                    {favCount}
                  </span>
                )}
              </Link>
              <Link href="/client/bookings" className="hover:text-[--gold-dark] transition-colors">Мои заявки</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/login"
                className="hidden md:block text-sm font-medium transition-colors"
                style={{ color: 'var(--text-sub)' }}
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors text-white"
                style={{ background: 'var(--gold)' }}
              >
                Регистрация
              </Link>
            </>
          ) : (
            <>
              {user.role === 'vendor' && (
                <Link
                  href="/vendor/create"
                  className="hidden md:block text-sm font-medium px-4 py-2 rounded-lg transition-colors text-white"
                  style={{ background: 'var(--gold)' }}
                >
                  + Создать оффер
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'var(--gold)' }}>
                    {(user.companyName ?? user.name).charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden md:block max-w-28 truncate">
                    {user.companyName ?? user.name}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border py-1 z-50"
                    style={{ borderColor: 'var(--border)' }}>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--text-main)' }}
                    >
                      Профиль
                    </Link>
                    {user.role === 'vendor' && (
                      <Link
                        href="/vendor/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Дашборд
                      </Link>
                    )}
                    {user.role === 'client' && (
                      <Link
                        href="/favorites"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Избранное
                      </Link>
                    )}
                    <hr style={{ borderColor: 'var(--border)' }} className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-red-500"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
