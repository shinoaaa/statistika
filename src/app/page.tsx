"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  BottomStageStepper,
  OrientLandscapeBackground,
  ParchmentCardShell,
} from "@/components/OrientBackdrop";
import { Slide1Profile } from "@/components/Slide1Profile";
import { SlideQuizRound } from "@/components/SlideQuizRound";
import {
  Slide4EvaluationResult,
  type FinalResultSummary,
} from "@/components/Slide4EvaluationResult";
import type {
  ConditionOrder,
  MusicMode,
  ProfileData,
  PublicQuestion,
  RoundSubmission,
  SubmitRequestBody,
} from "@/types/research";

const STORAGE_DEVICE_KEY = "ruang_fokus_device_id_v1";
const STORAGE_RESULT_KEY = "ruang_fokus_locked_result_v1";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(STORAGE_DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_DEVICE_KEY, id);
  }
  return id;
}

export default function HomePage() {
  const [booting, setBooting] = useState(true);
  const [activeSlide, setActiveSlide] = useState<1 | 2 | 3 | 4>(1);

  const [deviceId, setDeviceId] = useState("");
  const [urutanKondisi, setUrutanKondisi] = useState<ConditionOrder>("instr_first");
  const [round1Questions, setRound1Questions] = useState<PublicQuestion[]>([]);
  const [round2Questions, setRound2Questions] = useState<PublicQuestion[]>([]);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [round1Data, setRound1Data] = useState<RoundSubmission | null>(null);
  const [round2Data, setRound2Data] = useState<RoundSubmission | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [lockedResult, setLockedResult] = useState<FinalResultSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const devId = getOrCreateDeviceId();
    setDeviceId(devId);

    // Jika responden di perangkat yang sama sudah selesai, langsung kunci ke Slide 4 (Kartu Hasil)
    try {
      const savedRaw = localStorage.getItem(STORAGE_RESULT_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as FinalResultSummary;
        if (parsed && parsed.id_responden) {
          setLockedResult(parsed);
          setActiveSlide(4);
          setBooting(false);
          return;
        }
      }
    } catch {
      // Lanjut jika localStorage corrupt
    }

    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setUrutanKondisi(data.urutanKondisi);
        setRound1Questions(data.round1);
        setRound2Questions(data.round2);
      })
      .finally(() => setBooting(false));
  }, []);

  // Peringatkan pengguna jika mencoba refresh atau menutup tab saat ujian sedang berlangsung
  useEffect(() => {
    const isExamInProgress =
      !booting && !lockedResult && (activeSlide === 2 || activeSlide === 3 || activeSlide === 4);
    if (!isExamInProgress) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [booting, lockedResult, activeSlide]);

  const handleTabSwitch = useCallback(() => {
    setTabSwitchCount((c) => c + 1);
  }, []);

  const round1Mode: MusicMode =
    urutanKondisi === "instr_first" ? "instrumental" : "lyrical";
  const round2Mode: MusicMode =
    urutanKondisi === "instr_first" ? "lyrical" : "instrumental";

  const handleCompleteProfile = (data: ProfileData) => {
    setProfile(data);
    setActiveSlide(2);
  };

  const handleCompleteRound1 = (result: RoundSubmission) => {
    setRound1Data(result);
    setActiveSlide(3);
  };

  const handleCompleteRound2 = (result: RoundSubmission) => {
    setRound2Data(result);
    setActiveSlide(4);
  };

  const handleSubmitEvaluation = async (evalPayload: {
    persepsiInstrumental: number;
    persepsiBerlirik: number;
    statusValidDiri: "valid" | "terdistraksi";
  }) => {
    if (!profile || !round1Data || !round2Data) return;
    setIsSubmitting(true);
    setSubmitError("");

    const payload: SubmitRequestBody = {
      deviceId,
      urutanKondisi,
      profile,
      round1: round1Data,
      round2: round2Data,
      persepsiInstrumental: evalPayload.persepsiInstrumental,
      persepsiBerlirik: evalPayload.persepsiBerlirik,
      statusValidDiri: evalPayload.statusValidDiri,
      tabSwitchCount,
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.result) {
        throw new Error(json.error || "Gagal mengirim data.");
      }

      const finalResult = json.result as FinalResultSummary;
      localStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(finalResult));
      setLockedResult(finalResult);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-3 py-5 sm:px-6 md:py-8">
      <OrientLandscapeBackground />

      <div className="w-full">
        <ParchmentCardShell>
          {booting ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-jade-800">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Menyiapkan ruang tes fokus...</p>
            </div>
          ) : (
            <>
              {activeSlide === 1 && <Slide1Profile onNext={handleCompleteProfile} />}

              {activeSlide === 2 && (
                <SlideQuizRound
                  key={`round-1-${round1Mode}`}
                  roundNumber={1}
                  mode={round1Mode}
                  questions={round1Questions}
                  onTabSwitch={handleTabSwitch}
                  onComplete={handleCompleteRound1}
                />
              )}

              {activeSlide === 3 && (
                <SlideQuizRound
                  key={`round-2-${round2Mode}`}
                  roundNumber={2}
                  mode={round2Mode}
                  questions={round2Questions}
                  onTabSwitch={handleTabSwitch}
                  onComplete={handleCompleteRound2}
                />
              )}

              {activeSlide === 4 && (
                <Slide4EvaluationResult
                  lockedResult={lockedResult}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  onSubmitEvaluation={handleSubmitEvaluation}
                />
              )}
            </>
          )}
        </ParchmentCardShell>

        <BottomStageStepper activeStep={activeSlide} />
      </div>
    </main>
  );
}
