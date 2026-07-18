import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SheBloom — Women\'s Health App',
  description: 'A women\'s health companion for consultations, programs, and wellness.',
};

import { AuthProvider } from '@/components/auth-provider';
import { PWAInstallManager } from '@/components/pwa-install-manager';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" 
          rel="stylesheet" 
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased bg-slate-50 min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex w-full min-h-screen justify-center items-stretch bg-slate-50">
            {/* Full-width Responsive Viewport */}
            <div className="w-full h-dvh max-h-dvh bg-lavender-100 flex flex-col relative overflow-hidden">
              <PWAInstallManager />
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
