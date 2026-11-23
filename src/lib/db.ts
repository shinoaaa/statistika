import { neon } from "@neondatabase/serverless";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { GradedResponseRecord } from "@/types/research";

const LOCAL_FILE = path.join(process.cwd(), ".local-data", "submissions.json");
const TMP_FALLBACK_FILE = path.join(os.tmpdir(), "ruang-fokus-submissions.json");

export function getNeonUrl(): string {
  let raw = (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    ""
  ).trim();
  raw = raw.replace(/^(DATABASE_URL|POSTGRES_URL|NEON_DATABASE_URL)\s*=\s*/i, "").trim();
  raw = raw.replace(/^["']+|["']+$/g, "").trim();
  return raw;
}

export function isNeonConfigured(): boolean {
  const url = getNeonUrl();
  return /^postgres(ql)?:\/\//i.test(url) && !url.includes("TEMPEL_");
}

let schemaInitialized = false;

async function ensureNeonSchema() {
  if (!isNeonConfigured() || schemaInitialized) return;
  const sql = neon(getNeonUrl());
  await sql`
    CREATE TABLE IF NOT EXISTS responses (
      id_responden            TEXT PRIMARY KEY,
      device_id               TEXT NOT NULL,
      submitted_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      urutan_kondisi          TEXT NOT NULL,
      inisial                 TEXT,
      umur                    INTEGER NOT NULL,
      gender                  TEXT NOT NULL,
      status_pendidikan       TEXT NOT NULL,
      kebiasaan_belajar       TEXT NOT NULL,
      perangkat_audio         TEXT NOT NULL,
      lagu_instrumental_id    TEXT NOT NULL,
      lagu_instrumental_judul TEXT NOT NULL,
      lagu_berlirik_id        TEXT NOT NULL,
      lagu_berlirik_judul     TEXT NOT NULL,
      skor_instrumental       NUMERIC(6, 2) NOT NULL,
      skor_berlirik           NUMERIC(6, 2) NOT NULL,
      benar_instrumental      INTEGER NOT NULL,
      benar_berlirik          INTEGER NOT NULL,
      waktu_rata_instr_ms     INTEGER NOT NULL,
      waktu_rata_lirik_ms     INTEGER NOT NULL,
      id_soal_r1              TEXT NOT NULL,
      id_soal_r2              TEXT NOT NULL,
      persepsi_instrumental   INTEGER NOT NULL,
      persepsi_berlirik       INTEGER NOT NULL,
      selisih_persepsi        INTEGER NOT NULL,
      selisih_skor            NUMERIC(6, 2) NOT NULL,
      lolos_cek_suara         BOOLEAN NOT NULL,
      audio_terputar_r1       BOOLEAN NOT NULL,
      audio_terputar_r2       BOOLEAN NOT NULL,
      tab_switch_count        INTEGER NOT NULL DEFAULT 0,
      status_valid_diri       TEXT NOT NULL
    )
  `;
  schemaInitialized = true;
}

async function readLocalList(): Promise<GradedResponseRecord[]> {
  for (const filePath of [LOCAL_FILE, TMP_FALLBACK_FILE]) {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as GradedResponseRecord[];
    } catch {
      // Coba lokasi berikutnya
    }
  }
  return [];
}

async function writeLocalList(list: GradedResponseRecord[]): Promise<void> {
  const payload = JSON.stringify(list, null, 2);
  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, payload, "utf-8");
  } catch {
    // Fallback ke os.tmpdir() jika filesystem serverless (seperti Vercel /var/task) bersifat read-only
    await fs.writeFile(TMP_FALLBACK_FILE, payload, "utf-8");
  }
}

export async function saveSubmission(record: GradedResponseRecord): Promise<"neon" | "local"> {
  if (isNeonConfigured()) {
    await ensureNeonSchema();
    const sql = neon(getNeonUrl());
    await sql`
      INSERT INTO responses (
        id_responden, device_id, submitted_at, urutan_kondisi,
        inisial, umur, gender, status_pendidikan, kebiasaan_belajar, perangkat_audio,
        lagu_instrumental_id, lagu_instrumental_judul, lagu_berlirik_id, lagu_berlirik_judul,
        skor_instrumental, skor_berlirik, benar_instrumental, benar_berlirik,
        waktu_rata_instr_ms, waktu_rata_lirik_ms, id_soal_r1, id_soal_r2,
        persepsi_instrumental, persepsi_berlirik, selisih_persepsi, selisih_skor,
        lolos_cek_suara, audio_terputar_r1, audio_terputar_r2, tab_switch_count, status_valid_diri
      ) VALUES (
        ${record.id_responden}, ${record.device_id}, ${record.submitted_at}, ${record.urutan_kondisi},
        ${record.inisial}, ${record.umur}, ${record.gender}, ${record.status_pendidikan},
        ${record.kebiasaan_belajar}, ${record.perangkat_audio},
        ${record.lagu_instrumental_id}, ${record.lagu_instrumental_judul},
        ${record.lagu_berlirik_id}, ${record.lagu_berlirik_judul},
        ${record.skor_instrumental}, ${record.skor_berlirik},
        ${record.benar_instrumental}, ${record.benar_berlirik},
        ${record.waktu_rata_instr_ms}, ${record.waktu_rata_lirik_ms},
        ${record.id_soal_r1}, ${record.id_soal_r2},
        ${record.persepsi_instrumental}, ${record.persepsi_berlirik},
        ${record.selisih_persepsi}, ${record.selisih_skor},
        ${record.lolos_cek_suara}, ${record.audio_terputar_r1}, ${record.audio_terputar_r2},
        ${record.tab_switch_count}, ${record.status_valid_diri}
      )
    `;
    return "neon";
  }

  const list = await readLocalList();
  list.push(record);
  await writeLocalList(list);
  return "local";
}

export async function listSubmissions(): Promise<{
  storage: "neon" | "local";
  rows: GradedResponseRecord[];
}> {
  if (isNeonConfigured()) {
    await ensureNeonSchema();
    const sql = neon(getNeonUrl());
    const rows = await sql`SELECT * FROM responses ORDER BY submitted_at DESC`;
    return {
      storage: "neon",
      rows: rows.map((r) => ({
        ...(r as unknown as GradedResponseRecord),
        submitted_at: String(r.submitted_at),
        skor_instrumental: Number(r.skor_instrumental),
        skor_berlirik: Number(r.skor_berlirik),
        selisih_skor: Number(r.selisih_skor),
      })),
    };
  }

  const rows = await readLocalList();
  return { storage: "local", rows: [...rows].reverse() };
}

export async function deleteSubmission(idResponden: string): Promise<boolean> {
  if (!idResponden) return false;

  if (isNeonConfigured()) {
    await ensureNeonSchema();
    const sql = neon(getNeonUrl());
    await sql`DELETE FROM responses WHERE id_responden = ${idResponden}`;
    return true;
  }

  const list = await readLocalList();
  const filtered = list.filter((r) => r.id_responden !== idResponden);
  await writeLocalList(filtered);
  return filtered.length !== list.length;
}
