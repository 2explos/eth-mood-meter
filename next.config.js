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
        // apply to every route
        source: '/:path*',
        headers: [
          // IMPORTANT: allow Warpcast/Farcaster to embed your app
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://*.warpcast.com https://*.farcaster.com https://*.farcaster.xyz https://*.farcaster.dev;",
          },
          // Nice-to-haves
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Permissions-Policy', value: 'interest-cohort=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
