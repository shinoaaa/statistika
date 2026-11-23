"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Loader2,
  Music,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import type {
  ChoiceKey,
  MusicMode,
  PublicQuestion,
  QuestionAnswerRecord,
  RoundSubmission,
  SongTrack,
} from "@/types/research";
import { MAX_SECONDS_PER_ROUND } from "@/lib/quiz";

// Registry global audio agar lagu dari Tes 1 dipastikan mati total saat pindah ke Tes 2
const activeAudioPool = new Set<HTMLAudioElement>();
let globalAudioEpoch = 0;

function killAudioElement(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    audio.onplaying = null;
    audio.onplay = null;
    audio.onpause = null;
    audio.onended = null;
    audio.onerror = null;
    audio.ontimeupdate = null;
    audio.onloadedmetadata = null;
    audio.ondurationchange = null;
    audio.muted = true;
    audio.volume = 0;
    audio.pause();
    audio.src = "";
    audio.removeAttribute("src");
    audio.load();
  } catch {
    // Abaikan cleanup error
  } finally {
    activeAudioPool.delete(audio);
  }
}

export function killAllManagedAudio(): number {
  const nextEpoch = ++globalAudioEpoch;
  for (const audio of Array.from(activeAudioPool)) {
    killAudioElement(audio);
  }
  return nextEpoch;
}

interface SlideQuizRoundProps {
  roundNumber: 1 | 2;
  mode: MusicMode;
  questions: PublicQuestion[];
  onTabSwitch: () => void;
  onComplete: (result: RoundSubmission) => void;
  isPractice?: boolean;
  durationSeconds?: number;
  onExitPractice?: () => void;
}

const QUICK_CHIPS: Record<MusicMode, Array<{ label: string; q: string }>> = {
  instrumental: [
    { label: "Semua", q: "" },
    { label: "Genshin Impact", q: "genshin" },
    { label: "Piano", q: "piano" },
    { label: "Lo-Fi", q: "lofi" },
    { label: "Akustik", q: "acoustic" },
    { label: "Jazz", q: "jazz" },
    { label: "Anime Piano", q: "anime piano" },
    { label: "Klasik", q: "classical" },
  ],
  lyrical: [
    { label: "Semua", q: "" },
    { label: "Indo", q: "indo" },
    { label: "Barat", q: "barat" },
    { label: "Pop", q: "pop" },
    { label: "Indie", q: "indie" },
    { label: "Rock", q: "rock" },
    { label: "Hindia & .Feast", q: "feast" },
    { label: "Coldplay", q: "coldplay" },
    { label: "Dewa 19", q: "dewa 19" },
    { label: "Tulus", q: "tulus" },
  ],
};

