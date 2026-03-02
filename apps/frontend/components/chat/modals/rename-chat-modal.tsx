import type { RefObject } from 'react';

import { Conversation } from '@/lib/types';

interface RenameChatModalProps {
  conversation: Conversation;
  draft: string;
  renamingConversationId: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onChangeDraft: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function RenameChatModal({
  conversation,
  draft,
  renamingConversationId,
  inputRef,
  onChangeDraft,
  onClose,
  onSubmit,
}: RenameChatModalProps) {
  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-black/55 px-4">
      <div className="w-full max-w-126 rounded-4xl border border-white/10 bg-[#1E1F20] p-6 shadow-2xl">
        <h2 className="mb-6 text-[1.25rem] leading-none font-semibold text-gray-100">Rename this chat</h2>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => onChangeDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
          }}
          className="w-full rounded-lg border border-[#9DC4FF] bg-[#1E1F20] px-4 py-3 text-lg text-gray-100 outline-none transition focus:border-[#B4D2FF]"
        />
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-6 py-2 text-base font-semibold text-[#BED6FF] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={Boolean(renamingConversationId)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full px-3 py-2 text-base font-semibold text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-gray-500"
            disabled={Boolean(renamingConversationId) || !draft.trim() || draft.trim() === (conversation.title || 'New chat')}
          >
            {renamingConversationId ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </div>
    </div>
  );
}
