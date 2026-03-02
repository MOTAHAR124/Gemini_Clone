'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useAuth } from '@/components/ui/auth-provider';

function OAuthCallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { setTokenFromOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('Missing OAuth token');
      return;
    }

    setTokenFromOAuth(token)
      .then(() => {
        router.replace('/chat?new=1');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      });
  }, [params, router, setTokenFromOAuth]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center text-slate">
      <Loader2 className="h-6 w-6 animate-spin" />
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-slate">
          <Loader2 className="h-6 w-6 animate-spin" />
        </main>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
