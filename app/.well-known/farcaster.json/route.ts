import { NextResponse } from "next/server";

export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_URL || "";

  // Récupère les 3 valeurs signées depuis Vercel
  const header = process.env.FARCASTER_HEADER;
  const payload = process.env.FARCASTER_PAYLOAD;
  const signature = process.env.FARCASTER_SIGNATURE;

  // Manifeste de base (frame)
  const manifest: any = {
    frame: {
      version: "1",
      name: "ETH Mood Meter",
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/preview.png`,
      screenshotUrls: [`${APP_URL}/preview.png`],
      tags: ["base", "farcaster", "miniapp", "mood", "ethereum"],
      primaryCategory: "developer-tools",
      buttonTitle: "Open",
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#667eea",
    },
  };

  // Ajoute accountAssociation **uniquement si** les 3 variables existent
  if (header && payload && signature) {
    manifest.accountAssociation = { header, payload, signature };
  }

  // Désactive le cache pour voir tout de suite les maj
  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