function formatDuration(sec: number): string {
  const safe = Number.isFinite(sec) && sec > 0 ? Math.floor(sec) : 0;
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatTimerMmSs(sec: number): string {
  const safe = Number.isFinite(sec) && sec > 0 ? Math.floor(sec) : 0;
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface AudioSeekPlayerProps {
  title: string;
  artist?: string;
  isPlaying: boolean;
  isBuffering: boolean;
  currentSec: number;
  durationSec: number;
  onTogglePlayPause: () => void;
  onSeekStart: () => void;
  onSeekPreview: (sec: number) => void;
  onSeekCommit: (sec: number) => void;
  compact?: boolean;
  allowPause?: boolean;
  showStatusLabel?: boolean;
}

function AudioSeekPlayer({
  title,
  artist,
  isPlaying,
  isBuffering,
  currentSec,
  durationSec,
  onTogglePlayPause,
  onSeekStart,
  onSeekPreview,
  onSeekCommit,
  compact = false,
  allowPause = true,
  showStatusLabel = true,
}: AudioSeekPlayerProps) {
  const safeDuration = Math.max(1, Math.floor(durationSec || 0));
  const clampedSec = Math.min(Math.max(0, Math.floor(currentSec || 0)), safeDuration);
  const showControlButton = allowPause || (!isPlaying && !isBuffering);

  return (
    <div
      className={
        compact
          ? "space-y-2"
          : "mt-3 rounded-xl border border-jade-600/40 bg-[#F2F7FC] p-3.5 shadow-sm"
      }
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0">
          {showStatusLabel && (
            <div className="truncate text-xs font-bold uppercase tracking-wide text-jade-700">
              {isBuffering ? "Memuat lagu..." : isPlaying ? "Sedang diputar" : "Terjeda"}
            </div>
          )}
          <div className="truncate text-[13px] font-bold text-[#1A2B42]">{title}</div>
          {artist && <div className="truncate text-[11.5px] text-[#5A6E70]">{artist}</div>}
        </div>

        {showControlButton && (
          <button
            type="button"
            onClick={onTogglePlayPause}
            aria-label={isPlaying ? "Jeda lagu" : "Putar lagu"}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-jade-600 bg-jade-50 px-2.5 text-xs font-bold text-jade-800 transition hover:bg-jade-100/70"
          >
            {isBuffering ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{isPlaying ? "Jeda" : "Putar"}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-9 text-left text-[11px] font-semibold tabular-nums text-[#3B4E50]">
          {formatDuration(clampedSec)}
        </span>
        <input
          type="range"
          min={0}
          max={safeDuration}
          step={1}
          value={clampedSec}
          aria-label="Geser posisi waktu lagu"
          onPointerDown={onSeekStart}
          onTouchStart={onSeekStart}
          onChange={(e) => onSeekPreview(Number(e.target.value))}
          onPointerUp={(e) => onSeekCommit(Number(e.currentTarget.value))}
          onTouchEnd={(e) => onSeekCommit(Number(e.currentTarget.value))}
          onKeyUp={(e) => onSeekCommit(Number(e.currentTarget.value))}
          className="h-1.5 w-full cursor-pointer accent-jade-700"
        />
        <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-[#5A6E70]">
          {formatDuration(safeDuration)}
        </span>
      </div>
    </div>
  );
}

export function SlideQuizRound({
  roundNumber,
  mode,
  questions,
  onTabSwitch,
  onComplete,
  isPractice = false,
  durationSeconds,
  onExitPractice,
}: SlideQuizRoundProps) {
  const effectiveDuration = durationSeconds ?? MAX_SECONDS_PER_ROUND;
  const [phase, setPhase] = useState<"prep" | "active">("prep");

  // Song Picker & Unified Audio Player state
  const [songs, setSongs] = useState<SongTrack[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongTrack | null>(null);
  const [playingTrack, setPlayingTrack] = useState<SongTrack | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBufferingAudio, setIsBufferingAudio] = useState(false);
  const [audioCurrentSec, setAudioCurrentSec] = useState(0);
  const [audioDurationSec, setAudioDurationSec] = useState(0);
  const [previewError, setPreviewError] = useState("");

  // Active exam state (timer universal + navigasi bebas antar nomor soal)
  const [currentIdx, setCurrentIdx] = useState(0);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState(effectiveDuration);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<ChoiceKey | null>>(() =>
    Array(questions.length).fill(null)
  );
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [audioError, setAudioError] = useState("");

  const selectedAnswersRef = useRef<Array<ChoiceKey | null>>(Array(questions.length).fill(null));
  const timeSpentMsRef = useRef<number[]>(Array(questions.length).fill(0));
  const questionEnteredAtRef = useRef<number>(0);
  const currentIdxRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songsRef = useRef<SongTrack[]>([]);
  const defaultSongsRef = useRef<SongTrack[]>([]);
  const phaseRef = useRef<"prep" | "active">("prep");
  const isSeekingRef = useRef(false);
  const examSubmittedRef = useRef(false);
  const fetchCounterRef = useRef(0);

  phaseRef.current = phase;
  currentIdxRef.current = currentIdx;

  const isInstrumental = mode === "instrumental";

  const fetchSongs = async (q = "") => {
    const reqId = ++fetchCounterRef.current;
    setLoadingSongs(true);
    setActiveQuery(q.trim());
    setPreviewError("");
    try {
      const res = await fetch(
        `/api/songs?type=${encodeURIComponent(mode)}&q=${encodeURIComponent(q.trim())}`
      );
      const data = (await res.json()) as {
        tracks?: SongTrack[];
        fallbackUsed?: boolean;
      };
      if (reqId !== fetchCounterRef.current) return;

      const list = (data.tracks ?? []).filter((t) => t.mode === mode);
      setSongs(list);
      songsRef.current = list;
      if (q.trim() === "" || defaultSongsRef.current.length === 0) {
        defaultSongsRef.current = list;
      }
      setFallbackNotice(Boolean(data.fallbackUsed));
      // Pertahankan lagu yang sudah dipilih dari mode yang sama saat user berpindah filter tab
      if (list.length > 0) {
        setSelectedSong((prev) => (prev && prev.mode === mode ? prev : list[0]));
      }
    } catch {
      if (reqId !== fetchCounterRef.current) return;
      setSongs([]);
      songsRef.current = [];
      setFallbackNotice(false);
    } finally {
      if (reqId === fetchCounterRef.current) {
        setLoadingSongs(false);
      }
    }
  };

  useEffect(() => {
    killAllManagedAudio();
    audioRef.current = null;
    const emptyAnswers = Array<ChoiceKey | null>(questions.length).fill(null);
    const emptyTimes = Array<number>(questions.length).fill(0);
    setPhase("prep");
    setCurrentIdx(0);
    setRoundSecondsLeft(effectiveDuration);
    setSelectedAnswers(emptyAnswers);
    selectedAnswersRef.current = [...emptyAnswers];
    timeSpentMsRef.current = [...emptyTimes];
    setConfirmSubmitOpen(false);
    setAudioPlayed(false);
    setAudioError("");
    setSelectedSong(null);
    setPlayingTrack(null);
    setIsPlayingAudio(false);
    setIsBufferingAudio(false);
    setAudioCurrentSec(0);
    setAudioDurationSec(0);
    setSearchQuery("");
    setActiveQuery("");
    setFallbackNotice(false);
    songsRef.current = [];
    defaultSongsRef.current = [];
    examSubmittedRef.current = false;
    fetchSongs("");

    return () => {
      killAllManagedAudio();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNumber, mode]);

  // Debounced auto-search saat mengetik
  useEffect(() => {
    if (phase !== "prep") return;
    if (searchQuery.trim() === activeQuery) return;
    const handle = window.setTimeout(() => {
      fetchSongs(searchQuery);
    }, 450);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, phase]);

  // Catat statistik perpindahan tab tanpa menghentikan musik
  useEffect(() => {
    if (phase !== "active") return;
    const handleVisibility = () => {
      if (document.hidden) {
        onTabSwitch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [phase, onTabSwitch]);

  // Timer universal untuk seluruh soal (auto-submit saat mencapai 00:00)
  useEffect(() => {
    if (phase !== "active") return;
    questionEnteredAtRef.current = performance.now();
    setRoundSecondsLeft(effectiveDuration);

    const timer = window.setInterval(() => {
      setRoundSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          if (!examSubmittedRef.current) {
            finishExamRound();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const updateMediaSession = (track: SongTrack) => {
    try {
      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: "Ruang Fokus",
        });
      }
    } catch {
      // Abaikan jika browser tidak mendukung MediaMetadata
    }
  };

  const startTrackPlayback = (
    track: SongTrack,
    duringActive = false,
    startAtSec = 0
  ) => {
    if (track.mode !== mode) return;
    const myEpoch = killAllManagedAudio();
    audioRef.current = null;

    const audio = new Audio(track.streamUrl);
    activeAudioPool.add(audio);
    audio.loop = false;
    audio.volume = 0.85;
    audioRef.current = audio;

    const safeStartSec = Number.isFinite(startAtSec) && startAtSec > 0 ? startAtSec : 0;
    let appliedInitialSeek = safeStartSec === 0;

    setPlayingTrack(track);
    if (!duringActive) {
      setSelectedSong(track);
    }
    setAudioCurrentSec(safeStartSec);
    setAudioDurationSec(track.durationSec);
    setIsBufferingAudio(true);
    setIsPlayingAudio(false);
    setPreviewError("");
    setAudioError("");
    updateMediaSession(track);

    const isStillValid = () =>
      myEpoch === globalAudioEpoch && audioRef.current === audio;

    const applyStartSeekOnce = () => {
      if (appliedInitialSeek) return;
      appliedInitialSeek = true;
      try {
        const cap =
          Number.isFinite(audio.duration) && audio.duration > 1
            ? Math.min(safeStartSec, audio.duration - 0.5)
            : safeStartSec;
        if (cap > 0) {
          audio.currentTime = cap;
        }
      } catch {
        // Abaikan jika stream belum siap seek
      }
    };

    audio.onloadedmetadata = () => {
      if (!isStillValid()) {
        killAudioElement(audio);
        return;
      }
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDurationSec(audio.duration);
      }
      applyStartSeekOnce();
    };
    audio.ondurationchange = () => {
      if (!isStillValid()) return;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDurationSec(audio.duration);
      }
    };
    audio.ontimeupdate = () => {
      if (!isStillValid() || isSeekingRef.current) return;
      setAudioCurrentSec(audio.currentTime);
    };
    audio.onplaying = () => {
      if (!isStillValid()) {
        killAudioElement(audio);
        return;
      }
      setIsBufferingAudio(false);
      setIsPlayingAudio(true);
      setAudioPlayed(true);
    };
    audio.onplay = () => {
      if (!isStillValid()) {
        killAudioElement(audio);
        return;
      }
      setIsPlayingAudio(true);
    };
    audio.onpause = () => {
      if (!isStillValid()) return;
      setIsPlayingAudio(false);
    };
    audio.onended = () => {
      if (!isStillValid()) return;
      const pool =
        songsRef.current.length > 1
          ? songsRef.current
          : defaultSongsRef.current.length > 1
          ? defaultSongsRef.current
          : songsRef.current;

      if (pool.length > 1) {
        const idx = pool.findIndex((s) => s.id === track.id);
        const nextTrack = pool[(idx >= 0 ? idx + 1 : 0) % pool.length];
        if (nextTrack && nextTrack.id !== track.id && nextTrack.mode === mode) {
          startTrackPlayback(nextTrack, phaseRef.current === "active", 0);
          return;
        }
      }

      // Cadangan jika hanya ada 1 lagu pada daftar: putar ulang lagu tersebut
      audio.currentTime = 0;
      audio.play().catch(() => {
        if (isStillValid()) setIsPlayingAudio(false);
      });
    };
    audio.onerror = () => {
      if (!isStillValid()) return;
      setIsBufferingAudio(false);
      setIsPlayingAudio(false);
      if (duringActive) {
        setAudioError("Stream lagu tersendat, mencoba melanjutkan tes.");
      } else {
        setPreviewError(`Gagal memutar "${track.title}". Silakan coba lagu lain.`);
      }
    };

    audio.play().then(
      () => {
        if (!isStillValid()) {
          killAudioElement(audio);
          return;
        }
        applyStartSeekOnce();
        setIsBufferingAudio(false);
        setIsPlayingAudio(true);
        setAudioPlayed(true);
      },
      () => {
        if (!isStillValid()) {
          killAudioElement(audio);
          return;
        }
        setIsBufferingAudio(false);
        setIsPlayingAudio(false);
        if (duringActive) {
          setAudioError("Klik Putar pada pemutar audio jika musik belum berbunyi.");
        } else {
          setPreviewError("Browser menunda pemutaran audio. Klik tombol sekali lagi.");
        }
      }
    );
  };

  const togglePlayPauseCurrent = () => {
    const audio = audioRef.current;
    if (!audio || !playingTrack || playingTrack.mode !== mode) {
      if (selectedSong && selectedSong.mode === mode) {
        startTrackPlayback(selectedSong, phase === "active", 0);
      }
      return;
    }
    if (audio.paused) {
      const resumeSec =
        Number.isFinite(audio.currentTime) && audio.currentTime > 0
          ? audio.currentTime
          : audioCurrentSec;
      setIsBufferingAudio(true);
      audio.play().then(
        () => {
          if (audioRef.current !== audio) {
            killAudioElement(audio);
            return;
          }
          setIsBufferingAudio(false);
          setIsPlayingAudio(true);
          setAudioPlayed(true);
        },
        () => {
          if (audioRef.current !== audio) return;
          startTrackPlayback(playingTrack, phase === "active", resumeSec);
        }
      );
    } else if (phase !== "active") {
      audio.pause();
    }
  };

  const toggleTrackFromList = (track: SongTrack) => {
    setPreviewError("");
    setSelectedSong(track);
    if (playingTrack?.id === track.id && audioRef.current) {
      togglePlayPauseCurrent();
      return;
    }
    startTrackPlayback(track, false, 0);
  };

  const handleSeekStart = () => {
    isSeekingRef.current = true;
  };

  const handleSeekPreview = (nextSec: number) => {
    setAudioCurrentSec(nextSec);
    if (!isSeekingRef.current && audioRef.current) {
      try {
        audioRef.current.currentTime = nextSec;
      } catch {
        // Abaikan jika stream belum siap seek
      }
    }
  };

  const handleSeekCommit = (nextSec: number) => {
    isSeekingRef.current = false;
    setAudioCurrentSec(nextSec);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = nextSec;
      } catch {
        // Abaikan jika stream belum siap seek
      }
    }
  };

  const handleStartTest = () => {
    if (!selectedSong || selectedSong.mode !== mode) return;
    const chosenTrack = selectedSong;
    setAudioError("");
    setConfirmSubmitOpen(false);
    examSubmittedRef.current = false;

    const existingAudio = audioRef.current;
    // Jika lagu yang dipilih sudah dimuat (baik sedang jalan maupun sempat dijeda), lanjutkan dari posisi detiknya
    if (
      playingTrack?.id === chosenTrack.id &&
      playingTrack.mode === mode &&
      existingAudio &&
      !existingAudio.error &&
      existingAudio.src
    ) {
      const resumeSec =
        Number.isFinite(existingAudio.currentTime) && existingAudio.currentTime > 0
          ? existingAudio.currentTime
          : audioCurrentSec;

      if (existingAudio.paused) {
        setIsBufferingAudio(true);
        existingAudio.play().then(
          () => {
            if (audioRef.current !== existingAudio) {
              killAudioElement(existingAudio);
              return;
            }
            setIsBufferingAudio(false);
            setIsPlayingAudio(true);
            setAudioPlayed(true);
          },
          () => {
            if (audioRef.current !== existingAudio) return;
            // Jika stream sempat putus saat dijeda, muat ulang langsung dari detik terakhir
            startTrackPlayback(chosenTrack, true, resumeSec);
          }
        );
      } else {
        setIsBufferingAudio(false);
        setIsPlayingAudio(true);
        setAudioPlayed(true);
      }
      setPhase("active");
      return;
    }

    startTrackPlayback(chosenTrack, true, 0);
    setPhase("active");
  };

  const flushCurrentQuestionTime = () => {
    if (questionEnteredAtRef.current <= 0) return;
    const now = performance.now();
    const delta = Math.max(0, Math.round(now - questionEnteredAtRef.current));
    const idx = currentIdxRef.current;
    timeSpentMsRef.current[idx] = (timeSpentMsRef.current[idx] ?? 0) + delta;
    questionEnteredAtRef.current = now;
  };

  const handleJumpToQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length || targetIdx === currentIdx) return;
    flushCurrentQuestionTime();
    setConfirmSubmitOpen(false);
    setCurrentIdx(targetIdx);
  };

  const handleSelectOption = (choice: ChoiceKey) => {
    if (examSubmittedRef.current) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = choice;
      selectedAnswersRef.current = next;
      return next;
    });
  };

  const finishExamRound = () => {
    if (examSubmittedRef.current) return;
    examSubmittedRef.current = true;
    flushCurrentQuestionTime();

    const audioEl = audioRef.current;
    const playedOk =
      audioPlayed || Boolean(audioEl && !audioEl.paused && audioEl.currentTime > 0);
    killAllManagedAudio();
    audioRef.current = null;

    const records: QuestionAnswerRecord[] = questions.map((item, idx) => {
      const selected = selectedAnswersRef.current[idx] ?? null;
      return {
        questionId: item.id,
        kategori: item.kategori,
        selected,
        responseTimeMs: Math.max(0, timeSpentMsRef.current[idx] ?? 0),
        timedOut: selected === null,
      };
    });

    onComplete({
      mode,
      songId: selectedSong?.id || "unknown",
      songTitle: selectedSong?.title || "Unknown Track",
      audioPlayed: playedOk,
      answers: records,
    });
  };

  const answeredCount = selectedAnswers.filter((a) => a !== null).length;

  const handleRequestSubmit = () => {
    if (answeredCount < questions.length) {
      setConfirmSubmitOpen(true);
      return;
    }
    finishExamRound();
  };

  // =========================================================================
  // STATE A (DI DALAM SLIDE YANG SAMA): PILIH LAGU & TOMBOL MULAI TES
  // =========================================================================
  if (phase === "prep") {
    return (
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
        {/* Left Briefing Column */}
        <div className="flex flex-col justify-between border-b border-[#E6DEC8] pb-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div>
            {isPractice && onExitPractice && (
              <button
                type="button"
                onClick={() => {
                  killAllManagedAudio();
                  audioRef.current = null;
                  onExitPractice();
                }}
                className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEBF] bg-[#FBF8F0] px-3 py-1.5 text-xs font-bold text-[#3B4E50] transition hover:border-jade-600/60 hover:text-jade-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Menu Utama</span>
              </button>
            )}

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${
                isInstrumental
                  ? "border-jade-600 bg-jade-50 text-jade-800"
                  : "border-[#B68D4C] bg-parchment-300 text-[#7D5A24]"
              }`}
            >
              {isInstrumental ? (
                <Music className="h-3.5 w-3.5" />
              ) : (
                <Music2 className="h-3.5 w-3.5" />
              )}
              {isPractice ? `COBA TES 0${roundNumber}` : `TES 0${roundNumber}`} •{" "}
              {isInstrumental ? "INSTRUMENTAL" : "MUSIK BERLIRIK"}
            </span>

            <h2 className="mt-4 text-2xl font-bold text-jade-900">
              {isPractice
                ? `Pilih Lagu & Coba Tes ${roundNumber}`
                : roundNumber === 1
                ? "Pilih Lagu & Mulai Tes 1"
                : "Pilih Lagu & Mulai Tes 2"}
            </h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#435A5C]">
              {isInstrumental
                ? "Pilihan lagu yang muncul di samping berupa musik instrumental tanpa vokal atau lirik untuk menemanimu selama tes."
                : "Pilihan lagu yang muncul di samping berupa lagu bervokal dan berlirik untuk menemanimu selama tes."}
            </p>

            <div className="mt-5 space-y-2 rounded-xl border border-dashed border-jade-600/60 bg-[#FBF8F0] p-4 text-[13.5px] text-[#2E4345]">
              <div className="font-bold text-jade-800">
                {isPractice ? `Simulasi Coba Tes ${roundNumber}:` : `Ketentuan Tes ${roundNumber}:`}
              </div>
              <p>
                • {questions.length} soal pilihan ganda{isPractice ? " latihan (tidak disimpan ke data riset)" : ""}, bebas berpindah antar nomor soal.
              </p>
              <p>
                • Batas waktu total {formatTimerMmSs(effectiveDuration)} untuk seluruh{" "}
                {questions.length} soal.
              </p>
              <p>
                • Musik tidak dapat dijeda atau dimatikan saat tes sudah berjalan, dan
                akan lanjut ke lagu lain bila selesai.
              </p>
              <p>
                {isPractice
                  ? "• Kamu bebas kembali ke menu utama kapan saja."
                  : "• Jangan me-refresh halaman sebelum seluruh tes selesai."}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              disabled={!selectedSong || selectedSong.mode !== mode || loadingSongs}
              onClick={handleStartTest}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#326296] to-[#1D3E63] px-6 text-[15.5px] font-bold text-white shadow-[0_4px_12px_rgba(24,52,84,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isPractice ? `Mulai Coba Tes ${roundNumber}` : `Mulai Tes ${roundNumber}`}</span>
            </button>
            {selectedSong && (
              <p className="mt-2 truncate text-center text-xs text-[#4B6062]">
                Lagu terpilih: <span className="font-bold">{selectedSong.title}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Song Picker Column */}
        <div className="lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1A2B42]">
                Pilih Lagu ({isInstrumental ? "Khusus Instrumental" : "Khusus Berlirik"})
              </h3>
              <p className="text-xs text-[#5A6E70]">
                {loadingSongs
                  ? "Mencari katalog lagu..."
                  : `Menampilkan ${songs.length} lagu ${
                      isInstrumental ? "instrumental" : "berlirik"
                    } terverifikasi`}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchSongs(searchQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687879]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isInstrumental
                      ? "Cari Genshin, piano, lofi, anime..."
                      : "Cari The 1975, Hindia, Arctic Monkeys..."
                  }
                  className="h-10 w-48 rounded-lg border border-[#D5CEBF] bg-[#F4F1E8] pl-9 pr-8 text-sm text-jade-900 placeholder:text-[#8C9694] focus:border-jade-600 focus:outline-none sm:w-60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => {
                      setSearchQuery("");
                      fetchSongs("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687879] hover:text-jade-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-jade-600 bg-[#FBF8F0] px-3 text-xs font-bold text-jade-700 hover:bg-jade-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingSongs ? "animate-spin" : ""}`} />
                Cari
              </button>
            </form>
          </div>

          {/* Quick Genre/Mood Filter Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_CHIPS[mode].map((chip) => {
              const isActive = activeQuery.toLowerCase() === chip.q.toLowerCase();
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(chip.q);
                    fetchSongs(chip.q);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "border-jade-600 bg-jade-700 text-white"
                      : "border-[#D8D0C1] bg-[#F7F3E8] text-[#3B4E50] hover:border-jade-600/60"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Persistent Mini Player (tetap muncul & berputar meski ganti tab/filter/cari) */}
          {playingTrack && (
            <AudioSeekPlayer
              title={playingTrack.title}
              artist={playingTrack.artist}
              isPlaying={isPlayingAudio}
              isBuffering={isBufferingAudio}
              currentSec={audioCurrentSec}
              durationSec={audioDurationSec}
              onTogglePlayPause={togglePlayPauseCurrent}
              onSeekStart={handleSeekStart}
              onSeekPreview={handleSeekPreview}
              onSeekCommit={handleSeekCommit}
            />
          )}

          {fallbackNotice && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#E8C699] bg-[#FBE5C8]/70 px-3 py-2 text-xs font-medium text-[#80370B]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Pencarian &ldquo;{activeQuery}&rdquo; tidak cocok untuk kategori{" "}
                {isInstrumental ? "Instrumental Murni" : "Berlirik"}. Menampilkan
                rekomendasi terverifikasi:
              </span>
            </div>
          )}

          {previewError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{previewError}</span>
            </div>
          )}

          <div className="mt-3 max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
            {loadingSongs ? (
              <div className="flex h-48 items-center justify-center gap-2 rounded-xl border border-[#DDD3BE] bg-parchment-200 text-sm font-medium text-[#4B6062]">
                <Loader2 className="h-5 w-5 animate-spin text-jade-700" />
                <span>Mengambil daftar lagu {isInstrumental ? "instrumental" : "berlirik"}...</span>
              </div>
            ) : songs.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-[#DDD3BE] bg-parchment-200 text-sm text-[#4B6062]">
                Tidak ada lagu cocok. Coba kata kunci lain atau klik chip &ldquo;Semua&rdquo;.
              </div>
            ) : (
              songs.map((track) => {
                const isSelected = selectedSong?.id === track.id;
                const isLoadedTrack = playingTrack?.id === track.id;
                const isRowPlaying = isLoadedTrack && isPlayingAudio;
                const isRowBuffering = isLoadedTrack && isBufferingAudio;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedSong(track)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? "border-jade-600 bg-jade-50 shadow-sm"
                        : "border-[#D8D0C1] bg-[#FBF8F0] hover:border-[#BFB5A2]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-jade-700 text-white"
                            : "bg-[#EFE6D2] text-[#7D5A24]"
                        }`}
                      >
                        {isInstrumental ? (
                          <Music className="h-4 w-4" />
                        ) : (
                          <Music2 className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[14.5px] font-bold text-[#1A2B42]">
                          {track.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A6E70]">
                          <span className="truncate max-w-[160px]">{track.artist}</span>
                          <span>•</span>
                          <span>{formatDuration(track.durationSec)}</span>
                          <span className="rounded bg-white/80 px-1.5 py-0.5 text-[11px] font-semibold text-jade-800">
                            {isInstrumental ? "Instrumental" : "Vokal & Lirik"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrackFromList(track);
                      }}
                      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                        isRowPlaying || isRowBuffering
                          ? "border-jade-600 bg-jade-100 text-jade-900"
                          : isLoadedTrack
                          ? "border-jade-600 bg-jade-50 text-jade-800"
                          : "border-[#D5CEBF] bg-white text-[#3B4E50] hover:border-jade-600 hover:text-jade-700"
                      }`}
                    >
                      {isRowBuffering ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Memuat...
                        </>
                      ) : isRowPlaying ? (
                        <>
                          <Pause className="h-3 w-3 fill-current" />
                          Jeda
                        </>
                      ) : isLoadedTrack ? (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          Lanjut
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          Coba
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE B (DI DALAM SLIDE YANG SAMA): 9 SOAL TES AKTIF (MODE UJIAN 03:00)
  // =========================================================================
  const q = questions[currentIdx];
  const currentSelected = selectedAnswers[currentIdx] ?? null;
  const activeDisplayTrack = playingTrack ?? selectedSong;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
      {/* Left Panel: Navigasi Nomor Soal (1-9), Submit & Pemutar Audio Ringkas */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E6DEC8] pb-5 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
        <div>
          {isPractice && onExitPractice && (
            <button
              type="button"
              onClick={() => {
                killAllManagedAudio();
                audioRef.current = null;
                onExitPractice();
              }}
              className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEBF] bg-[#FBF8F0] px-3 py-1.5 text-xs font-bold text-[#3B4E50] transition hover:border-jade-600/60 hover:text-jade-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Menu Utama</span>
            </button>
          )}

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${
              isInstrumental
                ? "border-jade-600 bg-jade-50 text-jade-800"
                : "border-[#B68D4C] bg-parchment-300 text-[#7D5A24]"
            }`}
          >
            {isPractice ? `COBA TES 0${roundNumber} • SIMULASI` : `TES 0${roundNumber} • AKTIF`}
          </span>

          <h2 className="mt-2.5 text-2xl font-bold text-jade-900">
            {isInstrumental ? "Musik Instrumental" : "Musik Berlirik"}
          </h2>

          {/* Navigasi Nomor Soal 3x3 + Timer Ringkas (Anti-Overflow di Semua Ukuran Layar) */}
          <div className="mt-3 overflow-hidden rounded-xl border border-[#DDD3BE] bg-[#FBF8F0] p-3.5">
            <div className="text-xs font-bold text-[#1A2B42]">Navigasi Soal</div>

            <div className="mt-2.5 flex items-stretch gap-2.5">
              {/* Grid 3 x 3 Lingkaran Nomor Soal (1-9) */}
              <div className="grid shrink-0 grid-cols-3 gap-1.5">
                {questions.map((item, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = selectedAnswers[idx] !== null;

                  let circleCls =
                    "border border-[#CFC6B4] bg-[#FDFBF6] text-[#45566B] hover:border-jade-600/70";
                  if (isCurrent && isAnswered) {
                    circleCls =
                      "border-2 border-jade-900 bg-jade-700 text-white ring-2 ring-jade-600/30";
                  } else if (isCurrent) {
                    circleCls =
                      "border-2 border-jade-700 bg-jade-50 text-jade-800 ring-2 ring-jade-600/25";
                  } else if (isAnswered) {
                    circleCls =
                      "border border-jade-700 bg-jade-700 text-white hover:brightness-105";
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      aria-label={`Pindah ke soal ${idx + 1}${isAnswered ? " (sudah dijawab)" : ""}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[13.5px] font-bold transition-all ${circleCls}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Panel Samping: Sisa Waktu & Status Terjawab */}
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-[#E5DEC9] bg-[#F5F0E2]/70 px-2 py-2 text-center">
                <div className="flex items-center gap-1 text-[10.5px] font-semibold text-[#5A6E70]">
                  <Clock className="h-3 w-3 shrink-0 text-[#687879]" />
                  <span className="truncate">Sisa waktu</span>
                </div>
                <div className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-[#1A2B42]">
                  {formatTimerMmSs(roundSecondsLeft)}
                </div>
                <div className="my-1.5 h-px w-8 bg-[#DCD3BF]" />
                <div className="text-[11px] font-semibold leading-tight text-[#4B6062]">
                  {answeredCount}/{questions.length} terjawab
                </div>
              </div>
            </div>

            <div className="mt-3">
              {confirmSubmitOpen ? (
                <div className="rounded-lg border border-[#E8C699] bg-[#FBE5C8]/65 p-3 text-xs text-[#80370B]">
                  <p className="font-semibold">
                    Masih ada {unansweredCount} soal belum dijawab. Tetap kumpulkan?
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={finishExamRound}
                      className="flex-1 rounded-lg bg-jade-700 px-3 py-1.5 font-bold text-white transition hover:brightness-105"
                    >
                      Ya, Kumpulkan
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSubmitOpen(false)}
                      className="rounded-lg border border-[#D5CEBF] bg-white px-3 py-1.5 font-semibold text-[#3B4E50] hover:bg-[#F7F3E8]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestSubmit}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#326296] to-[#1D3E63] px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(24,52,84,0.24)] transition hover:brightness-105"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {isPractice
                      ? `Selesai Coba Tes ${roundNumber}`
                      : `Kumpulkan Tes ${roundNumber}`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pemutar Audio Ringkas (tanpa label "Sedang Diputar" & tanpa footer panjang) */}
        <div className="rounded-xl border border-[#DDD3BE] bg-[#FBF8F0] px-3.5 py-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-[11.5px] font-bold text-jade-800">
            <Headphones className="h-3.5 w-3.5 shrink-0" />
            <span>Pemutar Audio Tes {roundNumber}</span>
          </div>
          {activeDisplayTrack && (
            <AudioSeekPlayer
              compact
              allowPause={false}
              showStatusLabel={false}
              title={activeDisplayTrack.title}
              isPlaying={isPlayingAudio}
              isBuffering={isBufferingAudio}
              currentSec={audioCurrentSec}
              durationSec={audioDurationSec || activeDisplayTrack.durationSec}
              onTogglePlayPause={togglePlayPauseCurrent}
              onSeekStart={handleSeekStart}
              onSeekPreview={handleSeekPreview}
              onSeekCommit={handleSeekCommit}
            />
          )}
          {audioError && <p className="mt-1.5 text-xs font-semibold text-[#C85A17]">{audioError}</p>}
        </div>
      </div>

      {/* Right Panel: Header Soal + Soal + 4 Pilihan + Prev/Next */}
      <div className="flex flex-col justify-between lg:col-span-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-bold text-[#1A2B42]">
              Soal {String(currentIdx + 1).padStart(2, "0")} dari{" "}
              {String(questions.length).padStart(2, "0")}
            </span>
          </div>

          {/* Question Card */}
          <div className="mt-3 rounded-xl border border-[#D5CBB8] bg-[#F5F0E2] p-4 sm:p-5">
            <p className="text-[16px] font-semibold leading-relaxed text-[#1A2B42]">
              {q.pertanyaan}
            </p>
          </div>

          {/* 4 Option Cards */}
          <div className="mt-3 space-y-2.5">
            {(["A", "B", "C", "D"] as const).map((key) => {
              const isSelected = currentSelected === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectOption(key)}
                  className={`flex w-full items-center gap-3.5 rounded-[10px] border p-3 text-left transition-all ${
                    isSelected
                      ? "border-jade-600 bg-jade-50 font-bold text-jade-800 shadow-sm"
                      : "border-[#D8D0C1] bg-[#FBF8F0] text-[#243447] hover:border-jade-600/60 hover:bg-jade-50/40"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      isSelected
                        ? "border-jade-700 bg-jade-700 text-white"
                        : "border-[#BFB5A2] bg-[#EFECE2] text-[#3B4E50]"
                    }`}
                  >
                    {key}
                  </span>
                  <span className="text-[15px] leading-snug">{q.pilihan[key]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Prev / Next Navigation */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => handleJumpToQuestion(currentIdx - 1)}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#D5CEBF] bg-[#FBF8F0] px-4 text-sm font-semibold text-[#3B4E50] transition hover:border-jade-600/60 hover:text-jade-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => handleJumpToQuestion(currentIdx + 1)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-jade-600 bg-jade-50 px-4 text-sm font-bold text-jade-800 transition hover:bg-jade-100/70"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestSubmit}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-jade-700 px-4 text-sm font-bold text-white transition hover:brightness-105"
            >
              <span>
                {isPractice
                  ? `Selesai Coba Tes ${roundNumber}`
                  : `Kumpulkan Tes ${roundNumber}`}
              </span>
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
