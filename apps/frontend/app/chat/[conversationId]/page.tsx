'use client';

import { useParams } from 'next/navigation';

import { ChatShell } from '@/components/chat/chat-shell';
import { RequireAuth } from '@/components/ui/require-auth';

export default function ChatConversationPage() {
  const params = useParams<{ conversationId: string }>();

  if (!params?.conversationId) {
    return null;
  }

  return (
    <RequireAuth>
      <ChatShell conversationId={params.conversationId} />
    </RequireAuth>
  );
}