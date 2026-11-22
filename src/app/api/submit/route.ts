import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { saveSubmission } from "@/lib/db";
import { getFocusPersona, gradeRoundAnswers } from "@/lib/quiz";
import type { GradedResponseRecord, SubmitRequestBody } from "@/types/research";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitRequestBody;

    if (!body?.profile || !body?.round1 || !body?.round2) {
      return NextResponse.json({ error: "Payload tidak lengkap." }, { status: 400 });
    }

    if (Number(body.profile.umur) < 18) {
      return NextResponse.json(
        { error: "Peserta harus berusia minimal 18 tahun." },
        { status: 400 }
      );
    }

    if (body.round1.mode === body.round2.mode) {
      return NextResponse.json(
        { error: "Tes 1 dan Tes 2 harus memiliki kondisi musik yang berbeda." },
        { status: 400 }
      );
    }

    const r1Grade = gradeRoundAnswers(body.round1.answers);
    const r2Grade = gradeRoundAnswers(body.round2.answers);

    const isR1Instr = body.round1.mode === "instrumental";
    const instrGrade = isR1Instr ? r1Grade : r2Grade;
    const lyricGrade = isR1Instr ? r2Grade : r1Grade;
    const instrRound = isR1Instr ? body.round1 : body.round2;
    const lyricRound = isR1Instr ? body.round2 : body.round1;

    const selisihPersepsi = body.persepsiInstrumental - body.persepsiBerlirik;
    const selisihSkor = Number((instrGrade.score - lyricGrade.score).toFixed(2));

    const record: GradedResponseRecord = {
      id_responden: `RF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      device_id: body.deviceId || "unknown-device",
      submitted_at: new Date().toISOString(),
      urutan_kondisi: body.urutanKondisi,
      inisial: (body.profile.inisial || "").trim() || "Peserta",
      umur: Number(body.profile.umur),
      gender: body.profile.gender,
      status_pendidikan: body.profile.status_pendidikan,
      kebiasaan_belajar: body.profile.kebiasaan_belajar,
      perangkat_audio: body.profile.perangkat_audio,
      lagu_instrumental_id: instrRound.songId,
      lagu_instrumental_judul: instrRound.songTitle,
      lagu_berlirik_id: lyricRound.songId,
      lagu_berlirik_judul: lyricRound.songTitle,
      skor_instrumental: instrGrade.score,
      skor_berlirik: lyricGrade.score,
      benar_instrumental: instrGrade.correctCount,
      benar_berlirik: lyricGrade.correctCount,
      waktu_rata_instr_ms: instrGrade.avgResponseMs,
      waktu_rata_lirik_ms: lyricGrade.avgResponseMs,
      id_soal_r1: r1Grade.questionIds,
      id_soal_r2: r2Grade.questionIds,
      persepsi_instrumental: body.persepsiInstrumental,
      persepsi_berlirik: body.persepsiBerlirik,
      selisih_persepsi: selisihPersepsi,
      selisih_skor: selisihSkor,
      lolos_cek_suara: Boolean(body.profile.lolos_cek_suara),
      audio_terputar_r1: Boolean(body.round1.audioPlayed),
      audio_terputar_r2: Boolean(body.round2.audioPlayed),
      tab_switch_count: Number(body.tabSwitchCount || 0),
      status_valid_diri: body.statusValidDiri,
    };

    const storage = await saveSubmission(record);
    const persona = getFocusPersona(record.skor_instrumental, record.skor_berlirik);

    return NextResponse.json({
      success: true,
      storage,
      result: {
        id_responden: record.id_responden,
        inisial: record.inisial,
        kebiasaan_belajar: record.kebiasaan_belajar,
        skor_instrumental: record.skor_instrumental,
        skor_berlirik: record.skor_berlirik,
        benar_instrumental: record.benar_instrumental,
        benar_berlirik: record.benar_berlirik,
        waktu_rata_instr_ms: record.waktu_rata_instr_ms,
        waktu_rata_lirik_ms: record.waktu_rata_lirik_ms,
        selisih_skor: record.selisih_skor,
        lagu_instrumental_judul: record.lagu_instrumental_judul,
        lagu_berlirik_judul: record.lagu_berlirik_judul,
        persona,
        review_instrumental: instrGrade.review,
        review_berlirik: lyricGrade.review,
      },
    });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan hasil tes." },
      { status: 500 }
    );
  }
}
