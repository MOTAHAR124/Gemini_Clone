import { Conversation } from '@/lib/types';

export interface ChatSidebarProps {
  conversationId: string;
  conversations: Conversation[];
  loadingConversations: boolean;
  pinnedConversationIds: string[];
  sharingConversationId: string | null;
  onCreateConversation: () => void | Promise<void>;
  onSelectConversation: (conversationId: string) => void;
  onShareConversation: (conversationId: string) => void | Promise<void>;
  onTogglePinConversation: (conversationId: string) => void;
  onOpenRenameConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void | Promise<void>;
}

export interface SidebarSearchProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
}

export interface SidebarHeaderProps {
  menuOpen: boolean;
  searchOpen: boolean;
  onToggleMenu: () => void;
  onToggleSearch: () => void;
}

export interface SidebarNewChatButtonProps {
  menuOpen: boolean;
  onCreateConversation: () => void;
}

export interface SidebarFooterProps {
  menuOpen: boolean;
}

export interface SidebarConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isPinned: boolean;
  isMenuOpen: boolean;
  menuOpen: boolean;
  sharingConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onToggleMenu: (conversationId: string) => void;
  onShareConversation: (conversationId: string) => void | Promise<void>;
  onTogglePinConversation: (conversationId: string) => void;
  onOpenRenameConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void | Promise<void>;
}
