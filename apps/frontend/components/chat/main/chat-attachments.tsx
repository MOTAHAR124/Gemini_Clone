import clsx from 'clsx';
import { File, FileText, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export interface UploadPreview {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface ChatAttachmentsProps {
  files: UploadPreview[];
  compact?: boolean;
  onRemove: (id: string) => void;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function ChatAttachments({ files, compact, onRemove }: ChatAttachmentsProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={clsx('mb-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto', compact ? 'px-1' : '')}>
      {files.map((file) => (
        <div key={file.id} className="flex max-w-xs items-center gap-2 rounded-lg bg-[#202124] p-2">
          {file.preview ? (
            <Image
              src={file.preview}
              alt={file.name}
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded object-cover"
            />
          ) : file.type.startsWith('image/') ? (
            <ImageIcon size={16} className="text-blue-300" />
          ) : file.type.includes('text') || file.type.includes('document') ? (
            <FileText size={16} className="text-emerald-300" />
          ) : (
            <File size={16} className="text-gray-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-200">{file.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
          </div>
          <button type="button" onClick={() => onRemove(file.id)} className="text-gray-400 transition hover:text-red-300" aria-label="Remove file">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
