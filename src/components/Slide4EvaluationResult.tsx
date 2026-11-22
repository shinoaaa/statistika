"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Heart,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { AnswerReviewPanel } from "@/components/AnswerReviewPanel";
import type { AnswerReviewItem } from "@/types/research";

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
  review_instrumental?: AnswerReviewItem[];
  review_berlirik?: AnswerReviewItem[];
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
  if (val >= 9) return `+${val} (Sangat membantu)`;
  if (val >= 5) return `+${val} (Membantu)`;
  if (val > 0) return `+${val} (Agak membantu)`;
  if (val <= -9) return `${val} (Sangat mengganggu)`;
  if (val <= -5) return `${val} (Mengganggu)`;
  if (val < 0) return `${val} (Agak mengganggu)`;
  return "0 (Netral)";
}

const PERCEPTION_STEPS = [
  { val: -10, size: "h-10 w-10 sm:h-11 sm:w-11", side: "neg" as const, label: "Sangat mengganggu (-10)" },
  { val: -6, size: "h-8 w-8 sm:h-9 sm:w-9", side: "neg" as const, label: "Mengganggu (-6)" },
  { val: -3, size: "h-7 w-7 sm:h-[30px] sm:w-[30px]", side: "neg" as const, label: "Agak mengganggu (-3)" },
  { val: 0, size: "h-6 w-6", side: "mid" as const, label: "Netral (0)" },
  { val: 3, size: "h-7 w-7 sm:h-[30px] sm:w-[30px]", side: "pos" as const, label: "Agak membantu (+3)" },
  { val: 6, size: "h-8 w-8 sm:h-9 sm:w-9", side: "pos" as const, label: "Membantu (+6)" },
  { val: 10, size: "h-10 w-10 sm:h-11 sm:w-11", side: "pos" as const, label: "Sangat membantu (+10)" },
] as const;

function PerceptionCircleScale({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (nextVal: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 sm:gap-4" role="radiogroup" aria-label={ariaLabel}>
        <span className="hidden shrink-0 text-xs font-bold text-[#B54E12] sm:inline">
          Mengganggu
        </span>

        <div className="relative flex flex-1 items-center justify-between py-1">
          {/* Garis slider horizontal di belakang lingkaran */}
          <div className="pointer-events-none absolute left-4 right-4 top-1/2 h-[2.5px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#D98856]/70 via-[#C8C3B8] to-[#5B84B1]/75" />

          {PERCEPTION_STEPS.map((step) => {
            const active = value === step.val;
            const ringStyle =
              step.side === "neg"
                ? active
                  ? "border-[#C85A17] bg-[#C85A17] text-white shadow-[0_0_0_4px_rgba(200,90,23,0.18)]"
                  : "border-[#C85A17] bg-[#FDFBF6] hover:bg-[#FCECE0]"
                : step.side === "pos"
                ? active
                  ? "border-jade-700 bg-jade-700 text-white shadow-[0_0_0_4px_rgba(36,75,120,0.20)]"
                  : "border-jade-700 bg-[#FDFBF6] hover:bg-jade-50"
                : active
                ? "border-[#6B7A8C] bg-[#6B7A8C] text-white shadow-[0_0_0_4px_rgba(107,122,140,0.18)]"
                : "border-[#8C98A6] bg-[#FDFBF6] hover:bg-[#ECEFF3]";

            return (
              <button
                key={step.val}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={step.label}
                title={step.label}
                onClick={() => onChange(step.val)}
                className={`relative z-10 flex items-center justify-center rounded-full border-[2.5px] transition-all duration-150 ${
                  step.size
                } ${ringStyle} ${active ? "scale-105" : "hover:scale-105"}`}
              >
                {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        <span className="hidden shrink-0 text-xs font-bold text-jade-700 sm:inline">
          Membantu
        </span>
      </div>

      <div className="mt-2 flex justify-between text-[11.5px] text-[#687879] sm:hidden">
        <span className="font-semibold text-[#B54E12]">Mengganggu</span>
        <span>Netral</span>
        <span className="font-semibold text-jade-700">Membantu</span>
      </div>
    </div>
  );
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
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
    const hasReview =
      (lockedResult.review_instrumental?.length ?? 0) > 0 ||
      (lockedResult.review_berlirik?.length ?? 0) > 0;

    return (
      <div className="space-y-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C59B5F] bg-parchment-300 px-3.5 py-1 text-xs font-bold text-[#7D5A24]">
            <Sparkles className="h-3.5 w-3.5" />
            HASIL TES FOKUS KAMU
          </span>
          <h2 className="mt-3 text-2xl font-bold text-jade-900 sm:text-3xl">
            Halo, {lockedResult.inisial}! Tipe Fokusmu:{" "}
            <span className="text-jade-700">{lockedResult.persona.label}</span>
          </h2>
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

        {/* Personalized Insight Card + Integrated Review Toggle */}
        <div className="rounded-2xl border border-[#D5CBB8] bg-[#F5EFE0] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-bold text-[#1A2B42]">
              Analisis Singkat Performa Kognitifmu (Selisih:{" "}
              {lockedResult.selisih_skor >= 0 ? "+" : ""}
              {lockedResult.selisih_skor.toFixed(2)} Poin)
            </h3>

            {hasReview && (
              <button
                type="button"
                onClick={() => setShowReview((v) => !v)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full border border-[#B89258] bg-[#FCF8EE] px-4 text-xs font-bold text-[#7D5A24] transition hover:bg-[#EFE6D2] sm:self-auto"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                <span>{showReview ? "Tutup Review Jawaban" : "Review Jawaban"}</span>
                {showReview ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
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

        {/* Review Jawaban Benar & Salah (Tes Instrumental & Berlirik) */}
        {showReview && hasReview && (
          <AnswerReviewPanel
            instrumentalReview={lockedResult.review_instrumental ?? []}
            berlirikReview={lockedResult.review_berlirik ?? []}
          />
        )}

        {/* Penutup: Ucapan Terima Kasih & Tombol Aksi di Paling Bawah */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#DFC99E] bg-[#FAF4E8] p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFE3CC] text-[#9C5618]">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A2B42]">
                Terima kasih banyak sudah meluangkan waktu mengikuti kuesioner ini!
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#5A6368]">
                Partisipasimu sangat membantu kelancaran penelitian ini. Semoga hasil
                singkat di atas juga bermanfaat untuk mengenal suasana belajar terbaikmu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 lg:shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-br from-[#326296] to-[#1D3E63] px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(24,52,84,0.28)] transition hover:brightness-105"
            >
              {copiedLink ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              <span>
                {copiedLink
                  ? "Link Tersalin!"
                  : "Bagikan Link Tes ke Teman"}
              </span>
            </button>
          </div>
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
          <PerceptionCircleScale
            value={persepsiInstr}
            onChange={setPersepsiInstr}
            ariaLabel="Pengaruh musik instrumental terhadap fokus"
          />
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
          <PerceptionCircleScale
            value={persepsiLirik}
            onChange={setPersepsiLirik}
            ariaLabel="Pengaruh musik berlirik terhadap fokus"
          />
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
