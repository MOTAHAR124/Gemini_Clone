import { BookOpen, Code, FolderOpen, Image as ImageIcon, Paperclip, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatAttachMenuProps {
  onUploadFiles: () => void;
  onAddFromDrive: () => void;
  onAddPhotos: () => void;
  onImportCode: () => void;
  onOpenNotebookLm: () => void;
  conversationMode?: boolean;
}

export function ChatAttachMenu({
  onUploadFiles,
  onAddFromDrive,
  onAddPhotos,
  onImportCode,
  onOpenNotebookLm,
  conversationMode = false,
}: ChatAttachMenuProps) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAttachMenu) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!attachMenuRef.current?.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showAttachMenu]);

  const runAttachAction = (action: () => void) => {
    action();
    setShowAttachMenu(false);
  };

  return (
    <div className="relative" ref={attachMenuRef}>
      <button
        type="button"
        onClick={() => setShowAttachMenu((current) => !current)}
        className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
        aria-label="Attach files"
        aria-expanded={showAttachMenu}
        aria-haspopup="menu"
      >
        <Plus className="h-5 w-5" />
      </button>

      {showAttachMenu ? (
        <div
          className={
            conversationMode
              ? 'absolute bottom-[calc(100%+10px)] left-0 z-40 w-58 rounded-3xl border border-white/8 bg-[#1f2227] p-2 shadow-2xl'
              : 'absolute top-[calc(100%+10px)] left-0 z-40 w-[13.6rem] rounded-3xl border border-white/10 bg-[#2a2d31] p-2 shadow-2xl'
          }
        >
          <button
            type="button"
            onClick={() => runAttachAction(onUploadFiles)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-gray-100 transition hover:bg-white/10"
          >
            <Paperclip className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium">Upload files</span>
          </button>
          <button
            type="button"
            onClick={() => runAttachAction(onAddFromDrive)}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-gray-100 transition hover:bg-white/10"
          >
            <FolderOpen className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium">Add from Drive</span>
          </button>
          <button
            type="button"
            onClick={() => runAttachAction(onAddPhotos)}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-gray-100 transition hover:bg-white/10"
          >
            <ImageIcon className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium">Photos</span>
          </button>
          <button
            type="button"
            onClick={() => runAttachAction(onImportCode)}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-gray-100 transition hover:bg-white/10"
          >
            <Code className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium">Import code</span>
          </button>
          <button
            type="button"
            onClick={() => runAttachAction(onOpenNotebookLm)}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-gray-100 transition hover:bg-white/10"
          >
            <BookOpen className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium">NotebookLM</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
