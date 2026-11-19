import { NextRequest, NextResponse } from "next/server";
import { isNeonConfigured, listSubmissions } from "@/lib/db";
import type { GradedResponseRecord } from "@/types/research";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const requiredPasskey = process.env.ADMIN_PASSKEY?.trim();
  const { searchParams } = new URL(request.url);
  const suppliedKey =
    request.headers.get("x-admin-passkey") || searchParams.get("key") || "";

  if (requiredPasskey && suppliedKey !== requiredPasskey) {
    return NextResponse.json(
      { error: "Passkey admin tidak valid atau belum dimasukkan." },
      { status: 401 }
    );
  }

  const { storage, rows } = await listSubmissions();
  const format = searchParams.get("format") || "csv";

  if (format === "json") {
    return NextResponse.json({
      storage,
      neonConfigured: isNeonConfigured(),
      passkeyConfigured: Boolean(requiredPasskey),
      count: rows.length,
      rows,
    });
  }

  const header = CSV_COLUMNS.join(",");
  const bodyLines = rows.map((row) =>
    CSV_COLUMNS.map((col) => escapeCsvCell(row[col])).join(",")
  );
  const csv = [header, ...bodyLines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="data_responden_ruang_fokus.csv"',
    },
  });
}
