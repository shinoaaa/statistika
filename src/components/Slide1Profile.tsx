"use client";

import React, { useRef, useState } from "react";
import {
  AudioLines,
  BookOpen,
  Calendar,
  Check,
  GraduationCap,
  Headphones,
  Play,
  User,
  Users,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Shuffle,
  ArrowRight,
} from "lucide-react";
import type { ProfileData } from "@/types/research";

interface Slide1ProfileProps {
  onNext: (profile: ProfileData) => void;
}

export function Slide1Profile({ onNext }: Slide1ProfileProps) {
  const [inisial, setInisial] = useState("");
  const [umurStr, setUmurStr] = useState("");
  const [gender, setGender] = useState<ProfileData["gender"]>("Laki-laki");
  const [statusPendidikan, setStatusPendidikan] =
    useState<ProfileData["status_pendidikan"]>("D3 / D4 / S1");
  const [kebiasaan, setKebiasaan] =
    useState<ProfileData["kebiasaan_belajar"]>("Musik berlirik");
  const [perangkat, setPerangkat] =
    useState<ProfileData["perangkat_audio"]>("Headset / TWS");

  const [hasPlayedTestAudio, setHasPlayedTestAudio] = useState(false);
  const [isPlayingCheck, setIsPlayingCheck] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parsedAge = Number(umurStr);
  const isAgeValid = Number.isInteger(parsedAge) && parsedAge >= 18 && parsedAge <= 99;

  const handlePlayCheckAudio = () => {
    setErrorMsg("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio("/audio/cek_suara_2.wav");
    audioRef.current = audio;
    setIsPlayingCheck(true);
    setHasPlayedTestAudio(true);
    audio.onended = () => setIsPlayingCheck(false);
    audio.onerror = () => {
      setIsPlayingCheck(false);
      setErrorMsg("Gagal memutar audio cek suara. Pastikan volume perangkat aktif.");
    };
    audio.play().catch(() => {
      setIsPlayingCheck(false);
      setErrorMsg("Browser memblokir pemutaran audio. Coba klik tombol sekali lagi.");
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgeValid) {
      setErrorMsg("Umur wajib diisi minimal 18 tahun (angka bulat 18–99).");
      return;
    }
    if (!consentChecked) {
      setErrorMsg("Centang persetujuan berusia minimal 18 tahun dan bersedia sukarela.");
      return;
    }

    onNext({
      inisial: inisial.trim() || "Peserta",
      umur: parsedAge,
      gender,
      status_pendidikan: statusPendidikan,
      kebiasaan_belajar: kebiasaan,
      perangkat_audio: perangkat,
      lolos_cek_suara: hasPlayedTestAudio,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
      {/* Left Info Sidebar */}
      <div className="flex flex-col justify-start border-b border-[#E6DEC8] pb-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-jade-700">
          Ruang Fokus
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-jade-900">
          Profil Singkat
        </h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-[#3B5254]">
          Silakan isi data profil di samping terlebih dahulu sebelum melanjutkan
          ke tahap tes.
        </p>

        {/* Gold Diamond Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-[1.2px] flex-1 bg-[#C59B5F]" />
          <div className="h-2.5 w-2.5 rotate-45 bg-[#C59B5F]" />
          <div className="h-[1.2px] flex-1 bg-[#C59B5F]" />
        </div>

        <p className="text-xs leading-relaxed text-[#5A6E70]">
          Semua data bersifat anonim dan hanya digunakan untuk keperluan studi.
        </p>
      </div>

      {/* Right Form Grid */}
      <div className="space-y-5 lg:col-span-8">
        {/* Row 1: Nama & Umur */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#18383B]">
              <User className="h-4 w-4 text-[#1C3D40]" />
              <span>
                Nama panggilan / inisial{" "}
                <span className="font-normal text-[#5A6E70]">(opsional)</span>
              </span>
            </label>
            <input
              type="text"
              maxLength={24}
              value={inisial}
              onChange={(e) => setInisial(e.target.value)}
              placeholder="Contoh: Nabil"
              className="h-12 w-full rounded-[10px] border border-[#D5CEBF] bg-[#F4F1E8] px-4 text-[15px] text-jade-900 placeholder:text-[#8C9694] focus:border-jade-600 focus:outline-none focus:ring-2 focus:ring-jade-600/20"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#18383B]">
              <Calendar className="h-4 w-4 text-[#1C3D40]" />
              <span>
                Umur{" "}
                <span className="font-normal text-[#5A6E70]">(minimal 18 tahun)</span>
              </span>
            </label>
            <input
              type="number"
              min={18}
              max={99}
              required
              value={umurStr}
              onChange={(e) => setUmurStr(e.target.value)}
              placeholder="Contoh: 20"
              className="h-12 w-full rounded-[10px] border border-[#D5CEBF] bg-[#F4F1E8] px-4 text-[15px] text-jade-900 placeholder:text-[#8C9694] focus:border-jade-600 focus:outline-none focus:ring-2 focus:ring-jade-600/20"
            />
          </div>
        </div>

        {/* Row 2: Gender & Status Pendidikan */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#18383B]">
              <Users className="h-4 w-4 text-[#1C3D40]" />
              <span>Jenis kelamin</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["Laki-laki", "Perempuan", "Tidak menjawab"] as const).map((g) => {
                const active = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`h-[52px] rounded-[10px] border px-2 text-[13.5px] transition-all ${
                      active
                        ? "border-jade-600 bg-jade-50 font-bold text-jade-800 shadow-sm"
                        : "border-[#D8D0C1] bg-[#F7F3E8] font-semibold text-[#3B4E50] hover:border-[#BFB5A2]"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#18383B]">
              <GraduationCap className="h-4 w-4 text-[#1C3D40]" />
              <span>Status pendidikan</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["D3 / D4 / S1", "S2 / S3", "Umum / Pekerja"] as const).map((edu) => {
                const active = statusPendidikan === edu;
                return (
                  <button
                    key={edu}
                    type="button"
                    onClick={() => setStatusPendidikan(edu)}
                    className={`h-[52px] rounded-[10px] border px-2 text-[13px] transition-all ${
                      active
                        ? "border-jade-600 bg-jade-50 font-bold text-jade-800 shadow-sm"
                        : "border-[#D8D0C1] bg-[#F7F3E8] font-semibold text-[#3B4E50] hover:border-[#BFB5A2]"
                    }`}
                  >
                    {edu}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Kebiasaan Belajar & Perangkat Audio */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#18383B]">
              <BookOpen className="h-4 w-4 text-[#1C3D40]" />
              <span>Kebiasaan belajar</span>
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { label: "Tanpa musik", Icon: VolumeX },
                  { label: "Instrumental", Icon: Music },
                  { label: "Musik berlirik", Icon: Music2 },
                  { label: "Tergantung suasana", Icon: Shuffle },
                ] as const
              ).map(({ label, Icon }) => {
                const active = kebiasaan === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setKebiasaan(label)}
                    className={`flex h-[70px] flex-col items-center justify-center gap-1.5 rounded-[10px] border px-1.5 text-center text-[12px] leading-tight transition-all ${
                      active
                        ? "border-jade-600 bg-jade-50 font-bold text-jade-800 shadow-sm"
                        : "border-[#D8D0C1] bg-[#F7F3E8] font-semibold text-[#2E4345] hover:border-[#BFB5A2]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#18383B]">
              <Headphones className="h-4 w-4 text-[#1C3D40]" />
              <span>Perangkat audio</span>
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { label: "Headset / TWS", Icon: Headphones },
                  { label: "Speaker perangkat", Icon: Volume2 },
                ] as const
              ).map(({ label, Icon }) => {
                const active = perangkat === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPerangkat(label)}
                    className={`flex h-[70px] flex-col items-center justify-center gap-1.5 rounded-[10px] border px-2 text-center text-[13.5px] transition-all ${
                      active
                        ? "border-jade-600 bg-jade-50 font-bold text-jade-800 shadow-sm"
                        : "border-[#D8D0C1] bg-[#F7F3E8] font-semibold text-[#3B4E50] hover:border-[#BFB5A2]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 4: Tes Suara Container */}
        <div className="flex flex-col gap-3.5 rounded-xl border border-[#DDD3BE] bg-parchment-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-jade-50 text-jade-700">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[15.5px] font-bold text-[#18383B]">
                Tes Suara{" "}
                <span className="text-xs font-normal text-[#5A6E70]">(opsional)</span>
              </div>
              <p className="text-xs text-[#4B6062]">
                Coba putar suara jika ingin memastikan perangkat audiomu sudah terdengar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlayCheckAudio}
            className="inline-flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-[10px] border border-jade-600 bg-jade-50 px-5 text-[13.5px] font-bold text-jade-800 shadow-sm transition hover:bg-jade-100/70"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isPlayingCheck ? "Memutar suara..." : "Putar cek suara"}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-900">
            {errorMsg}
          </div>
        )}

        {/* Row 5: Consent & CTA */}
        <div className="flex flex-col items-start justify-between gap-4 pt-1 sm:flex-row sm:items-center">
          <label className="flex cursor-pointer items-center gap-3 text-[14.5px] text-[#263E40]">
            <button
              type="button"
              role="checkbox"
              aria-checked={consentChecked}
              onClick={() => setConsentChecked((v) => !v)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                consentChecked
                  ? "border-jade-700 bg-jade-700 text-white"
                  : "border-[#456163] bg-[#FBF8F0]"
              }`}
            >
              {consentChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </button>
            <span>
              Saya berusia minimal 18 tahun dan bersedia mengikuti tes secara
              sukarela.
            </span>
          </label>

          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#178573] to-[#0E5E52] px-7 text-[15.5px] font-bold text-white shadow-[0_4px_12px_rgba(13,92,80,0.28)] transition hover:brightness-105 active:scale-[0.99]"
          >
            <span>Lanjut ke Tes 1</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
