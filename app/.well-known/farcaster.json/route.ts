import { NextResponse } from 'next/server'
export const dynamic = 'force-static'

export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_URL // e.g. https://eth-mood-meter.vercel.app
  const HEADER = process.env.FARCASTER_HEADER
  const PAYLOAD = process.env.FARCASTER_PAYLOAD
  const SIGNATURE = process.env.FARCASTER_SIGNATURE

  if (!APP_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_URL is not set' }, { status: 500 })
  }

  const manifest = {
    accountAssociation: {
      header: HEADER ?? '',
      payload: PAYLOAD ?? '',
      signature: SIGNATURE ?? '',
    },
    frame: {
      version: '1',
      name: 'ETH Mood Meter',
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/preview.png`,
      screenshotUrls: [`${APP_URL}/preview.png`],
      tags: ['base', 'farcaster', 'miniapp', 'mood', 'ethereum'],
      primaryCategory: 'developer-tools',
      buttonTitle: 'Open',
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#667eea',
    },
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
