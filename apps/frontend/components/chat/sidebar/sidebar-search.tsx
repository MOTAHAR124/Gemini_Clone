import { Search } from 'lucide-react';

import { SidebarSearchProps } from './sidebar.types';

export function SidebarSearch({ isOpen, value, onChange }: SidebarSearchProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-[#232427] px-3 py-2">
      <Search className="h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search chats"
        className="w-full bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-500"
      />
    </div>
  );
}
