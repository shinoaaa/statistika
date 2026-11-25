import { NextResponse } from "next/server";
import { checkNeonHealth, isVercelRuntime } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkNeonHealth();
  const passkeyRaw = (process.env.ADMIN_PASSKEY || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();

  return NextResponse.json(
    {
      ok: health.dbStatus === "connected",
      runtime: isVercelRuntime() ? "vercel" : "local",
      vercelEnv: process.env.VERCEL_ENV || null,
      neonConfigured: health.neonConfigured,
      neonEnvSource: health.neonEnvSource,
      passkeyConfigured: Boolean(passkeyRaw),
      dbStatus: health.dbStatus,
      dbError: health.dbError,
      totalRows: health.totalRows,
    },
    { status: health.dbStatus === "error" ? 500 : 200 }
  );
}
