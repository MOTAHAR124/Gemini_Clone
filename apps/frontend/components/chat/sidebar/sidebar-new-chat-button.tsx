import clsx from 'clsx';
import { SquarePen } from 'lucide-react';

import { SidebarNewChatButtonProps } from './sidebar.types';

export function SidebarNewChatButton({ menuOpen, onCreateConversation }: SidebarNewChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onCreateConversation}
      className={clsx(
        'inline-flex cursor-pointer items-center rounded-xl text-gray-300 transition hover:bg-white/10',
        menuOpen ? 'mb-6 w-full px-0 py-0 text-left text-sm font-bold' : 'h-10 w-10 justify-center p-0',
      )}
    >
      <span className="inline-flex h-10 w-10 shrink-0 -translate-y-0.5 items-center justify-center">
        <SquarePen className="h-5 w-5" />
      </span>
      {menuOpen ? <span>New chat</span> : null}
    </button>
  );
}
