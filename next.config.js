/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_RPC: process.env.NEXT_PUBLIC_RPC,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_CONTRACT: process.env.NEXT_PUBLIC_CONTRACT,
  },
  async headers() {
    return [
      {
        // Autoriser l’embed dans Warpcast
        source: '/:path*',
        headers: [
          // Vercel n’en met pas par défaut, mais on force au cas où
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          // CSP moderne pour l’embed
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors https://warpcast.com https://*.warpcast.com https://*.farcaster.xyz;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
