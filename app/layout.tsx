// app/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'ETH Mood Meter',
  description: 'Vote on your ETH sentiment - Bullish or Bearish',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Bridge Warpcast: expose window.sdk.actions.ready() et envoie un postMessage */}
        <Script
          id="warpcast-bridge"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  // Si Warpcast injecte déjà sdk, on ne touche à rien
  if (!window.sdk) {
    window.sdk = {
      actions: {
        ready: function () {
          try {
            // On notifie le parent (Warpcast) que la mini-app est prête
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'warpcast:ready' }, '*');
            }
          } catch (e) {}
        }
      }
    };
  }

  // Par sécurité, si le parent "ping", on répond "ready"
  window.addEventListener('message', function (ev) {
    try {
      var t = ev && ev.data && ev.data.type;
      if (t === 'warpcast:ping' || t === 'ready?' || t === 'miniapp:ping') {
        if (window.sdk && window.sdk.actions && typeof window.sdk.actions.ready === 'function') {
          window.sdk.actions.ready();
        }
      }
    } catch (e) {}
  });
})();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
