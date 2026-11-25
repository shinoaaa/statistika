import { NextRequest, NextResponse } from "next/server";
import { deleteSubmission, isNeonConfigured, listSubmissions } from "@/lib/db";
import type { GradedResponseRecord } from "@/types/research";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-passkey",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const CSV_COLUMNS: Array<keyof GradedResponseRecord> = [
  "id_responden",
  "device_id",
  "submitted_at",
  "urutan_kondisi",
  "inisial",
  "umur",
  "gender",
  "status_pendidikan",
  "kebiasaan_belajar",
  "perangkat_audio",
  "lagu_instrumental_id",
  "lagu_instrumental_judul",
  "lagu_berlirik_id",
  "lagu_berlirik_judul",
  "skor_instrumental",
  "skor_berlirik",
  "benar_instrumental",
  "benar_berlirik",
  "waktu_rata_instr_ms",
  "waktu_rata_lirik_ms",
  "id_soal_r1",
  "id_soal_r2",
  "persepsi_instrumental",
  "persepsi_berlirik",
  "selisih_persepsi",
  "selisih_skor",
  "lolos_cek_suara",
  "audio_terputar_r1",
  "audio_terputar_r2",
  "tab_switch_count",
  "status_valid_diri",
];

function escapeCsvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function getConfiguredPasskey(): string {
  const raw = (process.env.ADMIN_PASSKEY || "").trim();
  return raw.replace(/^["']+|["']+$/g, "").trim();
}

function isAuthorized(request: NextRequest): boolean {
  const requiredPasskey = getConfiguredPasskey();
  if (!requiredPasskey) {
    // Di production (Vercel), wajib ada ADMIN_PASSKEY agar data tidak pernah terbuka ke publik
    return process.env.NODE_ENV !== "production";
  }
  const { searchParams } = new URL(request.url);
  const suppliedKey =
    request.headers.get("x-admin-passkey") || searchParams.get("key") || "";
  return suppliedKey.trim() === requiredPasskey;
}

export async function GET(request: NextRequest) {
  const requiredPasskey = getConfiguredPasskey();
  const { searchParams } = new URL(request.url);

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Passkey admin tidak valid atau belum dimasukkan." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const { storage, rows } = await listSubmissions();
  const format = searchParams.get("format") || "csv";
  const onlyValid = searchParams.get("onlyValid") === "1";

  if (format === "json") {
    return NextResponse.json(
      {
        storage,
        neonConfigured: isNeonConfigured(),
        passkeyConfigured: Boolean(requiredPasskey),
        count: rows.length,
        rows,
      },
      { headers: CORS_HEADERS }
    );
  }

  const targetRows = onlyValid
    ? rows.filter((r) => r.status_valid_diri === "valid")
    : rows;

  const header = CSV_COLUMNS.join(",");
  const bodyLines = targetRows.map((row) =>
    CSV_COLUMNS.map((col) => escapeCsvCell(row[col])).join(",")
  );
  const csv = "\uFEFF" + [header, ...bodyLines].join("\n");
  const filename = onlyValid
    ? "data_responden_ruang_fokus_valid.csv"
    : "data_responden_ruang_fokus.csv";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Passkey admin tidak valid atau belum dimasukkan." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") || "").trim();
  if (!id) {
    return NextResponse.json(
      { error: "Parameter id responden wajib diisi." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const deleted = await deleteSubmission(id);
  return NextResponse.json({ success: true, deleted }, { headers: CORS_HEADERS });
}
