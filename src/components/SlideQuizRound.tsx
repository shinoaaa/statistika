"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Clock,
  Headphones,
  Loader2,
  Music,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Search,
  Volume2,
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
import { MAX_SECONDS_PER_QUESTION } from "@/lib/quiz";

interface SlideQuizRoundProps {
  roundNumber: 1 | 2;
  mode: MusicMode;
  questions: PublicQuestion[];
  onTabSwitch: () => void;
  onComplete: (result: RoundSubmission) => void;
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
    { label: "Pop", q: "pop" },
    { label: "Indie", q: "indie" },
    { label: "Tulus", q: "tulus" },
    { label: "Nadin Amizah", q: "nadin" },
    { label: "Hindia", q: "hindia" },
    { label: "Akustik", q: "acoustic" },
  ],
};

function formatDuration(sec: number): string {
  const safe = Number.isFinite(sec) && sec > 0 ? Math.floor(sec) : 0;
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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
}: AudioSeekPlayerProps) {
  const safeDuration = Math.max(1, Math.floor(durationSec || 0));
  const clampedSec = Math.min(Math.max(0, Math.floor(currentSec || 0)), safeDuration);
  const showControlButton = allowPause || (!isPlaying && !isBuffering);

  return (
    <div
      className={
        compact
          ? "space-y-2.5"
          : "mt-3 rounded-xl border border-jade-600/40 bg-[#F3FAF7] p-3.5 shadow-sm"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-bold uppercase tracking-wide text-jade-700">
            {isBuffering ? "Memuat lagu..." : isPlaying ? "Sedang diputar" : "Terjeda"}
          </div>
          <div className="truncate text-[13.5px] font-bold text-[#18383B]">{title}</div>
          {artist && <div className="truncate text-[11.5px] text-[#5A6E70]">{artist}</div>}
        </div>

        {showControlButton && (
          <button
            type="button"
            onClick={onTogglePlayPause}
            aria-label={isPlaying ? "Jeda lagu" : "Putar lagu"}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-jade-600 bg-jade-50 px-3 text-xs font-bold text-jade-800 transition hover:bg-jade-100/70"
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

      <div className="flex items-center gap-2.5">
        <span className="w-10 text-left text-[11px] font-semibold tabular-nums text-[#3B4E50]">
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
        <span className="w-10 text-right text-[11px] font-semibold tabular-nums text-[#5A6E70]">
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
}: SlideQuizRoundProps) {
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

  // Active quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS_PER_QUESTION);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [audioError, setAudioError] = useState("");

  const answersRef = useRef<QuestionAnswerRecord[]>([]);
  const questionStartMsRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songsRef = useRef<SongTrack[]>([]);
  const defaultSongsRef = useRef<SongTrack[]>([]);
  const phaseRef = useRef<"prep" | "active">("prep");
  const isSeekingRef = useRef(false);
  const lockedAdvanceRef = useRef(false);
  const fetchCounterRef = useRef(0);

  phaseRef.current = phase;

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

      const list = data.tracks ?? [];
      setSongs(list);
      songsRef.current = list;
      if (q.trim() === "" || defaultSongsRef.current.length === 0) {
        defaultSongsRef.current = list;
      }
      setFallbackNotice(Boolean(data.fallbackUsed));
      // Pertahankan lagu yang sudah dipilih atau sedang diputar saat user berpindah filter tab
      if (list.length > 0) {
        setSelectedSong((prev) => prev ?? list[0]);
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

  const abortAudioElement = (audio: HTMLAudioElement | null) => {
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
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    } catch {
      // Abaikan cleanup error
    }
  };

  useEffect(() => {
    abortAudioElement(audioRef.current);
    audioRef.current = null;
    setPhase("prep");
    setCurrentIdx(0);
    setSecondsLeft(MAX_SECONDS_PER_QUESTION);
    setSelectedChoice(null);
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
    answersRef.current = [];
    songsRef.current = [];
    defaultSongsRef.current = [];
    lockedAdvanceRef.current = false;
    fetchSongs("");

    return () => {
      abortAudioElement(audioRef.current);
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

  // Countdown timer per soal saat fase aktif
  useEffect(() => {
    if (phase !== "active") return;
    questionStartMsRef.current = performance.now();
    setSecondsLeft(MAX_SECONDS_PER_QUESTION);
    lockedAdvanceRef.current = false;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          if (!lockedAdvanceRef.current) {
            recordAndAdvance(null, true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIdx]);

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

  const startTrackPlayback = (track: SongTrack, duringActive = false) => {
    abortAudioElement(audioRef.current);
    audioRef.current = null;

    const audio = new Audio(track.streamUrl);
    audio.loop = false;
    audio.volume = 0.85;
    audioRef.current = audio;

    setPlayingTrack(track);
    if (!duringActive) {
      setSelectedSong(track);
    }
    setAudioCurrentSec(0);
    setAudioDurationSec(track.durationSec);
    setIsBufferingAudio(true);
    setIsPlayingAudio(false);
    setPreviewError("");
    setAudioError("");
    updateMediaSession(track);

    audio.onloadedmetadata = () => {
      if (audioRef.current !== audio) return;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDurationSec(audio.duration);
      }
    };
    audio.ondurationchange = () => {
      if (audioRef.current !== audio) return;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDurationSec(audio.duration);
      }
    };
    audio.ontimeupdate = () => {
      if (audioRef.current !== audio || isSeekingRef.current) return;
      setAudioCurrentSec(audio.currentTime);
    };
    audio.onplaying = () => {
      if (audioRef.current !== audio) return;
      setIsBufferingAudio(false);
      setIsPlayingAudio(true);
      setAudioPlayed(true);
    };
    audio.onplay = () => {
      if (audioRef.current !== audio) return;
      setIsPlayingAudio(true);
    };
    audio.onpause = () => {
      if (audioRef.current !== audio) return;
      setIsPlayingAudio(false);
    };
    audio.onended = () => {
      if (audioRef.current !== audio) return;
      const pool =
        songsRef.current.length > 1
          ? songsRef.current
          : defaultSongsRef.current.length > 1
          ? defaultSongsRef.current
          : songsRef.current;

      if (pool.length > 1) {
        const idx = pool.findIndex((s) => s.id === track.id);
        const nextTrack = pool[(idx >= 0 ? idx + 1 : 0) % pool.length];
        if (nextTrack && nextTrack.id !== track.id) {
          startTrackPlayback(nextTrack, phaseRef.current === "active");
          return;
        }
      }

      // Cadangan jika hanya ada 1 lagu pada daftar: putar ulang lagu tersebut
      audio.currentTime = 0;
      audio.play().catch(() => {
        if (audioRef.current === audio) setIsPlayingAudio(false);
      });
    };
    audio.onerror = () => {
      if (audioRef.current !== audio) return;
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
        if (audioRef.current !== audio) return;
        setIsBufferingAudio(false);
        setIsPlayingAudio(true);
        setAudioPlayed(true);
      },
      () => {
        if (audioRef.current !== audio) return;
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
    if (!audio || !playingTrack) {
      if (selectedSong) {
        startTrackPlayback(selectedSong, phase === "active");
      }
      return;
    }
    if (audio.paused) {
      setIsBufferingAudio(true);
      audio.play().then(
        () => {
          if (audioRef.current !== audio) return;
          setIsBufferingAudio(false);
          setIsPlayingAudio(true);
          setAudioPlayed(true);
        },
        () => {
          if (audioRef.current !== audio) return;
          setIsBufferingAudio(false);
          setIsPlayingAudio(false);
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
    startTrackPlayback(track, false);
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
    if (!selectedSong) return;
    const chosenTrack = selectedSong;
    setAudioError("");

    // Jika lagu yang dipilih sudah dimuat/diputar saat memilih lagu, lanjutkan tanpa memutus
    if (playingTrack?.id === chosenTrack.id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().then(
          () => setAudioPlayed(true),
          () => setAudioError("Klik Putar pada pemutar audio jika musik belum berbunyi.")
        );
      } else {
        setAudioPlayed(true);
      }
      setPhase("active");
      return;
    }

    startTrackPlayback(chosenTrack, true);
    setPhase("active");
  };

  const recordAndAdvance = (choice: ChoiceKey | null, timedOut: boolean) => {
    if (lockedAdvanceRef.current) return;
    lockedAdvanceRef.current = true;

    const currentQ = questions[currentIdx];
    const elapsedMs = Math.round(performance.now() - questionStartMsRef.current);

    answersRef.current = [
      ...answersRef.current,
      {
        questionId: currentQ.id,
        kategori: currentQ.kategori,
        selected: choice,
        responseTimeMs: timedOut ? MAX_SECONDS_PER_QUESTION * 1000 : elapsedMs,
        timedOut,
      },
    ];

    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      const audioEl = audioRef.current;
      const playedOk =
        audioPlayed || Boolean(audioEl && !audioEl.paused && audioEl.currentTime > 0);
      abortAudioElement(audioEl);
      audioRef.current = null;
      onComplete({
        mode,
        songId: selectedSong?.id || "unknown",
        songTitle: selectedSong?.title || "Unknown Track",
        audioPlayed: playedOk,
        answers: answersRef.current,
      });
      return;
    }

    setTimeout(() => {
      setSelectedChoice(null);
      setCurrentIdx(nextIdx);
    }, timedOut ? 0 : 180);
  };

  const handleSelectOption = (choice: ChoiceKey) => {
    if (lockedAdvanceRef.current) return;
    setSelectedChoice(choice);
    recordAndAdvance(choice, false);
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
              TES 0{roundNumber} • {isInstrumental ? "INSTRUMENTAL" : "MUSIK BERLIRIK"}
            </span>

            <h2 className="mt-4 text-2xl font-bold text-jade-900">
              {roundNumber === 1
                ? "Pilih Lagu & Mulai Tes 1"
                : "Pilih Lagu & Mulai Tes 2"}
            </h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#435A5C]">
              {isInstrumental
                ? "Pilihan lagu yang muncul di samping berupa musik instrumental tanpa vokal atau lirik untuk menemanimu selama tes."
                : "Pilihan lagu yang muncul di samping berupa lagu bervokal dan berlirik untuk menemanimu selama tes."}
            </p>

            <div className="mt-5 space-y-2 rounded-xl border border-dashed border-jade-600/60 bg-[#FBF8F0] p-4 text-[13.5px] text-[#2E4345]">
              <div className="font-bold text-jade-800">Ketentuan Tes {roundNumber}:</div>
              <p>• 9 soal pilihan ganda acak.</p>
              <p>• Batas waktu maksimal {MAX_SECONDS_PER_QUESTION} detik per soal.</p>
              <p>
                • Musik tidak dapat dijeda atau dimatikan saat tes sudah berjalan, dan
                akan lanjut ke lagu lain bila selesai.
              </p>
              <p>• Jangan me-refresh halaman sebelum seluruh tes selesai.</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              disabled={!selectedSong || loadingSongs}
              onClick={handleStartTest}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#178573] to-[#0E5E52] px-6 text-[15.5px] font-bold text-white shadow-[0_4px_12px_rgba(13,92,80,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Mulai Tes {roundNumber}</span>
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
              <h3 className="text-lg font-bold text-[#18383B]">
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
                      : "Cari Tulus, Hindia, pop..."
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
                        <div className="truncate text-[14.5px] font-bold text-[#18383B]">
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
  // STATE B (DI DALAM SLIDE YANG SAMA): 9 SOAL TES AKTIF
  // =========================================================================
  const q = questions[currentIdx];

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
      {/* Left Active Test Info, Countdown & Audio Player */}
      <div className="flex flex-col justify-between border-b border-[#E6DEC8] pb-5 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${
              isInstrumental
                ? "border-jade-600 bg-jade-50 text-jade-800"
                : "border-[#B68D4C] bg-parchment-300 text-[#7D5A24]"
            }`}
          >
            TES 0{roundNumber} • AKTIF
          </span>

          <h2 className="mt-4 text-2xl font-bold text-jade-900">
            {isInstrumental ? "Musik Instrumental" : "Musik Berlirik"}
          </h2>

          {/* Compact Non-Distracting Numeric Timer (tanpa garis/bar waktu mundur) */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#DDD3BE] bg-[#FBF8F0] px-3.5 py-2 text-xs text-[#5A6E70]">
            <Clock className="h-3.5 w-3.5 text-[#687879]" />
            <span>Sisa waktu soal:</span>
            <span className="text-sm font-bold tabular-nums text-[#18383B]">
              00:{String(secondsLeft).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#DDD3BE] bg-[#FBF8F0] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-jade-800">
            <Headphones className="h-4 w-4" />
            <span>Pemutar Audio Tes {roundNumber}</span>
          </div>
          {(playingTrack ?? selectedSong) && (
            <AudioSeekPlayer
              compact
              allowPause={false}
              title={(playingTrack ?? selectedSong)!.title}
              isPlaying={isPlayingAudio}
              isBuffering={isBufferingAudio}
              currentSec={audioCurrentSec}
              durationSec={audioDurationSec || (playingTrack ?? selectedSong)!.durationSec}
              onTogglePlayPause={togglePlayPauseCurrent}
              onSeekStart={handleSeekStart}
              onSeekPreview={handleSeekPreview}
              onSeekCommit={handleSeekCommit}
            />
          )}
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-[#5A6E70]">
            Musik tidak dapat dijeda saat tes berjalan, otomatis pindah lagu jika habis,
            dan berhenti setelah soal ke-9.
          </p>
          {audioError && <p className="mt-1 text-xs font-semibold text-[#C85A17]">{audioError}</p>}
        </div>
      </div>

      {/* Right Question & 4 Options */}
      <div className="lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-[#18383B]">
              Soal {String(currentIdx + 1).padStart(2, "0")} dari{" "}
              {String(questions.length).padStart(2, "0")}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-jade-600/40 bg-jade-50 px-3 py-1 text-xs font-bold text-jade-800">
            <Volume2 className="h-3.5 w-3.5" />
            {audioPlayed ? "Audio Aktif" : isBufferingAudio ? "Memuat Audio..." : "Audio Siap"}
          </span>
        </div>

        {/* 9-Segment Progress Bar */}
        <div className="mt-4 grid grid-cols-9 gap-2">
          {questions.map((item, idx) => (
            <div
              key={item.id}
              className={`h-2 rounded-full transition-colors ${
                idx < currentIdx
                  ? "bg-jade-700"
                  : idx === currentIdx
                  ? "bg-[#17A589]"
                  : "bg-[#DFD8C8]"
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="mt-5 rounded-xl border border-[#D5CBB8] bg-[#F5F0E2] p-5 sm:p-6">
          <p className="text-[16.5px] font-semibold leading-relaxed text-[#18383B]">
            {q.pertanyaan}
          </p>
        </div>

        {/* 4 Option Cards */}
        <div className="mt-4 space-y-3">
          {(["A", "B", "C", "D"] as const).map((key) => {
            const isSelected = selectedChoice === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectOption(key)}
                className={`flex w-full items-center gap-4 rounded-[10px] border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-jade-600 bg-jade-50 font-bold text-jade-800 shadow-sm"
                    : "border-[#D8D0C1] bg-[#FBF8F0] text-[#263E40] hover:border-jade-600/60 hover:bg-jade-50/40"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    isSelected
                      ? "border-jade-700 bg-jade-700 text-white"
                      : "border-[#BFB5A2] bg-[#EFECE2] text-[#3B4E50]"
                  }`}
                >
                  {key}
                </span>
                <span className="text-[15.5px] leading-snug">{q.pilihan[key]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
