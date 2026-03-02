import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  EllipsisVertical,
  RotateCcw,
  SquarePen,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import type { RefObject } from "react";

import { ChatMessage } from "@/lib/types";
import { MarkdownView } from "@/components/ui/markdown-view";

interface ChatMessageListProps {
  messages: ChatMessage[];
  sending: boolean;
  copiedUserId: string | null;
  copiedAssistantId: string | null;
  onReusePrompt: (content: string) => void;
  onCopyMessage: (
    content: string,
    messageId: string,
    isAssistant: boolean,
  ) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export function ChatMessageList({
  messages,
  sending,
  copiedUserId,
  copiedAssistantId,
  onReusePrompt,
  onCopyMessage,
  bottomRef,
  scrollContainerRef,
}: ChatMessageListProps) {
  const lastAssistantMessageId =
    [...messages].reverse().find((item) => item.role === "assistant")?.id ??
    null;

  return (
    <section
      ref={scrollContainerRef}
      className="h-full w-full overflow-y-auto [overflow-anchor:none] px-4 pt-24 pb-56 md:px-8"
    >
      <div className="mx-auto w-full max-w-190 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isLastAssistantMessage =
              message.id === lastAssistantMessageId;
            const isStreamingAssistant = sending && isLastAssistantMessage;

            return message.role === "user" ? (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="group flex justify-end"
              >
                <div className="flex max-w-[88%] items-start gap-2">
                  <div className="mt-2 flex items-center gap-2 opacity-0 transition duration-150 group-hover:opacity-100">
                    <button
                      onClick={() => onReusePrompt(message.content)}
                      className="pointer-events-none text-gray-400 transition hover:text-white group-hover:pointer-events-auto"
                      aria-label="Reuse prompt"
                    >
                      <SquarePen size={16} />
                    </button>
                    <button
                      onClick={() =>
                        onCopyMessage(message.content, message.id, false)
                      }
                      className="pointer-events-none text-gray-400 transition hover:text-white group-hover:pointer-events-auto"
                      aria-label="Copy prompt"
                    >
                      {copiedUserId === message.id ? (
                        <Check size={16} className="text-white" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <p className="rounded-[24px_8px_30px_24px] bg-[#272c34] px-4 py-3 text-sm text-gray-100 sm:text-base">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="flex items-start gap-3"
              >
                <div className="relative mt-0.5 grid h-8 w-8 shrink-0 place-items-center">
                  <Image
                    src="/sparkle-icon.svg"
                    alt="Gemini"
                    width={22}
                    height={22}
                    className="h-8.5 w-8.5"
                  />
                  {isStreamingAssistant ? (
                    <video
                      src="/sparkle-loading.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="pointer-events-none absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
                      aria-label="Gemini loading animation"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="p-1 text-gray-200">
                    {isStreamingAssistant ? (
                      <p className="min-h-7 font-sans text-[15px] leading-7 whitespace-pre-wrap text-gray-200">
                        {message.content || "\u00A0"}
                      </p>
                    ) : (
                      <MarkdownView
                        content={message.content || ""}
                        className="font-sans text-[15px] leading-7 text-gray-200"
                      />
                    )}
                  </div>
                  {isLastAssistantMessage &&
                  message.content.trim() &&
                  !isStreamingAssistant ? (
                    <div className="mt-2 flex items-center gap-0.5 text-gray-400">
                      <button
                        type="button"
                        className="group relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white"
                        aria-label="Like response"
                      >
                        <ThumbsUp size={17} />
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#ececec] px-2 py-1 text-[13px] font-medium whitespace-nowrap text-[#2b2b2b] opacity-0 shadow-md transition group-hover:opacity-100">
                          Good Response
                        </span>
                      </button>
                      <button
                        type="button"
                        className="group relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white"
                        aria-label="Dislike response"
                      >
                        <ThumbsDown size={17} />
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#ececec] px-2 py-1 text-[13px] font-medium whitespace-nowrap text-[#2b2b2b] opacity-0 shadow-md transition group-hover:opacity-100">
                          Bad Response
                        </span>
                      </button>
                      <button
                        type="button"
                        className="group relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white"
                        aria-label="Regenerate response"
                      >
                        <RotateCcw size={17} />
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#ececec] px-2 py-1 text-[13px] font-medium whitespace-nowrap text-[#2b2b2b] opacity-0 shadow-md transition group-hover:opacity-100">
                          Redo
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onCopyMessage(message.content, message.id, true)
                        }
                        className="group relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white"
                        aria-label="Copy response"
                      >
                        {copiedAssistantId === message.id ? (
                          <Check size={17} />
                        ) : (
                          <Copy size={17} />
                        )}
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#ececec] px-2 py-1 text-[13px] font-medium whitespace-nowrap text-[#2b2b2b] opacity-0 shadow-md transition group-hover:opacity-100">
                          Copy Response
                        </span>
                      </button>
                      <button
                        type="button"
                        className="group relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white"
                        aria-label="More options"
                      >
                        <EllipsisVertical size={17} />
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#ececec] px-2 py-1 text-[13px] font-medium whitespace-nowrap text-[#2b2b2b] opacity-0 shadow-md transition group-hover:opacity-100">
                          More
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
