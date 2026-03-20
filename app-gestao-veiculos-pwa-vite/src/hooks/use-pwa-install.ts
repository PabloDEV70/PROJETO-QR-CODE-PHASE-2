import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallState = 'idle' | 'available' | 'installed';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DAYS = 7;

function isDismissedRecently(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const timestamp = Number(raw);
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function usePwaInstall() {
  const [state, setState] = useState<InstallState>(isStandalone() ? 'installed' : 'idle');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) { setState('installed'); return; }
    const onBeforeInstall = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); setState('available'); };
    const onAppInstalled = () => { setState('installed'); setDeferredPrompt(null); };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onBeforeInstall); window.removeEventListener('appinstalled', onAppInstalled); };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setState('installed');
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => { localStorage.setItem(DISMISS_KEY, String(Date.now())); }, []);

  const isInstallable = state === 'available' && !isDismissedRecently();
  const isInstalled = state === 'installed';
  const showIosPrompt = isIos() && !isStandalone() && !isDismissedRecently();

  return { isInstallable, isInstalled, promptInstall, dismiss, showIosPrompt };
}
