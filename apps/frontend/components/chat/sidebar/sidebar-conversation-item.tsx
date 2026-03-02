import clsx from 'clsx';
import { EllipsisVertical, Pin, Share2, SquarePen, Trash2 } from 'lucide-react';

import { SidebarConversationItemProps } from './sidebar.types';

export function SidebarConversationItem({
  conversation,
  isActive,
  isPinned,
  isMenuOpen,
  menuOpen,
  sharingConversationId,
  onSelect,
  onToggleMenu,
  onShareConversation,
  onTogglePinConversation,
  onOpenRenameConversation,
  onDeleteConversation,
}: SidebarConversationItemProps) {
  return (
    <div key={conversation.id} data-conversation-menu-root="true" className={clsx('group relative mb-1', menuOpen ? 'opacity-100' : 'opacity-0')}>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        className={clsx(
          'flex w-full cursor-pointer items-center truncate rounded-3xl px-3 py-2.5 pr-16 text-left text-sm font-semibold transition',
          isActive ? 'bg-[#1F3760] text-white' : 'text-gray-300 hover:bg-[#2a2b2d]',
        )}
      >
        <span className="truncate">{conversation.title || 'New chat'}</span>
      </button>

      {isPinned ? (
        <span className="pointer-events-none absolute top-1/2 right-9 -translate-y-1/2 text-gray-300">
          <Pin className="h-3.5 w-3.5" />
        </span>
      ) : null}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu(conversation.id);
        }}
        className={clsx(
          'absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-gray-300 transition hover:bg-[#0F4D83]',
          isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        aria-label="Conversation options"
      >
        <EllipsisVertical className="h-4 w-4" />
      </button>

      {isMenuOpen ? (
        <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-56 rounded-2xl border border-white/10 bg-[#1B1D1F] p-2 shadow-xl">
          <button
            type="button"
            onClick={() => void onShareConversation(conversation.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-white/10"
            disabled={sharingConversationId === conversation.id}
          >
            <Share2 className="h-4 w-4" />
            <span>{sharingConversationId === conversation.id ? 'Sharing...' : 'Share conversation'}</span>
          </button>
          <button
            type="button"
            onClick={() => onTogglePinConversation(conversation.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-white/10"
          >
            <Pin className="h-4 w-4" />
            <span>{isPinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenRenameConversation(conversation)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-white/10"
          >
            <SquarePen className="h-4 w-4" />
            <span>Rename</span>
          </button>
          <button
            type="button"
            onClick={() => void onDeleteConversation(conversation.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/15"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
