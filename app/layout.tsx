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
        <Script id="warpcast-bridge" strategy="beforeInteractive">
          {`
            (function () {
              function poke() {
                try {
                  if (window.sdk && window.sdk.actions && typeof window.sdk.actions.ready === 'function') {
                    window.sdk.actions.ready();
                  }
                } catch (e) {}
                try {
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'warpcast:ready' }, '*');
                    window.parent.postMessage({ type: 'miniapp_ready' }, '*');
                    window.parent.postMessage({ type: 'frame_ready' }, '*');
                  }
                } catch (e) {}
              }

              // Plusieurs tentatives très tôt
              poke();
              setTimeout(poke, 80);
              setTimeout(poke, 220);
              setTimeout(poke, 800);

              // "load" et "DOMContentLoaded"
              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(poke, 0);
              } else {
                window.addEventListener('DOMContentLoaded', poke, { once: true });
                window.addEventListener('load', poke, { once: true });
              }

              // Si le parent ping → répondre
              window.addEventListener('message', function (ev) {
                var t = ev && ev.data && ev.data.type;
                if (t === 'warpcast:ping' || t === 'ready?' || t === 'miniapp:ping') {
                  poke();
                }
              });
            })();
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
