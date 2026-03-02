"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  ChatAttachments,
  ChatComposer,
  ChatMainHeader,
  ChatMessageList,
} from "@/components/chat/main";
import { RenameChatModal, ShareChatModal } from "@/components/chat/modals";
import { ChatSidebar } from "@/components/chat/sidebar";
import { useChatShell } from "@/components/chat/hooks/use-chat-shell";

interface ChatShellProps {
  conversationId: string;
}

function initials(name?: string) {
  if (!name) {
    return "U";
  }
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || "U";
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function ChatShell({ conversationId }: ChatShellProps) {
  const {
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
    setSelectedModel,
    setRenameDraft,
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
  } = useChatShell(conversationId);

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const openFilePicker = (accept: string) => {
    const input = fileInputRef.current;
    if (!input) {
      return;
    }
    input.accept = accept;
    input.click();
    input.accept = "*/*";
  };

  const insertCodePrompt = () => {
    const prompt =
      "Review this code and suggest fixes for bugs, performance issues, and readability.";
    setDraft((current) =>
      current.trim() ? `${current.trim()}\n\n${prompt}` : prompt,
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#131314] text-[#e3e3e3]">
      <ChatSidebar
        conversationId={conversationId}
        conversations={conversations}
        loadingConversations={loadingConversations}
        pinnedConversationIds={pinnedConversationIds}
        sharingConversationId={sharingConversationId}
        onCreateConversation={createConversation}
        onSelectConversation={selectConversation}
        onShareConversation={shareConversation}
        onTogglePinConversation={togglePinConversation}
        onOpenRenameConversation={openRenameConversationModal}
        onDeleteConversation={deleteConversation}
      />

      <main className="relative flex-1">
        <ChatMainHeader user={user} initials={initials} />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {loadingMessages ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading messages...</span>
          </div>
        ) : isEmptyState ? (
          <section className="flex h-full items-center justify-center px-4 pt-24 pb-52 md:px-8">
            <div className="w-full max-w-181.5">
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <Image
                    src="/sparkle-icon.svg"
                    alt="Gemini"
                    width={34}
                    height={34}
                    className="h-8 w-8"
                  />
                  <p className="text-3xl font-normal text-[#f5f5f5]">Hi Md</p>
                </div>
                <p className="mt-1 text-4xl font-normal leading-tight text-[#f5f5f5]">
                  Where should we start?
                </p>
              </div>
              <div className="mt-10 w-full">
                <ChatAttachments
                  files={uploadedFiles}
                  compact
                  onRemove={removeFile}
                />
                <ChatComposer
                  draft={draft}
                  sending={sending}
                  hasFiles={uploadedFiles.length > 0}
                  hero
                  onChangeDraft={setDraft}
                  onUploadFiles={() => openFilePicker("*/*")}
                  onAddFromDrive={() =>
                    window.open(
                      "https://drive.google.com",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  onAddPhotos={() => openFilePicker("image/*")}
                  onImportCode={insertCodePrompt}
                  onOpenNotebookLm={() =>
                    window.open(
                      "https://notebooklm.google.com",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  model={selectedModel}
                  onChangeModel={setSelectedModel}
                  isRecording={isRecording}
                  onToggleVoiceRecording={toggleVoiceRecording}
                  onSend={() => void sendMessage()}
                  onStopGeneration={stopGeneration}
                  onKeyDown={handleComposerKeyDown}
                />
              </div>
              {error ? (
                <p className="mt-4 text-center text-sm text-red-300">{error}</p>
              ) : null}
            </div>
          </section>
        ) : (
          <>
            <ChatMessageList
              messages={messages}
              sending={sending}
              copiedUserId={copiedUserId}
              copiedAssistantId={copiedAssistantId}
              onReusePrompt={setDraft}
              onCopyMessage={(content, id, isAssistant) =>
                void copyText(content, id, isAssistant)
              }
              bottomRef={bottomRef}
              scrollContainerRef={scrollContainerRef}
            />

            <div className="absolute right-0 bottom-0 left-0 z-40 px-4 py-4">
              <div className="mx-auto w-full max-w-190">
                <ChatAttachments files={uploadedFiles} onRemove={removeFile} />
                <ChatComposer
                  draft={draft}
                  sending={sending}
                  hasFiles={uploadedFiles.length > 0}
                  onChangeDraft={setDraft}
                  onUploadFiles={() => openFilePicker("*/*")}
                  onAddFromDrive={() =>
                    window.open(
                      "https://drive.google.com",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  onAddPhotos={() => openFilePicker("image/*")}
                  onImportCode={insertCodePrompt}
                  onOpenNotebookLm={() =>
                    window.open(
                      "https://notebooklm.google.com",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  model={selectedModel}
                  onChangeModel={setSelectedModel}
                  isRecording={isRecording}
                  onToggleVoiceRecording={toggleVoiceRecording}
                  onSend={() => void sendMessage()}
                  onStopGeneration={stopGeneration}
                  onKeyDown={handleComposerKeyDown}
                />
                <p className="pt-2 text-center text-xs text-gray-400">
                  Gemini may display inaccurate info, including about people, so
                  double-check responses.
                </p>
                {error ? (
                  <p className="pt-1 text-center text-xs text-red-300">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}

        {renameModalConversation ? (
          <RenameChatModal
            conversation={renameModalConversation}
            draft={renameDraft}
            renamingConversationId={renamingConversationId}
            inputRef={renameInputRef}
            onChangeDraft={setRenameDraft}
            onClose={closeRenameConversationModal}
            onSubmit={() => void submitRenameConversation()}
          />
        ) : null}

        {shareModalOpen ? (
          <ShareChatModal
            shareUrl={shareUrl}
            onClose={() => setShareModalOpen(false)}
            onCopyLink={() => void copyShareLink()}
            onShareTo={shareTo}
          />
        ) : null}
      </main>
    </div>
  );
}
