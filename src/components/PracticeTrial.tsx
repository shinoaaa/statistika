"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { AnswerReviewPanel } from "@/components/AnswerReviewPanel";
import { SlideQuizRound, killAllManagedAudio } from "@/components/SlideQuizRound";
import type {
  AnswerReviewItem,
  FullQuestion,
  PublicQuestion,
  RoundSubmission,
} from "@/types/research";

// Soal statis khusus mode Coba Dulu (terpisah sepenuhnya dari bank_soal.json)
const PRACTICE_INSTRUMENTAL_FULL: FullQuestion[] = [
  {
    id: "LAT-I1",
    kategori: "logika",
    pertanyaan:
      "Semua peserta seminar wajib mengenakan tanda pengenal berwarna biru. Raka tidak mengenakan tanda pengenal berwarna biru. Simpulan yang paling tepat adalah...",
    pilihan: {
      A: "Raka pasti peserta seminar.",
      B: "Raka bukan peserta seminar.",
      C: "Sebagian peserta seminar tidak memakai tanda pengenal.",
      D: "Tanda pengenal seminar sedang habis.",
    },
    kunci: "B",
  },
  {
    id: "LAT-I2",
    kategori: "cerita",
    pertanyaan:
      "Sebuah toko roti buka pukul 07.00 dan memanggang adonan baru setiap 30 menit sekali. Jika Rina tiba pukul 07.40 dan ingin membeli roti yang baru keluar dari oven, berapa menit ia harus menunggu?",
    pilihan: {
      A: "10 menit",
      B: "15 menit",
      C: "20 menit",
      D: "25 menit",
    },
    kunci: "C",
  },
  {
    id: "LAT-I3",
    kategori: "numerikal",
    pertanyaan:
      "Harga 1 buku catatan adalah Rp12.000. Jika membeli minimal 3 buku sekaligus, pembeli mendapat potongan total Rp4.000. Berapa total yang harus dibayar untuk 3 buku catatan?",
    pilihan: {
      A: "Rp28.000",
      B: "Rp30.000",
      C: "Rp32.000",
      D: "Rp36.000",
    },
    kunci: "C",
  },
];

const PRACTICE_LYRICAL_FULL: FullQuestion[] = [
  {
    id: "LAT-L1",
    kategori: "logika",
    pertanyaan:
      "Setiap studio rekaman dilengkapi peredam suara di dindingnya. Ruang Mawar tidak memiliki peredam suara di dindingnya. Simpulan yang paling tepat adalah...",
    pilihan: {
      A: "Ruang Mawar bukan studio rekaman.",
      B: "Ruang Mawar adalah studio rekaman baru.",
      C: "Sebagian studio rekaman tidak memiliki peredam suara.",
      D: "Peredam suara di Ruang Mawar sedang diperbaiki.",
    },
    kunci: "A",
  },
  {
    id: "LAT-L2",
    kategori: "cerita",
    pertanyaan:
      "Kereta komuter menuju pusat kota berangkat dari stasiun setiap 15 menit mulai pukul 06.00. Jika Dimas tiba di peron pukul 06.22, pada pukul berapa kereta berikutnya yang paling cepat dapat ia naiki?",
    pilihan: {
      A: "06.25",
      B: "06.30",
      C: "06.35",
      D: "06.45",
    },
    kunci: "B",
  },
  {
    id: "LAT-L3",
    kategori: "numerikal",
    pertanyaan:
      "Sebuah tangki air awalnya berisi 40 liter. Air dialirkan masuk dengan debit 5 liter per menit selama 6 menit. Berapa liter total air di dalam tangki sekarang?",
    pilihan: {
      A: "55 liter",
      B: "60 liter",
      C: "65 liter",
      D: "70 liter",
    },
    kunci: "D",
  },
];

const PRACTICE_DURATION_SEC = 60; // 01:00 per coba tes (3 soal, sebanding dengan 03:00 untuk 9 soal)

function toPublic(list: FullQuestion[]): PublicQuestion[] {
  return list.map(({ id, kategori, pertanyaan, pilihan }) => ({
    id,
    kategori,
    pertanyaan,
    pilihan,
  }));
}

const PRACTICE_INSTRUMENTAL_PUBLIC = toPublic(PRACTICE_INSTRUMENTAL_FULL);
const PRACTICE_LYRICAL_PUBLIC = toPublic(PRACTICE_LYRICAL_FULL);

function buildPracticeReview(
  bank: FullQuestion[],
  submission: RoundSubmission
): AnswerReviewItem[] {
  const map = new Map(bank.map((q) => [q.id, q]));
  return submission.answers
    .map((ans) => {
      const q = map.get(ans.questionId);
      if (!q) return null;
      const selected = ans.timedOut ? null : ans.selected;
      return {
        questionId: q.id,
        pertanyaan: q.pertanyaan,
        pilihan: q.pilihan,
        selected,
        kunci: q.kunci,
        isCorrect: selected !== null && selected === q.kunci,
      };
    })
    .filter((x): x is AnswerReviewItem => x !== null);
}

