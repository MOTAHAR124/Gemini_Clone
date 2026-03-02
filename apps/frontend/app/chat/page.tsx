import { ChatRedirector } from '@/components/chat/chat-redirector';
import { RequireAuth } from '@/components/ui/require-auth';

export default function ChatRootPage() {
  return (
    <RequireAuth>
      <ChatRedirector />
    </RequireAuth>
  );
}