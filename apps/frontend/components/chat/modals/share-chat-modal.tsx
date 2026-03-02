import { Copy, X } from 'lucide-react';

interface ShareChatModalProps {
  shareUrl: string;
  onClose: () => void;
  onCopyLink: () => void;
  onShareTo: (platform: 'linkedin' | 'facebook' | 'x' | 'reddit') => void;
}

export function ShareChatModal({ shareUrl, onClose, onCopyLink, onShareTo }: ShareChatModalProps) {
  return (
    <div className="fixed inset-0 z-75 grid place-items-center bg-black/55 px-4">
      <div className="w-full max-w-120 rounded-4xl border border-white/10 bg-[#1E1F20] shadow-2xl">
        <div className="border-b border-white/10 p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[1.25rem] leading-none font-semibold text-gray-100">Shareable public link</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close share dialog"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#313337] p-1.5 pl-4">
            <p className="min-w-0 flex-1 truncate text-sm text-gray-200 underline decoration-gray-500 underline-offset-4">{shareUrl}</p>
            <button
              type="button"
              onClick={onCopyLink}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#9DC4FF] px-4 py-2 text-sm font-medium text-[#1c3155] transition hover:bg-[#b3d2ff]"
            >
              <Copy className="h-4 w-4" />
              <span>Copy link</span>
            </button>
          </div>

          <p className="mt-5 text-sm leading-5 text-gray-400">Public links can be reshared. Share responsibly, delete at any time.</p>
        </div>

        <div className="flex items-center justify-center gap-8 p-5">
          <button type="button" onClick={() => onShareTo('linkedin')} className="text-center text-gray-100">
            <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-[#0A66C2] text-lg font-bold text-white">in</span>
            <span className="text-xs">LinkedIn</span>
          </button>
          <button type="button" onClick={() => onShareTo('facebook')} className="text-center text-gray-100">
            <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-[#1877F2] text-2xl font-bold text-white">f</span>
            <span className="text-xs">Facebook</span>
          </button>
          <button type="button" onClick={() => onShareTo('x')} className="text-center text-gray-100">
            <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-black text-2xl font-bold text-white">X</span>
            <span className="text-xs">X</span>
          </button>
          <button type="button" onClick={() => onShareTo('reddit')} className="text-center text-gray-100">
            <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-[#FF4500] text-lg font-bold text-white">r</span>
            <span className="text-xs">Reddit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
