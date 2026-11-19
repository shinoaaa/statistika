-- Skema Database PostgreSQL (Neon) untuk Ruang Fokus
-- Jalankan SQL ini di Neon SQL Editor (atau otomatis dijalankan oleh initDb() di src/lib/db.ts)

CREATE TABLE IF NOT EXISTS responses (
  id_responden          TEXT PRIMARY KEY,
  device_id             TEXT NOT NULL,
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  urutan_kondisi        TEXT NOT NULL CHECK (urutan_kondisi IN ('instr_first', 'lyric_first')),

  -- Profil Sampel (Bab 4 - tidak masuk model regresi 2 variabel)
  inisial               TEXT,
  umur                  INTEGER NOT NULL CHECK (umur >= 18 AND umur <= 99),
  gender                TEXT NOT NULL,
  status_pendidikan     TEXT NOT NULL,
  kebiasaan_belajar     TEXT NOT NULL,
  perangkat_audio       TEXT NOT NULL,

  -- Pilihan Lagu yang Diputar (Audit Stimulus)
  lagu_instrumental_id    TEXT NOT NULL,
  lagu_instrumental_judul TEXT NOT NULL,
  lagu_berlirik_id        TEXT NOT NULL,
  lagu_berlirik_judul     TEXT NOT NULL,

  -- 2 VARIABEL UTAMA UJI KORELASI & REGRESI
  skor_instrumental     NUMERIC(6, 2) NOT NULL,
  skor_berlirik         NUMERIC(6, 2) NOT NULL,

  -- Detail Teknis Tes (Audit & Pembahasan)
  benar_instrumental    INTEGER NOT NULL,
  benar_berlirik        INTEGER NOT NULL,
  waktu_rata_instr_ms   INTEGER NOT NULL,
  waktu_rata_lirik_ms   INTEGER NOT NULL,
  id_soal_r1            TEXT NOT NULL,
  id_soal_r2            TEXT NOT NULL,

  -- Variabel Cadangan ("Sabuk Pengaman")
  persepsi_instrumental INTEGER NOT NULL,
  persepsi_berlirik     INTEGER NOT NULL,
  selisih_persepsi      INTEGER NOT NULL,
  selisih_skor          NUMERIC(6, 2) NOT NULL,

  -- Kontrol Kualitas Data (Data Hygiene)
  lolos_cek_suara       BOOLEAN NOT NULL,
  audio_terputar_r1     BOOLEAN NOT NULL,
  audio_terputar_r2     BOOLEAN NOT NULL,
  tab_switch_count      INTEGER NOT NULL DEFAULT 0,
  status_valid_diri     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_responses_device_id ON responses (device_id);
CREATE INDEX IF NOT EXISTS idx_responses_submitted_at ON responses (submitted_at DESC);

-- Tabel opsional untuk Admin Passkey (disiapkan untuk integrasi Neon Passkey di tahap akhir)
CREATE TABLE IF NOT EXISTS admin_passkeys (
  id            TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  credential_id TEXT UNIQUE,
  public_key    TEXT,
  counter       INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
