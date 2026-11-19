"use client";

import React, { useEffect, useState } from "react";
import { Database, Download, KeyRound, Lock, RefreshCw } from "lucide-react";
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

export default function AdminExportPage() {
  const [passkey, setPasskey] = useState("");
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (suppliedKey = "") => {
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
  };

  useEffect(() => {
    fetchDashboard("");
  }, []);

  const downloadCsvUrl = passkey
    ? `/api/export?format=csv&key=${encodeURIComponent(passkey)}`
    : "/api/export?format=csv";

  return (
    <main className="relative min-h-screen px-4 py-8 sm:px-6">
      <OrientLandscapeBackground />

      <ParchmentCardShell>
        <div className="flex flex-col gap-4 border-b border-[#E6DEC8] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-jade-700">
              Panel Peneliti • Ruang Fokus
            </span>
            <h1 className="mt-1 text-2xl font-bold text-jade-900">
              Rekapitulasi Data Responden (SPSS / Python)
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {data && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5CEBF] bg-parchment-200 px-3 py-1.5 text-xs font-bold text-[#3B4E50]">
                <Database className="h-3.5 w-3.5 text-jade-700" />
                {data.neonConfigured
                  ? "Terhubung: Neon Postgres"
                  : "Mode Lokal (.local-data/submissions.json)"}
              </span>
            )}

            <button
              type="button"
              onClick={() => fetchDashboard(passkey)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-jade-600 bg-[#FBF8F0] px-3.5 text-xs font-bold text-jade-700 hover:bg-jade-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {data && (
              <a
                href={downloadCsvUrl}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-jade-700 px-4 text-xs font-bold text-white shadow-sm hover:bg-jade-800"
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV ({data.count})
              </a>
            )}
          </div>
        </div>

        {/* Passkey Gate (jika ADMIN_PASSKEY sudah diset di .env.local) */}
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
          <div className="mt-6 space-y-4">
            {!data.neonConfigured && (
              <div className="rounded-xl border border-[#E8C699] bg-[#FBE5C8]/60 px-4 py-3 text-xs text-[#80370B]">
                <strong>Catatan Setup Neon &amp; Passkey:</strong> Saat ini{" "}
                <code>DATABASE_URL</code> belum diisi di <code>.env.local</code>, jadi
                data disimpan otomatis secara lokal di{" "}
                <code>.local-data/submissions.json</code>. Nanti di akhir cukup isi{" "}
                <code>DATABASE_URL</code> (Neon) dan <code>ADMIN_PASSKEY</code>.
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-[#DDD3BE] bg-[#FBF8F0]">
              <table className="min-w-full divide-y divide-[#E6DEC8] text-left text-xs">
                <thead className="bg-parchment-300 font-bold text-[#18383B]">
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Inisial / Umur</th>
                    <th className="px-3 py-3">Pendidikan</th>
                    <th className="px-3 py-3">Kebiasaan</th>
                    <th className="px-3 py-3 text-jade-800">Skor Instrumental (X)</th>
                    <th className="px-3 py-3 text-[#9C5618]">Skor Berlirik (Y)</th>
                    <th className="px-3 py-3">Selisih</th>
                    <th className="px-3 py-3">Tab Switch</th>
                    <th className="px-3 py-3">Valid Diri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE6D6]">
                  {data.rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#5A6E70]">
                        Belum ada data responden. Buka halaman utama (<code>/</code>) untuk
                        mencoba tes!
                      </td>
                    </tr>
                  ) : (
                    data.rows.map((row) => (
                      <tr key={row.id_responden} className="hover:bg-parchment-200/60">
                        <td className="px-3 py-2.5 font-mono font-semibold">
                          {row.id_responden}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.inisial} ({row.umur} th)
                        </td>
                        <td className="px-3 py-2.5">{row.status_pendidikan}</td>
                        <td className="px-3 py-2.5">{row.kebiasaan_belajar}</td>
                        <td className="px-3 py-2.5 font-bold text-jade-700">
                          {row.skor_instrumental.toFixed(2)} ({row.benar_instrumental}/9)
                        </td>
                        <td className="px-3 py-2.5 font-bold text-[#9C5618]">
                          {row.skor_berlirik.toFixed(2)} ({row.benar_berlirik}/9)
                        </td>
                        <td className="px-3 py-2.5 font-semibold">
                          {row.selisih_skor >= 0 ? "+" : ""}
                          {row.selisih_skor.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5">{row.tab_switch_count}x</td>
                        <td className="px-3 py-2.5">{row.status_valid_diri}</td>
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
