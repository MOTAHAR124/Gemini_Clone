'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/ui/auth-provider';
import { api } from '@/lib/api';

export function ChatRedirector() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const hasHandledRedirectRef = useRef(false);

  useEffect(() => {
    if (!token || hasHandledRedirectRef.current) {
      return;
    }
    hasHandledRedirectRef.current = true;

    const shouldOpenNewChat = searchParams.get('new') === '1';

    if (shouldOpenNewChat) {
      api.chat
        .createConversation(token)
        .then((created) => {
          router.replace(`/chat/${created.id}`);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to open chat');
        });
      return;
    }

    api.chat
      .listConversations(token)
      .then(async (items) => {
        if (items.length > 0) {
          router.replace(`/chat/${items[0].id}`);
          return;
        }

        const created = await api.chat.createConversation(token);
        router.replace(`/chat/${created.id}`);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to open chat');
      });
  }, [token, router, searchParams]);

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-slate">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
