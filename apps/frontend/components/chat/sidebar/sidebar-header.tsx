import clsx from 'clsx';
import { Menu, Search } from 'lucide-react';

import { SidebarHeaderProps } from './sidebar.types';

export function SidebarHeader({ menuOpen, searchOpen, onToggleMenu, onToggleSearch }: SidebarHeaderProps) {
  return (
    <div className={clsx('flex items-center p-3 pt-6', menuOpen ? '' : 'justify-center')}>
      <button
        type="button"
        onClick={onToggleMenu}
        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-gray-200"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      {menuOpen ? (
        <button
          type="button"
          onClick={onToggleSearch}
          className={clsx(
            'ml-auto cursor-pointer rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-gray-200',
            searchOpen ? 'bg-white/10 text-gray-200' : '',
          )}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
