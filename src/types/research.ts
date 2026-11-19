export type QuestionCategory = "logika" | "cerita" | "numerikal";
export type ChoiceKey = "A" | "B" | "C" | "D";
export type MusicMode = "instrumental" | "lyrical";
export type ConditionOrder = "instr_first" | "lyric_first";

export interface PublicQuestion {
  id: string;
  kategori: QuestionCategory;
  pertanyaan: string;
  pilihan: Record<ChoiceKey, string>;
}

export interface FullQuestion extends PublicQuestion {
  kunci: ChoiceKey;
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  genre: string;
  tags: string[];
  streamUrl: string;
  artworkUrl?: string;
  mode: MusicMode;
  source: "audius" | "jamendo" | "archive";
}

export interface ProfileData {
  inisial: string;
  umur: number;
  gender: "Laki-laki" | "Perempuan" | "Tidak menjawab";
  status_pendidikan: "D3 / D4 / S1" | "S2 / S3" | "Umum / Pekerja";
  kebiasaan_belajar: "Tanpa musik" | "Instrumental" | "Musik berlirik" | "Tergantung suasana";
  perangkat_audio: "Headset / TWS" | "Speaker perangkat";
  lolos_cek_suara: boolean;
}

export interface QuestionAnswerRecord {
  questionId: string;
  kategori: QuestionCategory;
  selected: ChoiceKey | null;
  responseTimeMs: number;
  timedOut: boolean;
}

export interface RoundSubmission {
  mode: MusicMode;
  songId: string;
  songTitle: string;
  audioPlayed: boolean;
  answers: QuestionAnswerRecord[];
}

export interface SubmitRequestBody {
  deviceId: string;
  urutanKondisi: ConditionOrder;
  profile: ProfileData;
  round1: RoundSubmission;
  round2: RoundSubmission;
  persepsiInstrumental: number;
  persepsiBerlirik: number;
  statusValidDiri: "valid" | "terdistraksi";
  tabSwitchCount: number;
}

export interface GradedResponseRecord {
  id_responden: string;
  device_id: string;
  submitted_at: string;
  urutan_kondisi: ConditionOrder;
  inisial: string;
  umur: number;
  gender: string;
  status_pendidikan: string;
  kebiasaan_belajar: string;
  perangkat_audio: string;
  lagu_instrumental_id: string;
  lagu_instrumental_judul: string;
  lagu_berlirik_id: string;
  lagu_berlirik_judul: string;
  skor_instrumental: number;
  skor_berlirik: number;
  benar_instrumental: number;
  benar_berlirik: number;
  waktu_rata_instr_ms: number;
  waktu_rata_lirik_ms: number;
  id_soal_r1: string;
  id_soal_r2: string;
  persepsi_instrumental: number;
  persepsi_berlirik: number;
  selisih_persepsi: number;
  selisih_skor: number;
  lolos_cek_suara: boolean;
  audio_terputar_r1: boolean;
  audio_terputar_r2: boolean;
  tab_switch_count: number;
  status_valid_diri: string;
}
