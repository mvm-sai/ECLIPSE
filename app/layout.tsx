import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0B0F1A',
};

export const metadata: Metadata = {
  title: 'Eclipse — Reclaim Your Attention',
  description:
    'Eclipse turns goals into structured progress. A cognitive productivity platform with focus sessions, gamified XP progression, and body-doubling presence.',
  keywords: [
    'focus',
    'productivity',
    'deep work',
    'pomodoro',
    'gamification',
    'attention',
    'eclipse',
  ],
  authors: [{ name: 'Eclipse' }],
  openGraph: {
    title: 'Eclipse — Reclaim Your Attention',
    description:
      'Cognitive productivity platform with focus sessions, gamified XP, and body-doubling presence.',
    type: 'website',
    siteName: 'Eclipse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eclipse — Reclaim Your Attention',
    description:
      'Focus sessions. XP progression. Body doubling. Eclipse turns goals into structured progress.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
