import bankRaw from "@/data/bank_soal.json";
import type {
  ChoiceKey,
  FullQuestion,
  PublicQuestion,
  QuestionAnswerRecord,
  QuestionCategory,
} from "@/types/research";

const ALL_QUESTIONS = bankRaw.soal as FullQuestion[];
export const MAX_SECONDS_PER_QUESTION = 45;

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
 * Menghitung skor kontinu 0.00 - 100.00 (75% ketepatan + 25% bonus kecepatan waktu)
 */
export function gradeRoundAnswers(answers: QuestionAnswerRecord[]): {
  score: number;
  correctCount: number;
  avgResponseMs: number;
  questionIds: string;
} {
  const total = 9;
  let points = 0;
  let correctCount = 0;
  let totalTimeMs = 0;

  for (const ans of answers) {
    const q = QUESTION_MAP.get(ans.questionId);
    const clampedMs = Math.max(200, Math.min(MAX_SECONDS_PER_QUESTION * 1000, ans.responseTimeMs));
    totalTimeMs += clampedMs;

    if (q && !ans.timedOut && ans.selected === q.kunci) {
      correctCount += 1;
      const remainingSec = Math.max(0, MAX_SECONDS_PER_QUESTION - clampedMs / 1000);
      const speedRatio = remainingSec / MAX_SECONDS_PER_QUESTION;
      points += (75 + 25 * speedRatio) / total;
    }
  }

  return {
    score: Number(points.toFixed(2)),
    correctCount,
    avgResponseMs: answers.length > 0 ? Math.round(totalTimeMs / answers.length) : 0,
    questionIds: answers.map((a) => a.questionId).join(","),
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
