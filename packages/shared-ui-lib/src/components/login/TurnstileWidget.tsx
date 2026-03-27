import { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export function TurnstileWidget({ siteKey, onVerify, onExpire, onError }: TurnstileWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !ref.current) return;
    if (widgetId.current) {
      window.turnstile.remove(widgetId.current);
    }
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: onVerify,
      'expired-callback': onExpire,
      'error-callback': onError,
      theme: 'auto',
    });
  }, [siteKey, onVerify, onExpire, onError]);

  useEffect(() => {
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
      script.async = true;
      document.head.appendChild(script);
    }

    // Poll for turnstile to be ready
    const interval = setInterval(() => {
      if (window.turnstile && ref.current) {
        clearInterval(interval);
        renderWidget();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [renderWidget]);

  return <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', my: 2 }} />;
}
