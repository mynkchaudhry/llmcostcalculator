import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/auth/AuthProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import ClientErrorHandler from '@/components/ClientErrorHandler';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LLM Price Calculator | Compare AI Model Costs',
  description: 'Compare and calculate costs for multiple LLM APIs including OpenAI, Google, Anthropic, Meta, and more. Professional tool for AI developers and businesses.',
  keywords: 'LLM, AI, pricing, calculator, OpenAI, GPT, Claude, Gemini, API costs',
  authors: [{ name: 'LLM Calculator Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/favicon.svg', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}>
        <ClientErrorHandler />
        <AuthProvider>
          <ErrorBoundary>
            <div className="relative min-h-screen">
              {/* Background Effects */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
