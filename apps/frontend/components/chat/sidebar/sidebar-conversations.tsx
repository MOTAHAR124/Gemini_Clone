import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

import { Conversation } from '@/lib/types';

import { SidebarConversationItem } from './sidebar-conversation-item';

interface SidebarConversationsProps {
  menuOpen: boolean;
  loadingConversations: boolean;
  conversationId: string;
  conversations: Conversation[];
  pinnedConversationIds: string[];
  searchQuery: string;
  openConversationMenuId: string | null;
  sharingConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onToggleConversationMenu: (conversationId: string) => void;
  onShareConversation: (conversationId: string) => void | Promise<void>;
  onTogglePinConversation: (conversationId: string) => void;
  onOpenRenameConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void | Promise<void>;
}

export function SidebarConversations({
  menuOpen,
  loadingConversations,
  conversationId,
  conversations,
  pinnedConversationIds,
  searchQuery,
  openConversationMenuId,
  sharingConversationId,
  onSelectConversation,
  onToggleConversationMenu,
  onShareConversation,
  onTogglePinConversation,
  onOpenRenameConversation,
  onDeleteConversation,
}: SidebarConversationsProps) {
  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        (conversation.title || 'New chat').toLowerCase().includes(searchQuery.toLowerCase().trim()),
      ),
    [conversations, searchQuery],
  );

  const orderedConversations = useMemo(
    () =>
      [...filteredConversations].sort((a, b) => {
        const aPinned = pinnedConversationIds.includes(a.id);
        const bPinned = pinnedConversationIds.includes(b.id);
        if (aPinned === bPinned) {
          return 0;
        }
        return aPinned ? -1 : 1;
      }),
    [filteredConversations, pinnedConversationIds],
  );

  return (
    <div className={clsx('flex-1 overflow-y-auto px-3 pb-2', menuOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0')}>
      {loadingConversations ? (
        <div className={clsx('flex items-center gap-2 px-3 text-sm text-gray-400', menuOpen ? 'opacity-100' : 'opacity-0')}>
          <Loader2 size={14} className="animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        orderedConversations.slice(0, 40).map((conversation) => (
          <SidebarConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === conversationId}
            isPinned={pinnedConversationIds.includes(conversation.id)}
            isMenuOpen={openConversationMenuId === conversation.id}
            menuOpen={menuOpen}
            sharingConversationId={sharingConversationId}
            onSelect={onSelectConversation}
            onToggleMenu={onToggleConversationMenu}
            onShareConversation={onShareConversation}
            onTogglePinConversation={onTogglePinConversation}
            onOpenRenameConversation={onOpenRenameConversation}
            onDeleteConversation={onDeleteConversation}
          />
        ))
      )}
      {menuOpen && !loadingConversations && filteredConversations.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-500">No chats found.</p>
      ) : null}
    </div>
  );
}
