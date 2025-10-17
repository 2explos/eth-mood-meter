// app/.well-known/farcaster.json/route.ts
import { NextResponse } from 'next/server'

// IMPORTANT: ne pas mettre force-static pendant les tests
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // On reconstruit l'origin à partir de la requête (solution la plus sûre)
  const origin = process.env.NEXT_PUBLIC_URL || new URL(req.url).origin

  const header = process.env.FARCASTER_HEADER || ''
  const payload = process.env.FARCASTER_PAYLOAD || ''
  const signature = process.env.FARCASTER_SIGNATURE || ''

  // (Optionnel) garde-fou : si tu veux refuser sans les 3 champs
  // if (!header || !payload || !signature) {
  //   return NextResponse.json({ error: 'AccountAssociation missing' }, { status: 500 })
  // }

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
      'Cache-Control': 'no-store', // évite le cache pendant les tests
    },
  })
}
