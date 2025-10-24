// middleware.ts
import { NextResponse } from 'next/server'

// Applique ces headers à toutes les routes (sauf assets _next/static, images, etc.)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|icon.svg|preview.png|preview.svg|splash.png|splash.svg).*)',
  ],
}

export function middleware() {
  const res = NextResponse.next()

  // 🔓 Autoriser l’embed dans Warpcast / Farcaster
  res.headers.set('X-Frame-Options', 'ALLOWALL')
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self' https:;",
      "img-src 'self' https: data: blob:;",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
      "style-src 'self' 'unsafe-inline' https:;",
      "connect-src 'self' https: wss:;",
      // 👉 autorise Warpcast / Farcaster à EMBED ton app
      "frame-ancestors https://warpcast.com https://*.warpcast.com https://*.farcaster.xyz;",
    ].join(' ')
  )

  // (optionnel mais propre)
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return res
}
