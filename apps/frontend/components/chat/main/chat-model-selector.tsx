import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ChatModelProfile } from '@/lib/chat-models';

export type ChatModel = ChatModelProfile;

interface ModelOption {
  id: ChatModel;
  label: string;
  description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  { id: 'fast', label: 'Fast', description: 'Answers quickly' },
  { id: 'thinking', label: 'Thinking', description: 'Solves complex problems' },
  { id: 'pro', label: 'Pro', description: 'Advanced maths and code with 3.1 Pro' },
];

interface ChatModelSelectorProps {
  model: ChatModel;
  onChangeModel: (model: ChatModel) => void;
  conversationMode?: boolean;
}

export function ChatModelSelector({ model, onChangeModel, conversationMode = false }: ChatModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  const selectedOption = MODEL_OPTIONS.find((option) => option.id === model) ?? MODEL_OPTIONS[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={
          conversationMode
            ? 'flex items-center gap-1 rounded-full px-4 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white'
            : 'flex items-center gap-1 rounded-full px-4 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white'
        }
      >
        <span className="text-base">{selectedOption.label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className={
            conversationMode
              ? 'absolute right-0 bottom-[calc(100%+10px)] z-40 w-84 rounded-3xl border border-white/10 bg-[#2a2d31] p-4 shadow-2xl'
              : 'absolute top-[calc(100%+10px)] left-0 z-40 w-84 rounded-3xl border border-white/10 bg-[#2a2d31] p-4 shadow-2xl'
          }
        >
          <p className="mb-1 text-sm font-semibold text-gray-100">Gemini 3</p>
          <div className="space-y-0.5">
            {MODEL_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChangeModel(option.id);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-2xl px-2 py-1.5 text-left transition hover:bg-white/10"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-100">{option.label}</p>
                  <p className="text-sm text-gray-300">{option.description}</p>
                </div>
                {option.id === model ? (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#9DC4FF] text-[#1d3154]">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
