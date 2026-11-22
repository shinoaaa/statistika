import bankRaw from "@/data/bank_soal.json";
import type {
  AnswerReviewItem,
  ChoiceKey,
  FullQuestion,
  PublicQuestion,
  QuestionAnswerRecord,
  QuestionCategory,
} from "@/types/research";

const ALL_QUESTIONS = bankRaw.soal as FullQuestion[];
export const MAX_SECONDS_PER_QUESTION = 20;
export const MAX_SECONDS_PER_ROUND = 180; // 3 menit universal per tes (9 soal)

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function stripKey(q: FullQuestion): PublicQuestion {
  return {
    id: q.id,
    kategori: q.kategori,
    pertanyaan: q.pertanyaan,
    pilihan: q.pilihan,
  };
}

/**
 * Mengambil 18 soal acak tanpa duplikasi:
 * - Ronde 1: 3 Logika + 3 Cerita + 3 Numerikal (9 soal)
 * - Ronde 2: 3 Logika + 3 Cerita + 3 Numerikal berbeda (9 soal)
 */
export function drawBalancedRounds(): {
  round1: PublicQuestion[];
  round2: PublicQuestion[];
} {
  const categories: QuestionCategory[] = ["logika", "cerita", "numerikal"];
  const r1: PublicQuestion[] = [];
  const r2: PublicQuestion[] = [];

  for (const cat of categories) {
    const pool = shuffle(ALL_QUESTIONS.filter((q) => q.kategori === cat));
    r1.push(...pool.slice(0, 3).map(stripKey));
    r2.push(...pool.slice(3, 6).map(stripKey));
  }

  return {
    round1: shuffle(r1),
    round2: shuffle(r2),
  };
}

const QUESTION_MAP = new Map<string, FullQuestion>(
  ALL_QUESTIONS.map((q) => [q.id, q])
);

/**
 * Menghitung skor kontinu 0.00 - 100.00 untuk mode ujian universal 3:00 (9 soal):
 * 75% ketepatan jawaban + 25% bonus kecepatan pengerjaan total (proporsional terhadap ketepatan).
 */
export function gradeRoundAnswers(answers: QuestionAnswerRecord[]): {
  score: number;
  correctCount: number;
  avgResponseMs: number;
  questionIds: string;
  review: AnswerReviewItem[];
} {
  const total = 9;
  const maxRoundMs = MAX_SECONDS_PER_ROUND * 1000;
  let correctCount = 0;
  let totalTimeMs = 0;
  let answeredCount = 0;
  const review: AnswerReviewItem[] = [];

  for (const ans of answers) {
    const q = QUESTION_MAP.get(ans.questionId);
    const safeMs = Math.max(0, Math.min(maxRoundMs, ans.responseTimeMs));
    totalTimeMs += safeMs;

    const isCorrect = Boolean(q && ans.selected !== null && !ans.timedOut && ans.selected === q.kunci);
    if (ans.selected !== null && !ans.timedOut) {
      answeredCount += 1;
      if (isCorrect) {
        correctCount += 1;
      }
    }

    if (q) {
      review.push({
        questionId: q.id,
        pertanyaan: q.pertanyaan,
        pilihan: q.pilihan,
        selected: ans.timedOut ? null : ans.selected,
        kunci: q.kunci,
        isCorrect,
      });
    }
  }

  const clampedRoundMs = Math.min(maxRoundMs, totalTimeMs);
  const accuracyRatio = correctCount / total;
  const speedRatio = Math.max(0, (maxRoundMs - clampedRoundMs) / maxRoundMs);
  const points = (75 + 25 * speedRatio) * accuracyRatio;

  const divisor = answeredCount > 0 ? answeredCount : Math.max(1, answers.length);

  return {
    score: Number(points.toFixed(2)),
    correctCount,
    avgResponseMs: Math.round(clampedRoundMs / divisor),
    questionIds: answers.map((a) => a.questionId).join(","),
    review,
  };
}

export function getFocusPersona(
  skorInstrumental: number,
  skorBerlirik: number
): { label: string; headline: string } {
  const diff = Number((skorInstrumental - skorBerlirik).toFixed(2));
  if (diff >= 8) {
    return {
      label: "Instrumental Thinker",
      headline: `Fokusmu ${diff.toFixed(2)} poin lebih tajam saat mendengar musik instrumental.`,
    };
  }
  if (diff <= -8) {
    return {
      label: "Lyrical Resilient",
      headline: `Unik! Skor tesmu justru lebih tinggi ${Math.abs(diff).toFixed(2)} poin di musik berlirik.`,
    };
  }
  return {
    label: "Adaptive Focuser",
    headline: "Performa kognitifmu relatif stabil di kedua kondisi musik.",
  };
}
