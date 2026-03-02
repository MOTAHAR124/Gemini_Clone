'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { SidebarConversations } from './sidebar-conversations';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarNewChatButton } from './sidebar-new-chat-button';
import { SidebarSearch } from './sidebar-search';
import { ChatSidebarProps } from './sidebar.types';

export function ChatSidebar({
  conversationId,
  conversations,
  loadingConversations,
  pinnedConversationIds,
  sharingConversationId,
  onCreateConversation,
  onSelectConversation,
  onShareConversation,
  onTogglePinConversation,
  onOpenRenameConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openConversationMenuId, setOpenConversationMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      setSearchOpen(false);
      setSearchQuery('');
      setOpenConversationMenuId(null);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!openConversationMenuId) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-conversation-menu-root="true"]')) {
        return;
      }
      setOpenConversationMenuId(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openConversationMenuId]);

  return (
    <aside
      className={clsx(
        'flex h-full shrink-0 flex-col border-r border-white/5 bg-[#1E1F20] transition-[width] duration-300 ease-out',
        menuOpen ? 'w-80' : 'w-18',
      )}
    >
      <SidebarHeader
        menuOpen={menuOpen}
        searchOpen={searchOpen}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
        onToggleSearch={() => setSearchOpen((prev) => !prev)}
      />

      <div
        className={clsx(
          'px-3 transition-opacity duration-200',
          menuOpen ? 'opacity-100' : 'mt-8 flex justify-center px-0 opacity-100',
        )}
      >
        <SidebarSearch isOpen={menuOpen && searchOpen} value={searchQuery} onChange={setSearchQuery} />
        <SidebarNewChatButton menuOpen={menuOpen} onCreateConversation={() => void onCreateConversation()} />
        {menuOpen ? <p className="mb-2 px-3 text-sm font-bold text-gray-300">Chats</p> : null}
      </div>

      <SidebarConversations
        menuOpen={menuOpen}
        loadingConversations={loadingConversations}
        conversationId={conversationId}
        conversations={conversations}
        pinnedConversationIds={pinnedConversationIds}
        searchQuery={searchQuery}
        openConversationMenuId={openConversationMenuId}
        sharingConversationId={sharingConversationId}
        onSelectConversation={onSelectConversation}
        onToggleConversationMenu={(id) => setOpenConversationMenuId((prev) => (prev === id ? null : id))}
        onShareConversation={onShareConversation}
        onTogglePinConversation={onTogglePinConversation}
        onOpenRenameConversation={onOpenRenameConversation}
        onDeleteConversation={onDeleteConversation}
      />

      <SidebarFooter menuOpen={menuOpen} />
    </aside>
  );
}
