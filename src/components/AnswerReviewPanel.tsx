"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, MinusCircle, Music, Music2, X, XCircle } from "lucide-react";
import type { AnswerReviewItem, ChoiceKey } from "@/types/research";

interface AnswerReviewPanelProps {
  instrumentalReview: AnswerReviewItem[];
  berlirikReview: AnswerReviewItem[];
  instrumentalLabel?: string;
  berlirikLabel?: string;
}

export function AnswerReviewPanel({
  instrumentalReview,
  berlirikReview,
  instrumentalLabel = "Tes Instrumental",
  berlirikLabel = "Tes Berlirik",
}: AnswerReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"instrumental" | "lyrical">("instrumental");

  const instrCorrect = instrumentalReview.filter((r) => r.isCorrect).length;
  const lyricCorrect = berlirikReview.filter((r) => r.isCorrect).length;
  const items = activeTab === "instrumental" ? instrumentalReview : berlirikReview;

  if (instrumentalReview.length === 0 && berlirikReview.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#DDD3BE] bg-[#FBF8F0] p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-[#E6DEC8] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-[#1A2B42]">
            Review Jawaban Benar &amp; Salah
          </h3>
          <p className="text-xs text-[#5A6E70]">
            Periksa kembali jawabanmu dan kunci jawaban di setiap tes.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-[#D8D0C1] bg-[#F3EFE5] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("instrumental")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "instrumental"
                ? "bg-jade-700 text-white shadow-sm"
                : "text-[#3B4E50] hover:text-jade-800"
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>
              {instrumentalLabel} ({instrCorrect}/{instrumentalReview.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lyrical")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "lyrical"
                ? "bg-[#9C5618] text-white shadow-sm"
                : "text-[#3B4E50] hover:text-[#9C5618]"
            }`}
          >
            <Music2 className="h-3.5 w-3.5" />
            <span>
              {berlirikLabel} ({lyricCorrect}/{berlirikReview.length})
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {items.map((item, idx) => {
          const isUnanswered = item.selected === null;

          return (
            <div
              key={`${activeTab}-${item.questionId}-${idx}`}
              className="rounded-xl border border-[#E2DAC8] bg-[#FDFBF6] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[#5A6E70]">
                  Soal {String(idx + 1).padStart(2, "0")}
                </span>

                {item.isCorrect ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/25">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Benar
                  </span>
                ) : isUnanswered ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-slate-400/30">
                    <MinusCircle className="h-3.5 w-3.5" />
                    Tidak dijawab
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FCECE0] px-2.5 py-0.5 text-xs font-bold text-[#A63D12] ring-1 ring-[#C85A17]/30">
                    <XCircle className="h-3.5 w-3.5" />
                    Salah
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm font-semibold leading-relaxed text-[#1A2B42]">
                {item.pertanyaan}
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(["A", "B", "C", "D"] as ChoiceKey[]).map((key) => {
                  const isKey = item.kunci === key;
                  const isPicked = item.selected === key;

                  let optCls = "border-[#E4DDD0] bg-[#FAF7F0] text-[#45566B]";
                  let badge: React.ReactNode = null;

                  if (isKey && isPicked) {
                    optCls = "border-emerald-600 bg-emerald-50 font-semibold text-emerald-900";
                    badge = (
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                        Jawabanmu
                      </span>
                    );
                  } else if (isKey) {
                    optCls = "border-emerald-600/75 bg-emerald-50/80 font-semibold text-emerald-900";
                    badge = (
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded bg-emerald-700/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                        Benar
                      </span>
                    );
                  } else if (isPicked) {
                    optCls = "border-[#C85A17] bg-[#FCECE0] font-semibold text-[#9C3510]";
                    badge = (
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded bg-[#C85A17] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <X className="h-3 w-3 stroke-[3]" />
                        Jawabanmu
                      </span>
                    );
                  }

                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-snug ${optCls}`}
                    >
                      <span className="font-bold">{key}.</span>
                      <span className="flex-1">{item.pilihan[key]}</span>
                      {badge}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
