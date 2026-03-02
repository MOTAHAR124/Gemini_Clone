import type { Metadata } from 'next';
import { Space_Grotesk, Source_Serif_4 } from 'next/font/google';

import { AuthProvider } from '@/components/ui/auth-provider';
import './globals.css';

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '700'],
});

const bodyFont = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Gemini-Clone',
  description: 'Production-ready Gemini-Clone assistant with chat, RAG, PDF, and vision tools.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
