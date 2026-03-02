"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadPreview } from "@/components/chat/main";
import { useVoiceRecording } from "@/components/chat/hooks/use-voice-recording";
import { useAuth } from "@/components/ui/auth-provider";
import { ChatModelProfile } from "@/lib/chat-models";
import { api, streamConversationMessage } from "@/lib/api";
import { ChatMessage, Conversation } from "@/lib/types";

export function useChatShell(conversationId: string) {
  const { token, user } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [copiedAssistantId, setCopiedAssistantId] = useState<string | null>(
    null,
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadPreview[]>([]);
  const [pinnedConversationIds, setPinnedConversationIds] = useState<string[]>(
    [],
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharingConversationId, setSharingConversationId] = useState<
    string | null
  >(null);
  const [renameModalConversation, setRenameModalConversation] =
    useState<Conversation | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [renamingConversationId, setRenamingConversationId] = useState<
    string | null
  >(null);
  const [selectedModel, setSelectedModel] = useState<ChatModelProfile>("fast");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const hasInitializedPinnedStorageRef = useRef(false);
  const shouldStickToBottomRef = useRef(true);
  const frameScrollRef = useRef<number | null>(null);
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const { isRecording, toggleVoiceRecording } = useVoiceRecording({
    draft,
    setDraft,
    setError,
  });

  const isEmptyState = !loadingMessages && messages.length === 0;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedPinnedIds = window.localStorage.getItem(
      "chat:pinned-conversations",
    );
    if (!storedPinnedIds) {
      return;
    }
    try {
      const parsed = JSON.parse(storedPinnedIds) as string[];
      if (Array.isArray(parsed)) {
        setPinnedConversationIds(parsed);
      }
    } catch {
      setPinnedConversationIds([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!hasInitializedPinnedStorageRef.current) {
      hasInitializedPinnedStorageRef.current = true;
      return;
    }
    window.localStorage.setItem(
      "chat:pinned-conversations",
      JSON.stringify(pinnedConversationIds),
    );
  }, [pinnedConversationIds]);

  const loadConversations = useCallback(async () => {
    if (!token) {
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    try {
      const data = await api.chat.listConversations(token);
      setConversations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations",
      );
    } finally {
      setLoadingConversations(false);
    }
  }, [token]);

  const loadMessages = useCallback(async () => {
    if (!token) {
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    setError(null);

    try {
      const data = await api.chat.listMessages(token, conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId, token]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const updateAutoScrollPreference = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      shouldStickToBottomRef.current = true;
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 120;
  }, []);

  const scrollToBottomIfNeeded = useCallback(() => {
    if (
      !shouldStickToBottomRef.current ||
      frameScrollRef.current !== null ||
      typeof window === "undefined"
    ) {
      return;
    }

    frameScrollRef.current = window.requestAnimationFrame(() => {
      frameScrollRef.current = null;
      const container = scrollContainerRef.current;
      if (!container || !shouldStickToBottomRef.current) {
        return;
      }
      container.scrollTop = container.scrollHeight;
    });
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      updateAutoScrollPreference();
    };

    updateAutoScrollPreference();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messages.length, updateAutoScrollPreference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    scrollToBottomIfNeeded();
  }, [messages.length, sending, scrollToBottomIfNeeded]);

  useEffect(
    () => () => {
      if (frameScrollRef.current !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(frameScrollRef.current);
      }
      activeRequestControllerRef.current?.abort();
    },
    [],
  );

  const stopGeneration = useCallback(() => {
    activeRequestControllerRef.current?.abort();
    setSending(false);
  }, []);

  useEffect(() => {
    if (!renameModalConversation) {
      return;
    }
    const timer = window.setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 0);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !renamingConversationId) {
        setRenameModalConversation(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [renameModalConversation, renamingConversationId]);

  const createConversation = useCallback(async () => {
    if (!token) {
      return;
    }

    const isCurrentConversationNew = !loadingMessages && messages.length === 0;
    if (isCurrentConversationNew) {
      return;
    }

    try {
      const created = await api.chat.createConversation(token);
      await loadConversations();
      router.push(`/chat/${created.id}`);
      setDraft("");
      setUploadedFiles([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create conversation",
      );
    }
  }, [loadConversations, loadingMessages, messages.length, router, token]);

  const sendMessage = useCallback(
    async (messageOverride?: string) => {
      const messageText = (messageOverride ?? draft).trim();
      if (!token || sending || (!messageText && uploadedFiles.length === 0)) {
        return;
      }

      const createdAt = new Date().toISOString();
      const localUserId = `local-user-${Date.now()}`;
      const localAssistantId = `local-assistant-${Date.now()}`;
      const localUserContent =
        messageText ||
        `Analyze attached file${uploadedFiles.length > 1 ? "s" : ""}.`;
      const filesToSend = [...uploadedFiles];
      const requestController = new AbortController();
      activeRequestControllerRef.current = requestController;

      setDraft("");
      setSending(true);
      setError(null);
      setUploadedFiles([]);
      setMessages((prev) => [
        ...prev,
        {
          id: localUserId,
          role: "user",
          content: localUserContent,
          tokens: 0,
          createdAt,
        },
        {
          id: localAssistantId,
          role: "assistant",
          content: "",
          tokens: 0,
          createdAt,
        },
      ]);

      try {
        if (filesToSend.length > 0) {
          const response = await api.chat.sendWithAttachments(
            token,
            conversationId,
            {
              message: messageText,
              files: filesToSend.map((item) => item.file),
              modelProfile: selectedModel,
              signal: requestController.signal,
            },
          );

          setMessages((prev) =>
            prev.map((item) =>
              item.id === localAssistantId
                ? {
                    ...item,
                    content: response.message,
                  }
                : item,
            ),
          );
        } else {
          await streamConversationMessage({
            token,
            conversationId,
            message: messageText,
            modelProfile: selectedModel,
            signal: requestController.signal,
            onChunk: (chunk) => {
              setMessages((prev) =>
                prev.map((item) =>
                  item.id === localAssistantId
                    ? {
                        ...item,
                        content: item.content + chunk,
                      }
                    : item,
                ),
              );
              scrollToBottomIfNeeded();
            },
            onDone: (fullText) => {
              setMessages((prev) =>
                prev.map((item) =>
                  item.id === localAssistantId
                    ? {
                        ...item,
                        content: fullText,
                      }
                    : item,
                ),
              );
              scrollToBottomIfNeeded();
            },
          });
        }

        await loadConversations();
      } catch (err) {
        const isAborted =
          requestController.signal.aborted ||
          (err instanceof DOMException && err.name === "AbortError");

        if (isAborted) {
          setMessages((prev) =>
            prev.filter(
              (item) =>
                item.id !== localAssistantId || item.content.trim().length > 0,
            ),
          );
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to send message");
        setMessages((prev) =>
          prev.filter((item) => item.id !== localAssistantId),
        );
      } finally {
        if (activeRequestControllerRef.current === requestController) {
          activeRequestControllerRef.current = null;
        }
        setSending(false);
      }
    },
    [
      conversationId,
      draft,
      loadConversations,
      scrollToBottomIfNeeded,
      selectedModel,
      sending,
      token,
      uploadedFiles,
    ],
  );

  const copyText = useCallback(
    async (text: string, messageId: string, isAssistant: boolean) => {
      if (!navigator?.clipboard) {
        return;
      }

      await navigator.clipboard.writeText(text);

      if (isAssistant) {
        setCopiedAssistantId(messageId);
        setTimeout(() => setCopiedAssistantId(null), 1500);
        return;
      }

      setCopiedUserId(messageId);
      setTimeout(() => setCopiedUserId(null), 1500);
    },
    [],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) {
        return;
      }

      const mappedFiles: UploadPreview[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      setUploadedFiles((prev) => [...prev, ...mappedFiles]);

      mappedFiles.forEach((item) => {
        if (!item.type.startsWith("image/")) {
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            return;
          }

          setUploadedFiles((prev) =>
            prev.map((existing) =>
              existing.id === item.id
                ? { ...existing, preview: reader.result as string }
                : existing,
            ),
          );
        };
        reader.readAsDataURL(item.file);
      });

      event.target.value = "";
    },
    [],
  );

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const shareConversation = useCallback(
    async (id: string) => {
      if (typeof window === "undefined") {
        return;
      }
      if (!token) {
        setError("Please sign in to share conversations.");
        return;
      }

      setSharingConversationId(id);
      try {
        const shared = await api.chat.shareConversation(token, id);
        setShareUrl(
          `${window.location.origin}/chat/shared/${shared.shareToken}`,
        );
        setShareModalOpen(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to share conversation",
        );
      } finally {
        setSharingConversationId(null);
      }
    },
    [token],
  );

  const copyShareLink = useCallback(async () => {
    if (typeof window === "undefined" || !shareUrl) {
      return;
    }
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }
    window.prompt("Copy this share link:", shareUrl);
  }, [shareUrl]);

  const shareTo = useCallback(
    (platform: "linkedin" | "facebook" | "x" | "reddit") => {
      if (typeof window === "undefined" || !shareUrl) {
        return;
      }

      const encoded = encodeURIComponent(shareUrl);
      const shareTargets = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
        x: `https://x.com/intent/tweet?url=${encoded}`,
        reddit: `https://www.reddit.com/submit?url=${encoded}`,
      };

      window.open(shareTargets[platform], "_blank", "noopener,noreferrer");
    },
    [shareUrl],
  );

  const togglePinConversation = useCallback((id: string) => {
    setPinnedConversationIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "chat:pinned-conversations",
          JSON.stringify(next),
        );
      }
      return next;
    });
  }, []);

  const openRenameConversationModal = useCallback(
    (conversation: Conversation) => {
      setRenameModalConversation(conversation);
      setRenameDraft(conversation.title || "New chat");
    },
    [],
  );

  const closeRenameConversationModal = useCallback(() => {
    if (renamingConversationId) {
      return;
    }
    setRenameModalConversation(null);
    setRenameDraft("");
  }, [renamingConversationId]);

  const submitRenameConversation = useCallback(async () => {
    if (!token || !renameModalConversation || renamingConversationId) {
      return;
    }

    const nextTitle = renameDraft.trim();
    if (!nextTitle) {
      return;
    }

    if (nextTitle === (renameModalConversation.title || "New chat")) {
      closeRenameConversationModal();
      return;
    }

    setRenamingConversationId(renameModalConversation.id);
    try {
      const updated = await api.chat.renameConversation(
        token,
        renameModalConversation.id,
        nextTitle,
      );
      setConversations((prev) =>
        prev.map((item) =>
          item.id === renameModalConversation.id ? updated : item,
        ),
      );
      setRenameModalConversation(null);
      setRenameDraft("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to rename conversation",
      );
    } finally {
      setRenamingConversationId(null);
    }
  }, [
    closeRenameConversationModal,
    renameDraft,
    renameModalConversation,
    renamingConversationId,
    token,
  ]);

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!token) {
        return;
      }

      const shouldDelete = window.confirm(
        "Delete this conversation? This action cannot be undone.",
      );
      if (!shouldDelete) {
        return;
      }

      try {
        await api.chat.deleteConversation(token, id);
        setConversations((prev) => prev.filter((item) => item.id !== id));
        setPinnedConversationIds((prev) => {
          const next = prev.filter((item) => item !== id);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "chat:pinned-conversations",
              JSON.stringify(next),
            );
          }
          return next;
        });

        if (id === conversationId) {
          router.push("/chat");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete conversation",
        );
      }
    },
    [conversationId, router, token],
  );

  const selectConversation = useCallback(
    (id: string) => {
      router.push(`/chat/${id}`);
    },
    [router],
  );

  return {
    user,
    conversations,
    messages,
    draft,
    loadingMessages,
    loadingConversations,
    sending,
    error,
    copiedUserId,
    copiedAssistantId,
    uploadedFiles,
    pinnedConversationIds,
    shareModalOpen,
    shareUrl,
    sharingConversationId,
    renameModalConversation,
    renameDraft,
    renamingConversationId,
    selectedModel,
    isRecording,
    fileInputRef,
    renameInputRef,
    bottomRef,
    scrollContainerRef,
    isEmptyState,
    setDraft,
    setRenameDraft,
    setSelectedModel,
    setShareModalOpen,
    createConversation,
    sendMessage,
    stopGeneration,
    copyText,
    handleFileChange,
    removeFile,
    shareConversation,
    copyShareLink,
    shareTo,
    togglePinConversation,
    openRenameConversationModal,
    closeRenameConversationModal,
    submitRenameConversation,
    toggleVoiceRecording,
    deleteConversation,
    selectConversation,
  };
}
