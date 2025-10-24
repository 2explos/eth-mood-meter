// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.warpcast.com https://*.farcaster.com https://*.farcaster.xyz https://*.farcaster.dev;"
  );
  return res;
}

// Match everything
export const config = {
  matcher: '/:path*',
};
