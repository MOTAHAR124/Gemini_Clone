import clsx from 'clsx';
import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { ChatAttachMenu } from './chat-attach-menu';
import { ChatMicButton } from './chat-mic-button';
import { ChatModel, ChatModelSelector } from './chat-model-selector';

interface ChatComposerProps {
  draft: string;
  sending: boolean;
  hasFiles: boolean;
  hero?: boolean;
  onChangeDraft: (value: string) => void;
  onUploadFiles: () => void;
  onAddFromDrive: () => void;
  onAddPhotos: () => void;
  onImportCode: () => void;
  onOpenNotebookLm: () => void;
  model: ChatModel;
  onChangeModel: (model: ChatModel) => void;
  isRecording: boolean;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
  onStopGeneration: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatComposer({
  draft,
  sending,
  hasFiles,
  hero,
  onChangeDraft,
  onUploadFiles,
  onAddFromDrive,
  onAddPhotos,
  onImportCode,
  onOpenNotebookLm,
  model,
  onChangeModel,
  isRecording,
  onToggleVoiceRecording,
  onSend,
  onStopGeneration,
  onKeyDown,
}: ChatComposerProps) {
  const conversationMode = !hero;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const minTextareaHeight = hero ? 72 : 40;
  const maxTextareaHeight = hero ? 280 : 220;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = '0px';
    const nextHeight = Math.max(
      minTextareaHeight,
      Math.min(textarea.scrollHeight, maxTextareaHeight),
    );
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxTextareaHeight ? 'auto' : 'hidden';
  }, [draft, minTextareaHeight, maxTextareaHeight]);

  return (
    <div
      className={clsx(
        'relative z-10 w-full rounded-4xl border border-white/10 bg-[#1E1F20] px-6 pb-12',
        hero ? 'mt-10 min-h-24 pt-4' : 'min-h-20 pt-3',
      )}
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => onChangeDraft(event.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Ask Gemini 3"
        style={{ minHeight: `${minTextareaHeight}px`, maxHeight: `${maxTextareaHeight}px` }}
        className="w-full resize-none bg-transparent text-base leading-8 text-[#e8eaed] outline-none placeholder:text-[#bdc1c6]"
      />

      <div className="absolute right-4 bottom-3 left-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChatAttachMenu
            onUploadFiles={onUploadFiles}
            onAddFromDrive={onAddFromDrive}
            onAddPhotos={onAddPhotos}
            onImportCode={onImportCode}
            onOpenNotebookLm={onOpenNotebookLm}
            conversationMode={conversationMode}
          />

        </div>

        <div className="flex items-center gap-2">
          <ChatModelSelector model={model} onChangeModel={onChangeModel} conversationMode={conversationMode} />
          {sending ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-[#262c34] transition hover:bg-[#303741]"
              aria-label="Stop generating"
            >
              <span className="h-3.5 w-3.5 rounded-[4px] bg-[#a8c3ff]" />
            </button>
          ) : draft.trim() || hasFiles ? (
            <button
              type="button"
              onClick={onSend}
              className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Send"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          ) : (
            <ChatMicButton isRecording={isRecording} onToggleVoiceRecording={onToggleVoiceRecording} />
          )}
        </div>
      </div>
    </div>
  );
}
