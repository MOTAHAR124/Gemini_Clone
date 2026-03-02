import clsx from 'clsx';
import { Mic } from 'lucide-react';

interface ChatMicButtonProps {
  isRecording: boolean;
  onToggleVoiceRecording: () => void;
}

export function ChatMicButton({ isRecording, onToggleVoiceRecording }: ChatMicButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggleVoiceRecording}
      className={clsx(
        'rounded-full p-2.5 text-gray-300 transition hover:bg-white/10 hover:text-white',
        isRecording ? 'animate-pulse bg-[#2f3338] text-[#9DC4FF]' : '',
      )}
      aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
      aria-pressed={isRecording}
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}
