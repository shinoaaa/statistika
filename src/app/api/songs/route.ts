import { NextRequest, NextResponse } from "next/server";
import { getFilteredSongs } from "@/lib/music";
import type { MusicMode } from "@/types/research";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get("type");
  const query = searchParams.get("q") ?? "";

  if (rawType !== "instrumental" && rawType !== "lyrical") {
    return NextResponse.json(
      { error: "Parameter 'type' wajib 'instrumental' atau 'lyrical'." },
      { status: 400 }
    );
  }

  const mode: MusicMode = rawType;
  const { tracks, fallbackUsed } = await getFilteredSongs(mode, query);

  return NextResponse.json({
    mode,
    query,
    fallbackUsed,
    count: tracks.length,
    tracks,
  });
}
