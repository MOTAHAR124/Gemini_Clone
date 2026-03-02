'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from './auth-provider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}