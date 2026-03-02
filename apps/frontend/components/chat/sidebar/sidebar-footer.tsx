'use client';

import clsx from 'clsx';
import { BookOpenText, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { SidebarFooterProps } from './sidebar.types';

export function SidebarFooter({ menuOpen }: SidebarFooterProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!panelRef.current?.contains(target)) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [settingsOpen]);

  return (
    <div className={clsx('relative p-3 pb-8', menuOpen ? '' : 'flex justify-center')} ref={panelRef}>
      <button
        type="button"
        onClick={() => setSettingsOpen((current) => !current)}
        className={clsx(
          'inline-flex cursor-pointer items-center rounded-xl text-gray-300 transition hover:bg-white/10 hover:text-gray-100',
          menuOpen ? 'w-full px-0 py-0 text-sm font-bold' : 'h-10 w-10 justify-center p-0',
        )}
        aria-label="Settings and help"
        aria-expanded={settingsOpen}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
          <Settings className="h-5 w-5" />
        </span>
        {menuOpen ? <span>Settings and help</span> : null}
      </button>

      {settingsOpen ? (
        <div
          className={clsx(
            'absolute bottom-[4.5rem] z-40 min-w-56 rounded-2xl border border-white/10 bg-[#202327] p-2 shadow-[0_16px_44px_rgba(0,0,0,0.45)]',
            menuOpen ? 'left-3 right-3' : 'left-3',
          )}
        >
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              window.open('/system-design', '_blank', 'noopener,noreferrer');
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10 hover:text-white"
          >
            <BookOpenText className="h-4 w-4" />
            <span>System Design</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
