'use client';

import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MarkdownView } from '@/components/ui/markdown-view';
import { api } from '@/lib/api';
import { SharedConversation } from '@/lib/types';

export default function SharedConversationPage() {
  const params = useParams<{ token: string }>();
  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.token) {
      return;
    }

    setLoading(true);
    setError(null);

    api.chat
      .getSharedConversation(params.token)
      .then((data) => setConversation(data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load shared conversation');
      })
      .finally(() => setLoading(false));
  }, [params?.token]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131314] text-gray-300">
        <Loader2 className="h-5 w-5 animate-spin" />
      </main>
    );
  }

  if (error || !conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131314] px-4 text-center text-red-300">
        {error || 'Shared conversation not found.'}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#131314] px-4 py-8 text-[#e3e3e3] md:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">{conversation.title}</h1>
        <p className="mb-6 text-sm text-gray-400">Shared conversation (read-only)</p>

        <div className="space-y-5">
          {conversation.messages.map((message) =>
            message.role === 'user' ? (
              <div key={message.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl bg-[#2a2b2d] px-4 py-3 text-sm text-gray-100 sm:text-base">{message.content}</p>
              </div>
            ) : (
              <div key={message.id} className="rounded-2xl border border-white/5 bg-[#1c1d1f] p-4">
                <MarkdownView content={message.content} className="text-gray-200" />
              </div>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
