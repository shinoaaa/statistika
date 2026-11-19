import { NextResponse } from "next/server";
import { drawBalancedRounds } from "@/lib/quiz";
import type { ConditionOrder } from "@/types/research";

export const dynamic = "force-dynamic";

export async function GET() {
  const { round1, round2 } = drawBalancedRounds();
  const urutanKondisi: ConditionOrder =
    Math.random() < 0.5 ? "instr_first" : "lyric_first";

  return NextResponse.json({
    urutanKondisi,
    round1,
    round2,
  });
}
