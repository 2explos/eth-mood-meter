// app/.well-known/farcaster.json/route.ts
import { NextResponse } from 'next/server'

// PAS de cache pour être sûr en test
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const origin = process.env.NEXT_PUBLIC_URL || new URL(req.url).origin

  const header = process.env.FARCASTER_HEADER || ''
  const payload = process.env.FARCASTER_PAYLOAD || ''
  const signature = process.env.FARCASTER_SIGNATURE || ''

  const manifest = {
    accountAssociation: {
      header,
      payload,
      signature,
    },
    frame: {
      version: '1',
      name: 'ETH Mood Meter',
      iconUrl: `${origin}/icon.png`,
      homeUrl: `${origin}`,
      imageUrl: `${origin}/preview.png`,
      screenshotUrls: [`${origin}/preview.png`],
      tags: ['base', 'farcaster', 'miniapp', 'mood', 'ethereum'],
      primaryCategory: 'developer-tools',
      buttonTitle: 'Open',
      splashImageUrl: `${origin}/splash.png`,
      splashBackgroundColor: '#667eea',
    },
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
