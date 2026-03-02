'use client';

import { FileUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface DropzonePanelProps {
  accept: Record<string, string[]>;
  maxFiles?: number;
  onFiles: (files: File[]) => void;
  title: string;
  description: string;
  disabled?: boolean;
}

export function DropzonePanel({
  accept,
  maxFiles = 1,
  onFiles,
  title,
  description,
  disabled,
}: DropzonePanelProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    disabled,
    onDropAccepted: onFiles,
  });

  return (
    <button
      type="button"
      {...getRootProps()}
      className={[
        'w-full rounded-2xl border border-dashed px-5 py-8 text-left transition',
        isDragActive
          ? 'border-tide bg-tide/5'
          : 'border-slate/30 bg-white/70 hover:border-slate/50 hover:bg-white',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      ].join(' ')}
    >
      <input {...getInputProps()} />
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-mist p-2 text-tide">
          <FileUp className="h-5 w-5" />
        </div>
        <div>
          <p className="[font-family:var(--font-heading)] text-lg font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm text-slate">{description}</p>
          <p className="mt-3 text-xs text-slate/80">Drag and drop or click to select file</p>
        </div>
      </div>
    </button>
  );
}
