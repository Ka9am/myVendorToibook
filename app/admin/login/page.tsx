'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/admin-api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@toibook.kz');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true);
    setError('');
    try {
      await adminLogin(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: 'var(--gold-dark)' }}
          >
            ToiBook
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
            Панель модерации
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border p-8 space-y-5"
          style={{ borderColor: 'var(--border)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Email администратора
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Пароль
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ background: 'var(--gold)' }}
            >
              {loading ? 'Входим…' : 'Войти'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Доступ только для модераторов ToiBook
        </p>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
          background: white;
        }
        .input-field:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.15);
        }
      `}</style>
    </div>
  );
}
