'use client';

import { useEffect, useState } from 'react';
import { CircleUserRound } from 'lucide-react';
import Image from 'next/image';

import { ChatAccountPopup } from './chat-account-popup';
import { getAvatarImageSrc } from '@/lib/avatar';
import { UserProfile } from '@/lib/types';

interface ChatMainHeaderProps {
  user?: UserProfile | null;
  initials: (name?: string) => string;
}

export function ChatMainHeader({ user, initials }: ChatMainHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarSrc = getAvatarImageSrc(user?.avatarUrl);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatarUrl]);

  useEffect(() => {
    if (!profileOpen) {
      setAvatarFailed(false);
    }
  }, [profileOpen]);

  return (
    <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-5 py-5 md:px-8">
      <h1 className="text-xl font-medium text-gray-100">Gemini</h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-haspopup="dialog"
          aria-expanded={profileOpen}
          className="cursor-pointer"
        >
          <div className="grid h-11 w-11 -rotate-30 place-items-center rounded-full bg-[conic-gradient(#ef4444_0deg_90deg,#3b82f6_90deg_180deg,#22c55e_180deg_270deg,#eab308_270deg_360deg)] p-0.5">
            <div className="grid h-full w-full rotate-30 place-items-center rounded-full bg-[#0f1114] p-0.5">
              <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#2a2b2d] text-xs font-semibold text-gray-100">
                {avatarSrc && !avatarFailed ? (
                  <Image
                    key={`${avatarSrc}-${profileOpen ? 'open' : 'closed'}`}
                    src={avatarSrc}
                    alt={user?.name || 'User avatar'}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center">{user ? initials(user.name).slice(0, 1) : <CircleUserRound className="h-5 w-5" />}</span>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      <ChatAccountPopup user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
