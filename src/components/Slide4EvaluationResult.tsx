"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Copy, Loader2, Share2, Sparkles } from "lucide-react";

export interface FinalResultSummary {
  id_responden: string;
  inisial: string;
  kebiasaan_belajar: string;
  skor_instrumental: number;
  skor_berlirik: number;
  benar_instrumental: number;
  benar_berlirik: number;
  waktu_rata_instr_ms: number;
  waktu_rata_lirik_ms: number;
  selisih_skor: number;
  lagu_instrumental_judul: string;
  lagu_berlirik_judul: string;
  persona: {
    label: string;
    headline: string;
  };
}

interface Slide4EvaluationResultProps {
  lockedResult: FinalResultSummary | null;
  isSubmitting: boolean;
  submitError: string;
  onSubmitEvaluation: (payload: {
    persepsiInstrumental: number;
    persepsiBerlirik: number;
    statusValidDiri: "valid" | "terdistraksi";
  }) => void;
}

function describeEffect(val: number): string {
  if (val > 0) return `+${val} (Membantu)`;
  if (val < 0) return `${val} (Mengganggu)`;
  return "0 (Netral)";
}

export function Slide4EvaluationResult({
  lockedResult,
  isSubmitting,
  submitError,
  onSubmitEvaluation,
}: Slide4EvaluationResultProps) {
  const [persepsiInstr, setPersepsiInstr] = useState(0);
  const [persepsiLirik, setPersepsiLirik] = useState(0);
  const [statusValid, setStatusValid] = useState<"valid" | "terdistraksi">("valid");
  const [copiedType, setCopiedType] = useState<"result" | "link" | null>(null);

  const handleCopy = async (kind: "result" | "link") => {
    if (!lockedResult) return;
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
    const text =
      kind === "result"
        ? `Hasil Tes Ruang Fokus (${lockedResult.inisial}):\n• Skor Instrumental (X): ${lockedResult.skor_instrumental}/100 (${lockedResult.benar_instrumental}/9 benar)\n• Skor Berlirik (Y): ${lockedResult.skor_berlirik}/100 (${lockedResult.benar_berlirik}/9 benar)\n• Tipe Fokus: ${lockedResult.persona.label}\nIkut tesnya juga di: ${shareUrl}`
        : shareUrl;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(kind);
      setTimeout(() => setCopiedType(null), 2200);
    } catch {
      // Abaikan jika clipboard ditolak
    }
  };

  // =========================================================================
  // STATE B: KARTU HASIL & BAGIKAN (Setelah Submit / Jika Halaman di-Refresh)
  // =========================================================================
  if (lockedResult) {
    const absDiff = Math.abs(lockedResult.selisih_skor).toFixed(2);
    const instrHigher = lockedResult.selisih_skor >= 0;

    return (
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C59B5F] bg-parchment-300 px-3.5 py-1 text-xs font-bold text-[#7D5A24]">
            <Sparkles className="h-3.5 w-3.5" />
            HASIL TES FOKUS KAMU
          </span>
          <h2 className="mt-3 text-2xl font-bold text-jade-900 sm:text-3xl">
            Halo, {lockedResult.inisial}! Tipe Fokusmu:{" "}
            <span className="text-jade-700">{lockedResult.persona.label}</span>
          </h2>
          <p className="mt-1 text-sm text-[#4B6062]">
            ID Sesi Tersimpan: <span className="font-mono font-semibold">{lockedResult.id_responden}</span> • Data telah direkam secara anonim.
          </p>
        </div>

        {/* Two Variable Score Comparison Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-jade-600 bg-jade-50 p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-jade-800">
              Skor Musik Instrumental (X)
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums text-jade-700">
                {lockedResult.skor_instrumental.toFixed(2)}
              </span>
              <span className="text-base font-semibold text-[#2E4F75]">/ 100 poin</span>
            </div>
            <div className="mt-3 text-sm text-[#1C3859]">
              Benar: <strong>{lockedResult.benar_instrumental}/9</strong> soal • Rata-rata jawab:{" "}
              <strong>{(lockedResult.waktu_rata_instr_ms / 1000).toFixed(1)} detik</strong>
            </div>
            <div className="mt-1 truncate text-xs text-[#3B5E85]">
              Lagu: {lockedResult.lagu_instrumental_judul}
            </div>
          </div>

          <div className="rounded-2xl border-[1.6px] border-[#C59B5F] bg-[#F7F1E3] p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-[#7D5A24]">
              Skor Musik Berlirik (Y)
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums text-[#9C5618]">
                {lockedResult.skor_berlirik.toFixed(2)}
              </span>
              <span className="text-base font-semibold text-[#7D5A24]">/ 100 poin</span>
            </div>
            <div className="mt-3 text-sm text-[#5C4930]">
              Benar: <strong>{lockedResult.benar_berlirik}/9</strong> soal • Rata-rata jawab:{" "}
              <strong>{(lockedResult.waktu_rata_lirik_ms / 1000).toFixed(1)} detik</strong>
            </div>
            <div className="mt-1 truncate text-xs text-[#735C3E]">
              Lagu: {lockedResult.lagu_berlirik_judul}
            </div>
          </div>
        </div>

        {/* Personalized Insight Card */}
        <div className="rounded-xl border border-[#D5CBB8] bg-[#F5EFE0] p-5">
          <h3 className="text-base font-bold text-[#1A2B42]">
            Analisis Singkat Performa Kognitifmu (Selisih:{" "}
            {lockedResult.selisih_skor >= 0 ? "+" : ""}
            {lockedResult.selisih_skor.toFixed(2)} Poin)
          </h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[#3B5254]">
            {lockedResult.persona.headline} Kamu mengaku terbiasa belajar dengan kondisi{" "}
            <strong>{lockedResult.kebiasaan_belajar.toLowerCase()}</strong>, dan pada tes
            objektif ini performa belajarmu{" "}
            {instrHigher ? (
              <strong className="text-jade-700">
                lebih unggul {absDiff} poin saat musik instrumental
              </strong>
            ) : (
              <strong className="text-[#9C5618]">
                lebih unggul {absDiff} poin saat musik berlirik
              </strong>
            )}
            .
          </p>
        </div>

        {/* Share & Copy Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleCopy("result")}
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-jade-600 bg-[#FBF8F0] px-6 text-[14.5px] font-bold text-jade-700 transition hover:bg-jade-50"
          >
            {copiedType === "result" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>
              {copiedType === "result" ? "Hasil Tersalin!" : "Salin Kartu Hasil"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy("link")}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-br from-[#326296] to-[#1D3E63] px-6 text-[14.5px] font-bold text-white shadow-[0_4px_12px_rgba(24,52,84,0.28)] transition hover:brightness-105"
          >
            {copiedType === "link" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span>
              {copiedType === "link"
                ? "Link Tersalin! Bagikan ke Grup"
                : "Bagikan Link Tes ke Teman"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE A: EVALUASI PENUTUP & CEK KEJUJURAN (Sebelum Submit)
  // =========================================================================
  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
      <div className="border-b border-[#E6DEC8] pb-5 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
        <span className="inline-flex rounded-full border border-[#C59B5F] bg-parchment-300 px-3.5 py-1 text-xs font-bold text-[#7D5A24]">
          TAHAP AKHIR
        </span>
        <h2 className="mt-4 text-2xl font-bold text-jade-900">Evaluasi Singkat</h2>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#4B6062]">
          Tes pertama dan kedua sudah selesai! Berikan penilaian jujur mengenai pengaruh
          kedua jenis musik tadi sebelum kartu hasilmu dibuka.
        </p>
      </div>

      <div className="space-y-6 lg:col-span-8">
        {/* Slider 1: Instrumental */}
        <div className="rounded-xl border border-[#DDD3BE] bg-parchment-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-[15px] font-bold text-[#1A2B42]">
              1. Menurutmu, musik INSTRUMENTAL tadi memengaruhi fokusmu?
            </label>
            <span
              className={`text-sm font-bold ${
                persepsiInstr > 0
                  ? "text-jade-700"
                  : persepsiInstr < 0
                  ? "text-[#C85A17]"
                  : "text-[#5A6E70]"
              }`}
            >
              {describeEffect(persepsiInstr)}
            </span>
          </div>
          <input
            type="range"
            min={-10}
            max={10}
            step={1}
            value={persepsiInstr}
            onChange={(e) => setPersepsiInstr(Number(e.target.value))}
            className="mt-3 w-full accent-jade-700"
          />
          <div className="mt-1 flex justify-between text-xs text-[#687879]">
            <span>-10 Sangat mengganggu</span>
            <span>0 Netral</span>
            <span>+10 Sangat membantu</span>
          </div>
        </div>

        {/* Slider 2: Berlirik */}
        <div className="rounded-xl border border-[#DDD3BE] bg-parchment-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-[15px] font-bold text-[#1A2B42]">
              2. Menurutmu, musik BERLIRIK tadi memengaruhi fokusmu?
            </label>
            <span
              className={`text-sm font-bold ${
                persepsiLirik > 0
                  ? "text-jade-700"
                  : persepsiLirik < 0
                  ? "text-[#C85A17]"
                  : "text-[#5A6E70]"
              }`}
            >
              {describeEffect(persepsiLirik)}
            </span>
          </div>
          <input
            type="range"
            min={-10}
            max={10}
            step={1}
            value={persepsiLirik}
            onChange={(e) => setPersepsiLirik(Number(e.target.value))}
            className="mt-3 w-full accent-[#C85A17]"
          />
          <div className="mt-1 flex justify-between text-xs text-[#687879]">
            <span>-10 Sangat mengganggu</span>
            <span>0 Netral</span>
            <span>+10 Sangat membantu</span>
          </div>
        </div>

        {/* Cek Kejujuran */}
        <div>
          <span className="mb-2.5 block text-[15px] font-bold text-[#1A2B42]">
            3. Jujur ya (tidak memengaruhi skormu): selama tes tadi, apakah suara musik
            terdengar jelas dan kamu mengerjakan dengan fokus?
          </span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStatusValid("valid")}
              className={`flex items-center gap-2.5 rounded-[10px] border p-3.5 text-left text-sm transition ${
                statusValid === "valid"
                  ? "border-jade-600 bg-jade-50 font-bold text-jade-800"
                  : "border-[#D8D0C1] bg-[#F7F3E8] text-[#4B6062]"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Ya, suara jelas &amp; saya fokus serius</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusValid("terdistraksi")}
              className={`flex items-center gap-2.5 rounded-[10px] border p-3.5 text-left text-sm transition ${
                statusValid === "terdistraksi"
                  ? "border-[#C85A17] bg-[#FBE5C8] font-bold text-[#9C410C]"
                  : "border-[#D8D0C1] bg-[#F7F3E8] text-[#4B6062]"
              }`}
            >
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-current" />
              <span>Suara sempat mati / terdistraksi</span>
            </button>
          </div>
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-sm text-red-800">
            {submitError}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              onSubmitEvaluation({
                persepsiInstrumental: persepsiInstr,
                persepsiBerlirik: persepsiLirik,
                statusValidDiri: statusValid,
              })
            }
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-br from-[#326296] to-[#1D3E63] px-8 text-[15.5px] font-bold text-white shadow-[0_4px_12px_rgba(24,52,84,0.28)] transition hover:brightness-105 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Hasil...</span>
              </>
            ) : (
              <span>Selesai &amp; Lihat Hasil →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
