import './globals.css';
import type { Metadata } from 'next';
import { Inter, Great_Vibes } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bloom = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bloom',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SheBloom — Women\'s Health App',
  description: 'A women\'s health companion for consultations, programs, and wellness.',
};

import { AuthProvider } from '@/components/auth-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bloom.variable}`}>
      <body className="font-sans antialiased bg-slate-50 min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex w-full min-h-screen justify-center items-stretch bg-slate-50">
            {/* Full-width Responsive Viewport */}
            <div className="w-full h-dvh max-h-dvh bg-lavender-100 flex flex-col relative overflow-hidden">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
