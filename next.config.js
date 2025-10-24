/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Expose env côté client (inchangé)
  env: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_RPC: process.env.NEXT_PUBLIC_RPC,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_CONTRACT: process.env.NEXT_PUBLIC_CONTRACT,
  },

  // 🔓 Autoriser l’embed dans Warpcast / farcaster
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ❌ Désactive X-Frame-Options (SAMEORIGIN bloquait l’iframe)
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          // ✅ CSP moderne pour autoriser les iframes de Warpcast
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https:;",
              "img-src 'self' https: data: blob:;",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
              "style-src 'self' 'unsafe-inline' https:;",
              "connect-src 'self' https: wss:;",
              // 👇 autorise qui peut embarquer ton site
              "frame-ancestors https://warpcast.com https://*.warpcast.com https://*.farcaster.xyz;",
            ].join(' ')
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
