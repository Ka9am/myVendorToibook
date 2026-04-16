'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, UserRole } from '@/lib/auth';

type Props = {
  role?: UserRole;
  children: React.ReactNode;
};

export default function AuthGuard({ role, children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (role && user.role !== role) {
      router.replace('/');
      return;
    }
    setReady(true);
  }, [role, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return <>{children}</>;
}
