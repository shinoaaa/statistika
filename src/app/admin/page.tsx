"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  Filter,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  OrientLandscapeBackground,
  ParchmentCardShell,
} from "@/components/OrientBackdrop";
import type { GradedResponseRecord } from "@/types/research";

interface AdminPayload {
  storage: "neon" | "local";
  neonConfigured: boolean;
  passkeyConfigured: boolean;
  count: number;
  rows: GradedResponseRecord[];
}

function calcMean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((acc, v) => acc + v, 0) / nums.length;
}

function calcSampleSd(nums: number[], mean: number): number {
  if (nums.length < 2) return 0;
  const variance =
    nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

function calcSkewness(nums: number[], mean: number, sd: number): number {
  if (nums.length < 3 || sd === 0) return 0;
  const m3 =
    nums.reduce((acc, v) => acc + Math.pow((v - mean) / sd, 3), 0) / nums.length;
  return m3;
}

export default function AdminExportPage() {
  const [passkey, setPasskey] = useState("");
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "valid">("all");
  const [searchText, setSearchText] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedFormula, setCopiedFormula] = useState(false);

  const fetchDashboard = useCallback(async (suppliedKey = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/export?format=json", {
        headers: suppliedKey ? { "x-admin-passkey": suppliedKey } : {},
      });
      if (res.status === 401) {
        setError("Masukkan Admin Passkey untuk melihat & mengunduh data.");
        setData(null);
        return;
      }
      const json = (await res.json()) as AdminPayload;
      setData(json);
    } catch {
      setError("Gagal mengambil data dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard("");
  }, [fetchDashboard]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchDashboard(passkey);
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, passkey, fetchDashboard]);

  const handleDeleteRow = async (idResponden: string, inisial: string) => {
    const ok = window.confirm(
      `Hapus data responden ${idResponden} (${inisial})? Gunakan ini untuk menghapus data uji coba/dummy.`
    );
    if (!ok) return;

    setDeletingId(idResponden);
    try {
      const res = await fetch(
        `/api/export?id=${encodeURIComponent(idResponden)}`,
        {
          method: "DELETE",
          headers: passkey ? { "x-admin-passkey": passkey } : {},
        }
      );
      if (res.ok) {
        await fetchDashboard(passkey);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const allRows = data?.rows ?? [];
  const validCount = allRows.filter((r) => r.status_valid_diri === "valid").length;
  const distractedCount = allRows.length - validCount;

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return allRows.filter((r) => {
      if (filterMode === "valid" && r.status_valid_diri !== "valid") return false;
      if (!q) return true;
      const blob = `${r.id_responden} ${r.inisial} ${r.gender} ${r.status_pendidikan} ${r.kebiasaan_belajar} ${r.lagu_instrumental_judul} ${r.lagu_berlirik_judul}`.toLowerCase();
      return blob.includes(q);
    });
  }, [allRows, filterMode, searchText]);

  const stats = useMemo(() => {
    const n = filteredRows.length;
    const xs = filteredRows.map((r) => Number(r.skor_instrumental));
    const ys = filteredRows.map((r) => Number(r.skor_berlirik));
    const ds = filteredRows.map((r) => Number(r.selisih_skor));

    const meanX = calcMean(xs);
    const meanY = calcMean(ys);
    const meanD = calcMean(ds);
    const sdX = calcSampleSd(xs, meanX);
    const sdY = calcSampleSd(ys, meanY);
    const sdD = calcSampleSd(ds, meanD);
    const skewD = calcSkewness(ds, meanD, sdD);

    const tStat = n >= 2 && sdD > 0 ? meanD / (sdD / Math.sqrt(n)) : 0;

    const avgCorrectX = calcMean(filteredRows.map((r) => Number(r.benar_instrumental)));
    const avgCorrectY = calcMean(filteredRows.map((r) => Number(r.benar_berlirik)));
    const avgSecX = calcMean(filteredRows.map((r) => Number(r.waktu_rata_instr_ms) / 1000));
    const avgSecY = calcMean(filteredRows.map((r) => Number(r.waktu_rata_lirik_ms) / 1000));

    const instrBetter = filteredRows.filter((r) => r.selisih_skor > 0).length;
    const lyricBetter = filteredRows.filter((r) => r.selisih_skor < 0).length;
    const tied = n - instrBetter - lyricBetter;

    // 5-bin histogram untuk selisih d = X - Y
    const bins = [
      { label: "< -15 (Unggul Lirik)", count: ds.filter((d) => d < -15).length },
      { label: "-15 s/d -5", count: ds.filter((d) => d >= -15 && d < -5).length },
      { label: "-5 s/d +5 (Netral)", count: ds.filter((d) => d >= -5 && d <= 5).length },
      { label: "+5 s/d +15", count: ds.filter((d) => d > 5 && d <= 15).length },
      { label: "> +15 (Unggul Instr.)", count: ds.filter((d) => d > 15).length },
    ];
    const maxBin = Math.max(1, ...bins.map((b) => b.count));

    const countBy = (getter: (r: GradedResponseRecord) => string) => {
      const map = new Map<string, number>();
      for (const row of filteredRows) {
        const k = getter(row) || "-";
        map.set(k, (map.get(k) ?? 0) + 1);
      }
      return Array.from(map.entries());
    };

    return {
      n,
      meanX,
      meanY,
      meanD,
      sdX,
      sdY,
      sdD,
      skewD,
      tStat,
      minX: xs.length ? Math.min(...xs) : 0,
      maxX: xs.length ? Math.max(...xs) : 0,
      minY: ys.length ? Math.min(...ys) : 0,
      maxY: ys.length ? Math.max(...ys) : 0,
      avgCorrectX,
      avgCorrectY,
      avgSecX,
      avgSecY,
      instrBetter,
      lyricBetter,
      tied,
      bins,
      maxBin,
      byGender: countBy((r) => r.gender),
      byHabit: countBy((r) => r.kebiasaan_belajar),
      byAudio: countBy((r) => r.perangkat_audio),
      byOrder: countBy((r) =>
        r.urutan_kondisi === "instr_first"
          ? "Instrumental Dulu"
          : "Berlirik Dulu"
      ),
    };
  }, [filteredRows]);

  const downloadCsvUrl = passkey
    ? `/api/export?format=csv&key=${encodeURIComponent(passkey)}${
        filterMode === "valid" ? "&onlyValid=1" : ""
      }`
    : `/api/export?format=csv${filterMode === "valid" ? "&onlyValid=1" : ""}`;

  const handleCopySheetsFormula = async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://domain-kamu.vercel.app";
    const url = `${origin}${downloadCsvUrl}`;
    const formula = `=IMPORTDATA("${url}")`;
    try {
      await navigator.clipboard.writeText(formula);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2400);
    } catch {
      // Abaikan
    }
  };

  return (
    <main className="relative min-h-screen px-4 py-8 sm:px-6">
      <OrientLandscapeBackground />

      <ParchmentCardShell>
        {/* Top Bar */}
        <div className="flex flex-col gap-4 border-b border-[#E6DEC8] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-jade-600 bg-jade-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-jade-800">
              <BarChart3 className="h-3.5 w-3.5" />
              Dashboard Responden • Ruang Fokus
            </span>
            <h1 className="mt-2 text-2xl font-bold text-jade-900 sm:text-3xl">
              Monitoring Jumlah Respon &amp; Statistik Deskriptif
            </h1>
            <p className="mt-1 text-xs text-[#4B6062]">
              Pantau jumlah pengisi kuesioner, ringkasan Skor Instrumental (X) vs Berlirik (Y),
              preview uji-t berpasangan, dan unduh CSV untuk Excel / Google Sheets / SPSS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {data && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5CEBF] bg-parchment-200 px-3 py-1.5 text-xs font-bold text-[#3B4E50]">
                <Database className="h-3.5 w-3.5 text-jade-700" />
                {data.neonConfigured ? "DB: Neon Postgres" : "DB: Lokal (.local-data)"}
              </span>
            )}

            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                autoRefresh
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-[#D5CEBF] bg-[#FBF8F0] text-[#3B4E50] hover:border-jade-600"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              {autoRefresh ? "Live 15d: ON" : "Live 15d: OFF"}
            </button>

            <button
              type="button"
              onClick={() => fetchDashboard(passkey)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-jade-600 bg-[#FBF8F0] px-3.5 text-xs font-bold text-jade-700 hover:bg-jade-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {data && (
              <>
                <button
                  type="button"
                  onClick={handleCopySheetsFormula}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#B89258] bg-[#FCF8EE] px-3.5 text-xs font-bold text-[#7D5A24] hover:bg-[#EFE6D2]"
                >
                  {copiedFormula ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedFormula ? "Rumus Sheets Tersalin!" : "Rumus Google Sheets"}
                </button>

                <a
                  href={downloadCsvUrl}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-jade-700 px-4 text-xs font-bold text-white shadow-sm hover:bg-jade-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download CSV ({filteredRows.length})
                </a>
              </>
            )}
          </div>
        </div>

        {/* Passkey Gate */}
        {error && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchDashboard(passkey);
            }}
            className="mx-auto my-10 max-w-md rounded-xl border border-[#DDD3BE] bg-parchment-200 p-6 text-center"
          >
            <Lock className="mx-auto h-8 w-8 text-[#A67635]" />
            <h2 className="mt-3 text-lg font-bold text-jade-900">
              Akses Terkunci Passkey
            </h2>
            <p className="mt-1 text-xs text-[#4B6062]">{error}</p>
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687879]" />
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Masukkan ADMIN_PASSKEY..."
                  className="h-10 w-full rounded-lg border border-[#D5CEBF] bg-white pl-9 pr-3 text-sm focus:border-jade-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-10 rounded-lg bg-jade-700 px-4 text-sm font-bold text-white"
              >
                Buka
              </button>
            </div>
          </form>
        )}

        {data && (
          <div className="mt-6 space-y-6">
            {/* 4 Kartu KPI Utama */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Kartu 1: Jumlah Responden */}
              <div className="rounded-2xl border border-[#D5CBB8] bg-[#FBF8F0] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#4B6062]">
                    Total Responden
                  </span>
                  <Users className="h-4 w-4 text-jade-700" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tabular-nums text-jade-900">
                    {allRows.length}
                  </span>
                  <span className="text-xs font-semibold text-[#5A6E70]">
                    respon masuk
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                    Valid: {validCount}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800">
                    Terdistraksi: {distractedCount}
                  </span>
                </div>
                <div className="mt-2.5 text-[11px] text-[#5A6E70]">
                  Progres target sampel (n=35):{" "}
                  <strong>{Math.min(100, Math.round((validCount / 35) * 100))}%</strong>
                </div>
              </div>

              {/* Kartu 2: Rata-rata Skor Instrumental (X) */}
              <div className="rounded-2xl border-2 border-jade-600 bg-jade-50 p-5">
                <div className="text-xs font-bold uppercase tracking-wide text-jade-800">
                  Skor Instrumental (X)
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tabular-nums text-jade-700">
                    {stats.meanX.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-[#2E4F75]">
                    ± {stats.sdX.toFixed(2)} (SD)
                  </span>
                </div>
                <div className="mt-3 text-xs text-[#1C3859]">
                  Rata-rata benar: <strong>{stats.avgCorrectX.toFixed(1)}/9</strong> • Waktu:{" "}
                  <strong>{stats.avgSecX.toFixed(1)}d</strong>
                </div>
                <div className="mt-1 text-[11px] text-[#3B5E85]">
                  Rentang nilai: {stats.minX.toFixed(1)} – {stats.maxX.toFixed(1)}
                </div>
              </div>

              {/* Kartu 3: Rata-rata Skor Berlirik (Y) */}
              <div className="rounded-2xl border-[1.6px] border-[#C59B5F] bg-[#F7F1E3] p-5">
                <div className="text-xs font-bold uppercase tracking-wide text-[#7D5A24]">
                  Skor Musik Berlirik (Y)
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tabular-nums text-[#9C5618]">
                    {stats.meanY.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-[#7D5A24]">
                    ± {stats.sdY.toFixed(2)} (SD)
                  </span>
                </div>
                <div className="mt-3 text-xs text-[#5C4930]">
                  Rata-rata benar: <strong>{stats.avgCorrectY.toFixed(1)}/9</strong> • Waktu:{" "}
                  <strong>{stats.avgSecY.toFixed(1)}d</strong>
                </div>
                <div className="mt-1 text-[11px] text-[#735C3E]">
                  Rentang nilai: {stats.minY.toFixed(1)} – {stats.maxY.toFixed(1)}
                </div>
              </div>

              {/* Kartu 4: Selisih Berpasangan (d = X - Y) & Preview Uji-t */}
              <div className="rounded-2xl border border-[#D5CBB8] bg-[#F5EFE0] p-5">
                <div className="text-xs font-bold uppercase tracking-wide text-[#1A2B42]">
                  Selisih (d = X − Y) &amp; Uji-t
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-bold tabular-nums ${
                      stats.meanD >= 0 ? "text-jade-700" : "text-[#9C5618]"
                    }`}
                  >
                    {stats.meanD >= 0 ? "+" : ""}
                    {stats.meanD.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-[#4B6062]">
                    SD: {stats.sdD.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-[#1A2B42]">
                  t-hitung: <strong>{stats.tStat.toFixed(2)}</strong> (df ={" "}
                  {Math.max(0, stats.n - 1)}) • Skew:{" "}
                  <strong>{stats.skewD.toFixed(2)}</strong>
                </div>
                <div className="mt-1 text-[11px] text-[#4B6062]">
                  Unggul Instr: <strong>{stats.instrBetter}</strong> • Unggul Lirik:{" "}
                  <strong>{stats.lyricBetter}</strong> • Sama: <strong>{stats.tied}</strong>
                </div>
              </div>
            </div>

            {/* Visual Sebaran Selisih (Cek Bentuk Lonceng/Normalitas) & Breakdown Demografi */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Sebaran Selisih d = X - Y */}
              <div className="rounded-2xl border border-[#DDD3BE] bg-[#FBF8F0] p-5 lg:col-span-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#1A2B42]">
                    Distribusi Selisih Skor (d = X − Y)
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      Math.abs(stats.skewD) <= 1
                        ? "bg-emerald-100 text-emerald-800"
                        : Math.abs(stats.skewD) <= 2
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {stats.n < 3
                      ? "Butuh ≥ 3 data"
                      : Math.abs(stats.skewD) <= 1
                      ? "Simetris (Mendekati Normal)"
                      : Math.abs(stats.skewD) <= 2
                      ? "Cukup Simetris"
                      : "Miring (Cek Outlier)"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#5A6E70]">
                  Jika balok tertinggi berada di tengah dan menurun di kiri-kanan, distribusi
                  selisih cenderung normal.
                </p>

                <div className="mt-4 space-y-2.5">
                  {stats.bins.map((b) => {
                    const pct = Math.round((b.count / stats.maxBin) * 100);
                    return (
                      <div key={b.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-[#2E4345]">
                          <span>{b.label}</span>
                          <span className="font-bold">{b.count} orang</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EAE2D0]">
                          <div
                            className="h-full rounded-full bg-jade-600 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Breakdown Demografi & Kondisi */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
                <div className="rounded-2xl border border-[#DDD3BE] bg-[#FBF8F0] p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-[#4B6062]">
                    Gender &amp; Perangkat Audio
                  </div>
                  <div className="mt-2.5 space-y-1.5 text-xs">
                    {stats.byGender.length === 0 ? (
                      <div className="text-[#8C9694]">Belum ada data</div>
                    ) : (
                      stats.byGender.map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span>{k}</span>
                          <span className="font-bold text-jade-800">{v}</span>
                        </div>
                      ))
                    )}
                    <div className="my-2 border-t border-[#E6DEC8]" />
                    {stats.byAudio.map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span>{k}</span>
                        <span className="font-bold text-[#7D5A24]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#DDD3BE] bg-[#FBF8F0] p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-[#4B6062]">
                    Kebiasaan Belajar &amp; Urutan Tes
                  </div>
                  <div className="mt-2.5 space-y-1.5 text-xs">
                    {stats.byHabit.length === 0 ? (
                      <div className="text-[#8C9694]">Belum ada data</div>
                    ) : (
                      stats.byHabit.map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span>{k}</span>
                          <span className="font-bold text-jade-800">{v}</span>
                        </div>
                      ))
                    )}
                    <div className="my-2 border-t border-[#E6DEC8]" />
                    {stats.byOrder.map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span>{k}</span>
                        <span className="font-bold text-[#7D5A24]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="flex flex-col gap-3 rounded-xl border border-[#DDD3BE] bg-[#F7F3E8] p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3B4E50]">
                  <Filter className="h-3.5 w-3.5" />
                  Filter Data:
                </span>
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    filterMode === "all"
                      ? "bg-jade-700 text-white"
                      : "bg-white text-[#3B4E50] hover:bg-jade-50"
                  }`}
                >
                  Semua ({allRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("valid")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
                    filterMode === "valid"
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Hanya Valid ({validCount})
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#687879]" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Cari inisial, ID, lagu..."
                  className="h-9 w-full rounded-lg border border-[#D5CEBF] bg-white pl-8 pr-3 text-xs text-jade-900 focus:border-jade-600 focus:outline-none sm:w-64"
                />
              </div>
            </div>

            {/* Tabel Data Responden */}
            <div className="overflow-x-auto rounded-xl border border-[#DDD3BE] bg-[#FBF8F0]">
              <table className="min-w-full divide-y divide-[#E6DEC8] text-left text-xs">
                <thead className="bg-parchment-300 font-bold text-[#1A2B42]">
                  <tr>
                    <th className="px-3 py-3">No</th>
                    <th className="px-3 py-3">ID &amp; Waktu</th>
                    <th className="px-3 py-3">Inisial / Profil</th>
                    <th className="px-3 py-3">Kebiasaan &amp; Audio</th>
                    <th className="px-3 py-3 text-jade-800">Skor Instrumental (X)</th>
                    <th className="px-3 py-3 text-[#9C5618]">Skor Berlirik (Y)</th>
                    <th className="px-3 py-3">Selisih (X−Y)</th>
                    <th className="px-3 py-3">Status Valid</th>
                    <th className="px-3 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE6D6]">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#5A6E70]">
                        Belum ada data responden yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={row.id_responden} className="hover:bg-parchment-200/60">
                        <td className="px-3 py-2.5 font-semibold text-[#5A6E70]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono font-bold text-[#1A2B42]">
                            {row.id_responden}
                          </div>
                          <div className="text-[11px] text-[#687879]">
                            {new Date(row.submitted_at).toLocaleString("id-ID", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-[#1A2B42]">
                            {row.inisial} ({row.umur} th)
                          </div>
                          <div className="text-[11px] text-[#5A6E70]">
                            {row.gender} • {row.status_pendidikan}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-[#1A2B42]">
                            {row.kebiasaan_belajar}
                          </div>
                          <div className="text-[11px] text-[#5A6E70]">
                            {row.perangkat_audio}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-jade-700">
                            {row.skor_instrumental.toFixed(2)}{" "}
                            <span className="font-normal text-[#4B6062]">
                              ({row.benar_instrumental}/9)
                            </span>
                          </div>
                          <div className="max-w-[160px] truncate text-[11px] text-[#5A6E70]">
                            {row.lagu_instrumental_judul}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-[#9C5618]">
                            {row.skor_berlirik.toFixed(2)}{" "}
                            <span className="font-normal text-[#5C4930]">
                              ({row.benar_berlirik}/9)
                            </span>
                          </div>
                          <div className="max-w-[160px] truncate text-[11px] text-[#735C3E]">
                            {row.lagu_berlirik_judul}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-bold">
                          <span
                            className={
                              row.selisih_skor >= 0 ? "text-jade-700" : "text-[#9C5618]"
                            }
                          >
                            {row.selisih_skor >= 0 ? "+" : ""}
                            {row.selisih_skor.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              row.status_valid_diri === "valid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {row.status_valid_diri}
                          </span>
                          {row.tab_switch_count > 0 && (
                            <div className="mt-0.5 text-[10.5px] text-[#80370B]">
                              Pindah tab: {row.tab_switch_count}x
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            disabled={deletingId === row.id_responden}
                            onClick={() =>
                              handleDeleteRow(row.id_responden, row.inisial)
                            }
                            title="Hapus data responden (misal data uji coba)"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ParchmentCardShell>
    </main>
  );
}
