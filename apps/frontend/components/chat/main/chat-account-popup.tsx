'use client';

import { useEffect, useState } from 'react';
import { ArrowRightFromLine, Camera, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/ui/auth-provider';
import { api } from '@/lib/api';
import { getAvatarImageSrc } from '@/lib/avatar';
import { UserProfile } from '@/lib/types';

interface ChatAccountPopupProps {
  user?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const POPUP_ANIMATION_MS = 420;

function firstLetter(name?: string) {
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName?.[0]?.toUpperCase() || 'U';
}

export function ChatAccountPopup({ user, isOpen, onClose }: ChatAccountPopupProps) {
  const [popupMounted, setPopupMounted] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [showMoreAccounts, setShowMoreAccounts] = useState(true);
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, true>>({});
  const router = useRouter();
  const { logout, recentAccounts } = useAuth();

  const otherAccounts = recentAccounts.filter((account) => account.email !== user?.email);
  const badgeColors = ['bg-[#4b6bff]', 'bg-[#8aa2b2]', 'bg-[#e6468f]', 'bg-[#2f9e63]', 'bg-[#9f58ff]'];
  const canShowImage = (url?: string) => Boolean(url && !failedImageUrls[url]);

  const markImageFailed = (url?: string) => {
    if (!url) {
      return;
    }
    setFailedImageUrls((current) => (current[url] ? current : { ...current, [url]: true }));
  };

  useEffect(() => {
    if (isOpen) {
      setPopupMounted(true);
      const raf = window.requestAnimationFrame(() => {
        setPopupVisible(true);
      });
      return () => window.cancelAnimationFrame(raf);
    }

    setPopupVisible(false);
    const timeoutId = window.setTimeout(() => {
      setPopupMounted(false);
    }, POPUP_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFailedImageUrls({});
    }
  }, [isOpen, user?.avatarUrl]);

  if (!popupMounted) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-20 bg-black/35 ${popupVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ transition: 'opacity 360ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        aria-label="Close profile popup"
        onClick={onClose}
      />
      <section
        aria-hidden={!popupVisible}
        className={`fixed top-22 right-4 z-30 w-[min(92vw,390px)] origin-top-right rounded-4xl border border-white/8 bg-[#24272f] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.6)] transform-gpu md:right-8 ${
          popupVisible ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : '-translate-y-2 scale-[0.98] opacity-0 pointer-events-none'
        }`}
        style={{
          willChange: 'opacity, transform',
          transition: 'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-full text-gray-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-center text-sm font-medium text-gray-100">{user?.email || 'No email available'}</p>

        <div className="mt-7 flex flex-col items-center">
          <div className="relative">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-[conic-gradient(#ef4444_0deg_90deg,#3b82f6_90deg_180deg,#22c55e_180deg_270deg,#eab308_270deg_360deg)] p-0.75">
              <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#111317]">
                {canShowImage(user?.avatarUrl) ? (
                  <Image
                    src={getAvatarImageSrc(user?.avatarUrl)!}
                    alt={user?.name || 'User avatar'}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    onError={() => markImageFailed(user?.avatarUrl)}
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-4xl font-semibold leading-none text-white">
                    {user ? firstLetter(user.name) : 'U'}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="absolute right-1 bottom-1 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-[#0f1114] text-gray-200 hover:bg-[#181b21]"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-[1.3rem] font-normal text-gray-100">Hi, {user?.name?.split(' ')[0] || 'User'}!</p>
          <a
            href="https://myaccount.google.com"
            target="_blank"
            rel="noreferrer"
            className="mt-5 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-[#8ab4f8]! visited:text-[#8ab4f8]! transition hover:border-white/45 hover:text-[#a8c7fa]!"
          >
            Manage your Google Account
          </a>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/6 bg-[#181a1f]">
          <button
            type="button"
            onClick={() => setShowMoreAccounts((current) => !current)}
            className="flex w-full items-center justify-between border-b border-white/8 px-4 py-3 text-left text-lg font-medium text-gray-100 transition hover:bg-white/5"
          >
            <span className="text-sm">{showMoreAccounts ? 'Hide more accounts' : 'Show more accounts'}</span>
            <span className="flex items-center gap-2">
              {!showMoreAccounts
                ? otherAccounts.slice(0, 2).map((account, index) =>
                    canShowImage(account.avatarUrl) ? (
                      <span key={account.email} className="h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={getAvatarImageSrc(account.avatarUrl)!}
                          alt={account.name || 'Account avatar'}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                          onError={() => markImageFailed(account.avatarUrl)}
                        />
                      </span>
                    ) : (
                      <span
                        key={account.email}
                        className={`grid h-8 w-8 place-items-center rounded-full text-sm font-medium text-white ${badgeColors[index % badgeColors.length]}`}
                      >
                        {firstLetter(account.name)}
                      </span>
                    ),
                  )
                : null}
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/8">
                {showMoreAccounts ? <ChevronUp className="h-4 w-4 text-gray-300" /> : <ChevronDown className="h-4 w-4 text-gray-300" />}
              </span>
            </span>
          </button>

          {showMoreAccounts
            ? otherAccounts.map((account, index) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    const targetUrl = `/chat?switchAccount=${encodeURIComponent(account.email)}`;
                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 border-b border-white/8 px-4 py-3 text-left transition hover:bg-white/5"
                >
                  {canShowImage(account.avatarUrl) ? (
                    <span className="h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={getAvatarImageSrc(account.avatarUrl)!}
                        alt={account.name || 'Account avatar'}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        onError={() => markImageFailed(account.avatarUrl)}
                      />
                    </span>
                  ) : (
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-sm font-medium text-white ${badgeColors[index % badgeColors.length]}`}
                    >
                      {firstLetter(account.name)}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm font-medium text-gray-100">{account.name}</span>
                    <span className="block text-xs text-gray-300">{account.email}</span>
                  </span>
                </button>
              ))
            : null}

          {showMoreAccounts ? (
            <button
              type="button"
              onClick={() => {
                window.open(api.auth.googleUrl, '_blank', 'noopener,noreferrer');
              }}
              className="flex w-full items-center gap-3 border-b border-white/8 px-4 py-3 text-left transition hover:bg-white/5"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/8 text-gray-200">
                <Plus className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-gray-100">Add another account</span>
            </button>
          ) : null}

          {showMoreAccounts ? (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
                router.replace('/login');
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
            >
              <ArrowRightFromLine className="h-5 w-5 text-gray-300" />
              <span className="text-sm font-medium text-gray-100">Sign out of all accounts</span>
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-gray-300">
          <button type="button" className="transition hover:text-white">
            Privacy policy
          </button>
          <span>&middot;</span>
          <button type="button" className="transition hover:text-white">
            Terms of Service
          </button>
        </div>
      </section>
    </>
  );
}
