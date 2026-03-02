'use client';

import clsx from 'clsx';
import { Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-2xl border border-white/10 bg-[#121826]">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2 right-2 z-[1] inline-flex items-center gap-1.5 rounded-md bg-[#1e2637] px-2 py-1 text-xs text-gray-200 transition hover:bg-[#283249]"
        aria-label="Copy code"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <SyntaxHighlighter
        style={oneDark as any}
        language={language}
        PreTag="pre"
        codeTagProps={{
          style: {
            background: 'transparent',
          },
        }}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '40px 14px 14px',
          fontSize: 13,
          background: 'transparent',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownView({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={clsx(
        'max-w-none text-[15px] leading-7 text-gray-200',
        '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold',
        '[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold',
        '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold',
        '[&_p]:my-3 [&_p]:leading-8',
        '[&_strong]:font-semibold [&_strong]:text-gray-100',
        '[&_em]:italic',
        '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6',
        '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6',
        '[&_li]:leading-8',
        '[&_hr]:my-4 [&_hr]:border-white/15',
        '[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-gray-300',
        '[&_a]:text-blue-300 hover:[&_a]:text-blue-200',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const language = match?.[1];
            const codeText = String(children).replace(/\n$/, '');
            const isMultilineCode = codeText.includes('\n');

            if (language || isMultilineCode) {
              return <CodeBlock code={codeText} language={language} />;
            }

            return (
              <code className="rounded-md bg-[#1d2230] px-1.5 py-0.5 text-[0.92em] text-[#dbe7ff]">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
