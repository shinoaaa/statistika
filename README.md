# Ruang Fokus — Aplikasi Tes Performa Kognitif (Next.js)

Web penelitian full data primer untuk mengukur hubungan performa kognitif belajar saat mendengarkan musik instrumental (`skor_instrumental`, X) dan musik berlirik (`skor_berlirik`, Y).

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka:
- Halaman Tes Responden: `http://localhost:3000`
- Dashboard Peneliti & Ekspor CSV (untuk SPSS/Python): `http://localhost:3000/admin`

## Fitur yang Sudah Terpasang

1. **4 Slide Single-Page Flow** sesuai desain Figma V4:
   - **Slide 1**: Profil singkat (usia minimal 18+, status pendidikan, kebiasaan belajar, perangkat audio) + Tes Suara bunyi lonceng WAV + Informed Consent.
   - **Slide 2 & Slide 3**: Masing-masing **1 slide** dengan dua state internal (`Siap & Pilih Lagu` -> `9 Soal Aktif` 25 detik/soal). Urutan kondisi (Instrumental dulu vs Berlirik dulu) diacak 50:50 per peserta.
   - **Slide 4**: Evaluasi Penutup (2 slider persepsi $-10$..$+10$ + cek kejujuran) -> berubah menjadi **Kartu Hasil & Bagikan**.
2. **Music Picker via Audius Public Discovery API (`/api/songs`)**:
   - **Tanpa API Key**, streaming MP3 penuh berdurasi >2 menit, bebas iklan.
   - **Filter Ketat Anti-Tercampur**: Ronde Instrumental hanya menampilkan musik instrumental murni (lolos tag instrumental/lofi/piano & bebas kata kunci vokal/lirik), sedangkan Ronde Berlirik hanya menampilkan lagu bervokal/lirik (bebas tag instrumental/beat/karaoke).
   - Mendukung Jamendo API opsional jika `JAMENDO_CLIENT_ID` diisi.
3. **Database Siap Neon Postgres + Passkey Admin**:
   - Selama `.env.local` belum diisi, data tersimpan otomatis di `.local-data/submissions.json`.
   - Untuk menghubungkan Neon Postgres & mengaktifkan Passkey Admin di tahap akhir, salin `.env.example` menjadi `.env.local`, lalu isi `DATABASE_URL` (dari dashboard Neon) dan `ADMIN_PASSKEY`. Skema SQL lengkap ada di `db/schema.sql`.
