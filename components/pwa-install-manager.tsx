'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X, Smartphone, ArrowDownToLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PWAInstallManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if dismissed recently (within 2 days)
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time');
    let isRecentlyDismissed = false;
    if (dismissedTime) {
      const diff = Date.now() - parseInt(dismissedTime, 10);
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      if (diff < twoDays) {
        isRecentlyDismissed = true;
      }
    }

    // 1. Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('PWA Service Worker registered successfully.'))
        .catch(err => console.error('Service Worker registration failed:', err));
    }

    // 2. Check if already open as standalone PWA
    const standaloneCheck = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standaloneCheck);

    // 3. Listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if we are NOT in standalone mode and NOT recently dismissed
      if (!standaloneCheck && !isRecentlyDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Timer to show modal after 2 minutes (120,000ms)
    let modalTimer: NodeJS.Timeout;
    if (!standaloneCheck && !isRecentlyDismissed) {
      modalTimer = setTimeout(() => {
        setShowModal(true);
      }, 120000); // 2 minutes
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (modalTimer) clearTimeout(modalTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('PWA installation prompt is not ready. Please check if your browser supports installation or if already installed.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString());
  };

  const handleDismissModal = () => {
    setShowModal(false);
    localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Sticky Top Banner */}
      {showBanner && deferredPrompt && (
        <div className="bg-bloom-gradient text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold relative z-50 shadow-md animate-in slide-in-from-top duration-300 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300 shrink-0" />
            <span>Install SheBloom for a premium app experience!</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleInstallClick}
              className="bg-white text-bloom-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shadow transition hover:brightness-105 active:scale-95 flex items-center gap-1"
            >
              <ArrowDownToLine className="h-3 w-3" /> Install
            </button>
            <button onClick={handleDismissBanner} className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2-Minute Delayed Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-bloom-100 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 mx-auto bg-bloom-100 rounded-full flex items-center justify-center text-bloom-700">
              <Smartphone className="h-8 w-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Get the SheBloom App</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
                Add SheBloom to your home screen for quick offline access, full-screen view, and instant notifications.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleInstallClick}
                className="h-11 w-full bg-bloom-gradient text-white text-xs font-bold rounded-2xl shadow-bloom-btn transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <ArrowDownToLine className="h-4 w-4" /> Install SheBloom
              </button>
              <button
                onClick={handleDismissModal}
                className="h-10 w-full bg-slate-50 text-slate-500 text-xs font-bold rounded-2xl hover:bg-slate-100 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