interface PracticeTrialProps {
  onExit: () => void;
}

export function PracticeTrial({ onExit }: PracticeTrialProps) {
  const [stage, setStage] = useState<"test1" | "test2" | "result">("test1");
  const [attemptKey, setAttemptKey] = useState(0);
  const [instrSubmission, setInstrSubmission] = useState<RoundSubmission | null>(null);
  const [lyricSubmission, setLyricSubmission] = useState<RoundSubmission | null>(null);

  useEffect(() => {
    return () => {
      killAllManagedAudio();
    };
  }, []);

  const handleExit = () => {
    killAllManagedAudio();
    onExit();
  };

  const handleRestart = () => {
    killAllManagedAudio();
    setInstrSubmission(null);
    setLyricSubmission(null);
    setAttemptKey((k) => k + 1);
    setStage("test1");
  };

  if (stage === "test1") {
    return (
      <SlideQuizRound
        key={`practice-1-${attemptKey}`}
        roundNumber={1}
        mode="instrumental"
        questions={PRACTICE_INSTRUMENTAL_PUBLIC}
        isPractice
        durationSeconds={PRACTICE_DURATION_SEC}
        onTabSwitch={() => {}}
        onExitPractice={handleExit}
        onComplete={(res) => {
          setInstrSubmission(res);
          setStage("test2");
        }}
      />
    );
  }

  if (stage === "test2") {
    return (
      <SlideQuizRound
        key={`practice-2-${attemptKey}`}
        roundNumber={2}
        mode="lyrical"
        questions={PRACTICE_LYRICAL_PUBLIC}
        isPractice
        durationSeconds={PRACTICE_DURATION_SEC}
        onTabSwitch={() => {}}
        onExitPractice={handleExit}
        onComplete={(res) => {
          setLyricSubmission(res);
          setStage("result");
        }}
      />
    );
  }

  const instrReview = instrSubmission
    ? buildPracticeReview(PRACTICE_INSTRUMENTAL_FULL, instrSubmission)
    : [];
  const lyricReview = lyricSubmission
    ? buildPracticeReview(PRACTICE_LYRICAL_FULL, lyricSubmission)
    : [];

  const instrCorrect = instrReview.filter((r) => r.isCorrect).length;
  const lyricCorrect = lyricReview.filter((r) => r.isCorrect).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C59B5F] bg-parchment-300 px-3.5 py-1 text-xs font-bold text-[#7D5A24]">
            <Sparkles className="h-3.5 w-3.5" />
            HASIL COBA TES (SIMULASI)
          </span>
          <h2 className="mt-3 text-2xl font-bold text-jade-900 sm:text-3xl">
            Simulasi Tes 1 &amp; Tes 2 Selesai!
          </h2>
          <p className="mt-1 text-sm text-[#4B6062]">
            Hasil latihan ini tidak disimpan ke data riset. Kamu bisa meninjau jawaban benar
            dan salah di bawah ini sebelum mengikuti tes asli.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExit}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-full border border-jade-600 bg-jade-50 px-4 text-xs font-bold text-jade-800 transition hover:bg-jade-100/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Menu Utama</span>
        </button>
      </div>

      {/* Ringkasan 2 Tes Latihan */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-jade-600 bg-jade-50 p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-jade-800">
            Coba Tes 1 — Instrumental
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums text-jade-700">
              {instrCorrect}/{PRACTICE_INSTRUMENTAL_FULL.length}
            </span>
            <span className="text-sm font-semibold text-[#2E4F75]">soal benar</span>
          </div>
          {instrSubmission && (
            <div className="mt-2 truncate text-xs text-[#3B5E85]">
              Lagu: {instrSubmission.songTitle}
            </div>
          )}
        </div>

        <div className="rounded-2xl border-[1.6px] border-[#C59B5F] bg-[#F7F1E3] p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-[#7D5A24]">
            Coba Tes 2 — Musik Berlirik
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums text-[#9C5618]">
              {lyricCorrect}/{PRACTICE_LYRICAL_FULL.length}
            </span>
            <span className="text-sm font-semibold text-[#7D5A24]">soal benar</span>
          </div>
          {lyricSubmission && (
            <div className="mt-2 truncate text-xs text-[#735C3E]">
              Lagu: {lyricSubmission.songTitle}
            </div>
          )}
        </div>
      </div>

      {/* Review Jawaban Benar & Salah */}
      <AnswerReviewPanel
        instrumentalReview={instrReview}
        berlirikReview={lyricReview}
        instrumentalLabel="Coba Tes 1 (Instrumental)"
        berlirikLabel="Coba Tes 2 (Berlirik)"
      />

      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-jade-600 bg-jade-50 px-5 text-sm font-bold text-jade-800 transition hover:bg-jade-100/70"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Ulangi Coba Tes</span>
        </button>

        <button
          type="button"
          onClick={handleExit}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-br from-[#326296] to-[#1D3E63] px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(24,52,84,0.28)] transition hover:brightness-105"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Menu Utama</span>
        </button>
      </div>
    </div>
  );
}
