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
        {/* Bridge très tôt vers Warpcast */}
        <Script id="warpcast-bridge" strategy="afterInteractive">
          {`
            (function () {
              var tried = false;
              function sendReady() {
                if (tried) return; 
                tried = true;
                try {
                  if (window.sdk && window.sdk.actions && typeof window.sdk.actions.ready === 'function') {
                    window.sdk.actions.ready();
                  }
                } catch (e) {}

                try {
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'warpcast:ready' }, '*');
                    window.parent.postMessage({ type: 'miniapp_ready' }, '*');
                    window.parent.postMessage({ type: 'frame:ready' }, '*');
                  }
                } catch (e) {}
              }

              function softTry() {
                try {
                  if (window.sdk && window.sdk.actions && typeof window.sdk.actions.ready === 'function') {
                    window.sdk.actions.ready();
                  }
                  if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'warpcast:ready' }, '*');
                  }
                } catch (e) {}
              }

              // Appel immédiat + retries
              softTry();
              setTimeout(softTry, 100);
              setTimeout(softTry, 400);
              setTimeout(softTry, 1200);

              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(sendReady, 0);
              } else {
                window.addEventListener('DOMContentLoaded', sendReady);
                window.addEventListener('load', sendReady);
              }

              // Si le parent nous "ping", on répond
              window.addEventListener('message', function (ev) {
                var t = ev && ev.data && ev.data.type;
                if (t === 'warpcast:ping' || t === 'ready?' || t === 'miniapp:ping') {
                  softTry();
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
