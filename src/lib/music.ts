import type { MusicMode, SongTrack } from "@/types/research";

const AUDIUS_BASE = "https://api.audius.co/v1";
const APP_NAME = "RuangFokusResearch";

// Kata kunci positif untuk mode INSTRUMENTAL
const INSTRUMENTAL_POSITIVE = [
  "instrumental",
  "piano",
  "lofi",
  "lo-fi",
  "ambient",
  "classical",
  "neoclassical",
  "chillhop",
  "beats",
  "beat",
  "type beat",
  "study",
  "focus",
  "sleep",
  "meditation",
  "relaxing",
  "solopiano",
  "guitar solo",
  "acoustic guitar",
  "violin",
  "cello",
  "orchestra",
  "orchestral",
  "synthwave",
  "soundtrack",
  "ost",
  "medley",
  "no vocal",
  "no vocals",
  "music box",
];

// Kata kunci terlarang di mode INSTRUMENTAL (mencegah lagu bervokal masuk)
const INSTRUMENTAL_FORBIDDEN = [
  "vocal",
  "vocals",
  "lyric",
  "lyrics",
  "lyrical",
  "sing",
  "singer",
  "songwriter",
  "acapella",
  "a capella",
  "rap",
  "spoken",
  "karaoke",
  "choir",
  "choirs",
  "feat",
  "feat.",
  "ft.",
  "lirik",
];

const INSTRUMENTAL_GENRES = new Set([
  "classical",
  "ambient",
  "lo-fi",
  "jazz",
  "soundtrack",
]);

const VOCAL_HEAVY_GENRES = new Set([
  "pop",
  "r&b/soul",
  "folk",
  "reggae",
  "country",
  "metal",
  "punk",
]);

// Kata kunci terlarang di mode BERLIRIK (mencegah musik tanpa vokal masuk)
const LYRICAL_FORBIDDEN = [
  "instrumental",
  "no vocal",
  "no vocals",
  "without vocals",
  "without lyrics",
  "no lyrics",
  "karaoke",
  "backing track",
  "type beat",
  "beats only",
  "beat only",
  "solopiano",
  "piano solo",
  "guitar solo",
  "violin solo",
  "cello solo",
  "piano cover",
  "midi",
  "sheets",
  "ambient",
  "lofi",
  "lo-fi",
  "chillhop",
  "study music",
  "sleep music",
  "meditation",
  "classical",
  "neoclassical",
  "orchestra",
  "orchestral",
  "soundtrack",
  "ost",
  "1 hour",
  "30min",
  "mix vol",
  "dj set",
];

const LYRICAL_STRICT_BLOCK_GENRES = new Set([
  "classical",
  "ambient",
  "lo-fi",
  "soundtrack",
]);

const LYRICAL_POSITIVE_GENRES = new Set([
  "pop",
  "alternative",
  "folk",
  "r&b/soul",
  "rock",
  "hip-hop/rap",
  "indie",
]);

const JUNK_OR_NSFW = [
  "sex",
  "porn",
  "explicit",
  "covidhoax",
  "x2download",
  "god guts guns",
  "tiddies",
  "nsfw",
  "bitch",
  "fuck",
  "pussy",
];

// Seed terverifikasi dari Audius (cadangan jika hasil query sempit atau kosong)
const VERIFIED_AUDIUS_SEEDS: Record<MusicMode, string[]> = {
  instrumental: [
    "4bA6r", // Summit - Ahren Merz
    "YZZPJ", // Project AER - Blue - Dreamhop Music
    "zEZmP", // Continuum - Ahren Merz
    "Wx0rk", // Beyond the Breaker - Andy Feldman
    "xkBdj", // You Never Told Me That - Joey Pecoraro
    "6RrEG", // autumn keys x boywithahalo - slowly
    "2log3", // Wednesdays - Rhayn
    "Xla7a", // A Day B4 - Thvrsday
  ],
  lyrical: [
    "ZbZ4zZa", // Die With A Smile - Lady Gaga & Bruno Mars
    "aW6rqjE", // BIRDS OF A FEATHER - Billie Eilish
    "kKx0POX", // End Of Beginning - Djo
    "QVPJ8G4", // Chocolate - The 1975
    "gJKqd",   // I Wanna Be Yours - Arctic Monkeys
    "62w39",   // Peradaban - .Feast
    "AV1g0",   // Secukupnya - Hindia
    "Oxg4V",   // Hati-Hati di Jalan - Tulus
    "KbjZRxz", // Fix You - Coldplay
    "VpoNy",   // DDU-DU DDU-DU - BLACKPINK
  ],
};

interface CuratedLyricalSpec {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  genre: string;
  tags: string[];
}

// Katalog 75 lagu berlirik populer & ikonik (Barat, K-Pop & Indonesia) terverifikasi HTTP 206 audio/mpeg di Audius
const TRENDING_LYRICAL_SPECS: CuratedLyricalSpec[] = [
  // --- Top Highlights Mix (Barat & Indo paling dikenal di posisi paling atas) ---
  {
    id: "ZbZ4zZa",
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    durationSec: 249,
    genre: "Pop",
    tags: ["pop", "trending", "barat", "bruno mars", "lady gaga", "ballad"],
  },
  {
    id: "aW6rqjE",
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    durationSec: 230,
    genre: "Pop",
    tags: ["pop", "trending", "barat", "billie eilish", "indie"],
  },
  {
    id: "kKx0POX",
    title: "End Of Beginning",
    artist: "Djo",
    durationSec: 159,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "trending", "djo"],
  },
  {
    id: "AV1g0",
    title: "Secukupnya",
    artist: "Hindia",
    durationSec: 209,
    genre: "Indie Indonesia",
    tags: ["indie", "indo", "hindia", "feast", "baskara", "trending"],
  },
  {
    id: "62w39",
    title: "Peradaban",
    artist: ".Feast",
    durationSec: 388,
    genre: "Indie Rock Indonesia",
    tags: ["indie", "rock", "indo", "feast", "hindia", "baskara", "trending"],
  },
  {
    id: "QVPJ8G4",
    title: "Chocolate",
    artist: "The 1975",
    durationSec: 226,
    genre: "Indie Pop / Alt Rock",
    tags: ["indie", "pop", "rock", "barat", "the 1975", "1975", "trending"],
  },
  {
    id: "gJKqd",
    title: "I Wanna Be Yours (Cover)",
    artist: "Arctic Monkeys",
    durationSec: 273,
    genre: "Indie Rock",
    tags: ["indie", "rock", "barat", "arctic monkeys", "arctic monkey", "trending"],
  },
  {
    id: "7O8YZgj",
    title: "Mangu",
    artist: "Fourtwnty",
    durationSec: 262,
    genre: "Indie Folk Indonesia",
    tags: ["indie", "folk", "indo", "fourtwnty", "trending"],
  },
  {
    id: "Oxg4V",
    title: "Hati-Hati di Jalan",
    artist: "Tulus",
    durationSec: 242,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "tulus", "trending", "ballad"],
  },
  {
    id: "p9a0K",
    title: "Apocalypse",
    artist: "Cigarettes After Sex",
    durationSec: 290,
    genre: "Dream Pop / Indie",
    tags: ["indie", "pop", "barat", "cigarettes after sex", "trending"],
  },
  {
    id: "2lp1bg1",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    durationSec: 179,
    genre: "Pop",
    tags: ["pop", "barat", "taylor swift", "trending"],
  },
  {
    id: "KbjZRxz",
    title: "Fix You",
    artist: "Coldplay",
    durationSec: 296,
    genre: "Pop Rock",
    tags: ["pop", "rock", "barat", "coldplay", "trending"],
  },
  {
    id: "VpoNy",
    title: "DDU-DU DDU-DU",
    artist: "BLACKPINK",
    durationSec: 215,
    genre: "K-Pop",
    tags: ["pop", "kpop", "blackpink", "black", "barat", "trending"],
  },
  {
    id: "6xM2m",
    title: "Sisa Rasa",
    artist: "Mahalini",
    durationSec: 328,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "trending", "mahalini", "galau", "ballad"],
  },
  {
    id: "82Nw9",
    title: "To The Bone",
    artist: "Pamungkas",
    durationSec: 318,
    genre: "Indie Pop",
    tags: ["indie", "pop", "indo", "trending", "pamungkas"],
  },
  {
    id: "PWgX35N",
    title: "Sailor Song",
    artist: "Gigi Perez",
    durationSec: 211,
    genre: "Indie Folk",
    tags: ["indie", "folk", "barat", "gigi perez", "trending"],
  },
  {
    id: "dGjjYXy",
    title: "Starboy (feat. Daft Punk)",
    artist: "The Weeknd",
    durationSec: 273,
    genre: "Pop / R&B",
    tags: ["pop", "rnb", "barat", "the weeknd", "weeknd", "trending"],
  },
  {
    id: "MoPA5xm",
    title: "betty (feat. White Chorus)",
    artist: "Hindia",
    durationSec: 265,
    genre: "Indie Indonesia",
    tags: ["indie", "indo", "hindia", "feast", "white chorus", "white", "trending"],
  },
  {
    id: "JBzK2",
    title: "Runtuh",
    artist: "Feby Putri & Fiersa Besari",
    durationSec: 224,
    genre: "Indie Pop Indonesia",
    tags: ["indie", "pop", "indo", "feby putri", "fiersa besari", "trending"],
  },
  {
    id: "P9bZZ9R",
    title: "Kangen",
    artist: "Dewa 19",
    durationSec: 333,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "dewa 19", "dewa", "trending"],
  },

  // --- The 1975, Arctic Monkeys, Lady Gaga, BLACKPINK, Cigarettes After Sex ---
  {
    id: "PkMR0NN",
    title: "Somebody Else (Cover)",
    artist: "The 1975",
    durationSec: 190,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "the 1975", "1975"],
  },
  {
    id: "1av1d",
    title: "Fluorescent Adolescent",
    artist: "Arctic Monkeys",
    durationSec: 176,
    genre: "Indie Rock",
    tags: ["indie", "rock", "barat", "arctic monkeys", "arctic monkey"],
  },
  {
    id: "8ZYWq4W",
    title: "Shallow (Cover)",
    artist: "Lady Gaga & Bradley Cooper",
    durationSec: 238,
    genre: "Pop Ballad",
    tags: ["pop", "barat", "lady gaga", "ballad"],
  },
  {
    id: "0EbMk",
    title: "Always Remember Us This Way (Acoustic)",
    artist: "Lady Gaga",
    durationSec: 136,
    genre: "Pop Acoustic",
    tags: ["pop", "barat", "lady gaga", "acoustic", "ballad"],
  },
  {
    id: "V0gZP",
    title: "How You Like That",
    artist: "BLACKPINK",
    durationSec: 185,
    genre: "K-Pop",
    tags: ["pop", "kpop", "blackpink", "black", "barat"],
  },
  {
    id: "Nx9w31Q",
    title: "Cry",
    artist: "Cigarettes After Sex",
    durationSec: 256,
    genre: "Dream Pop / Indie",
    tags: ["indie", "pop", "barat", "cigarettes after sex"],
  },

  // --- .Feast & Hindia ---
  {
    id: "PGOZ7",
    title: "Berita Kehilangan (feat. Rayssa Dynta)",
    artist: ".Feast",
    durationSec: 254,
    genre: "Indie Rock Indonesia",
    tags: ["indie", "rock", "indo", "feast", "hindia", "baskara"],
  },
  {
    id: "VpWqB",
    title: "Rumah Ke Rumah",
    artist: "Hindia",
    durationSec: 277,
    genre: "Indie Indonesia",
    tags: ["indie", "indo", "hindia", "feast", "baskara"],
  },
  {
    id: "Byxgj",
    title: "Evakuasi",
    artist: "Hindia",
    durationSec: 218,
    genre: "Indie Indonesia",
    tags: ["indie", "indo", "hindia", "feast", "baskara"],
  },
  {
    id: "b5gYb",
    title: "Membasuh (feat. Rara Sekar)",
    artist: "Hindia",
    durationSec: 374,
    genre: "Indie Indonesia",
    tags: ["indie", "indo", "hindia", "feast", "baskara"],
  },

  // --- Coldplay, Bruno Mars, Taylor Swift, NIKI, Laufey, yung kai ---
  {
    id: "Z4bXj9v",
    title: "Viva la Vida",
    artist: "Coldplay",
    durationSec: 242,
    genre: "Pop Rock",
    tags: ["pop", "rock", "barat", "coldplay"],
  },
  {
    id: "M2GK9Xx",
    title: "A Sky Full of Stars",
    artist: "Coldplay",
    durationSec: 266,
    genre: "Pop Rock",
    tags: ["pop", "rock", "barat", "coldplay"],
  },
  {
    id: "MYw83bx",
    title: "The Scientist",
    artist: "Coldplay",
    durationSec: 303,
    genre: "Pop Rock",
    tags: ["pop", "rock", "barat", "coldplay", "ballad"],
  },
  {
    id: "km3BWaj",
    title: "Paradise",
    artist: "Coldplay",
    durationSec: 274,
    genre: "Pop Rock",
    tags: ["pop", "rock", "barat", "coldplay"],
  },
  {
    id: "8PyoG5p",
    title: "Talking To The Moon",
    artist: "Bruno Mars",
    durationSec: 231,
    genre: "Pop Ballad",
    tags: ["pop", "barat", "bruno mars", "ballad"],
  },
  {
    id: "yg0dkzr",
    title: "Delicate",
    artist: "Taylor Swift",
    durationSec: 234,
    genre: "Pop",
    tags: ["pop", "barat", "taylor swift"],
  },
  {
    id: "yBOJ7x",
    title: "Bad Blood (feat. Kendrick Lamar)",
    artist: "Taylor Swift",
    durationSec: 244,
    genre: "Pop",
    tags: ["pop", "barat", "taylor swift", "kendrick lamar"],
  },
  {
    id: "83NV8GP",
    title: "You'll Be in My Heart (Cover)",
    artist: "NIKI",
    durationSec: 242,
    genre: "Pop",
    tags: ["pop", "barat", "indo", "niki", "indie", "acoustic"],
  },
  {
    id: "rGwlxJY",
    title: "blue (Cover)",
    artist: "yung kai",
    durationSec: 200,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "yung kai"],
  },
  {
    id: "Ov9KV9Q",
    title: "Let You Break My Heart Again",
    artist: "Laufey",
    durationSec: 272,
    genre: "Folk / Jazz Pop",
    tags: ["indie", "folk", "laufey", "barat", "acoustic"],
  },
  {
    id: "51d9x3J",
    title: "Falling Behind (Acoustic)",
    artist: "Laufey",
    durationSec: 213,
    genre: "Indie Acoustic",
    tags: ["indie", "acoustic", "laufey", "barat"],
  },

  // --- Indie Barat, Alt-Rock & Pop Hits Lainnya ---
  {
    id: "vgVQgmV",
    title: "Here With Me",
    artist: "d4vd",
    durationSec: 221,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "d4vd"],
  },
  {
    id: "GNkbj",
    title: "Sunflower",
    artist: "Rex Orange County",
    durationSec: 258,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "rex orange county"],
  },
  {
    id: "Kxlgo",
    title: "Best Friend",
    artist: "Rex Orange County",
    durationSec: 262,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "rex orange county"],
  },
  {
    id: "NQaybjx",
    title: "death bed (coffee for your head)",
    artist: "Powfu & beabadoobee",
    durationSec: 173,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "powfu", "beabadoobee"],
  },
  {
    id: "Ex46r",
    title: "Creep",
    artist: "Radiohead",
    durationSec: 239,
    genre: "Alternative Rock",
    tags: ["rock", "indie", "barat", "radiohead"],
  },
  {
    id: "xj5ZMkY",
    title: "Wonderwall",
    artist: "Oasis",
    durationSec: 279,
    genre: "Britpop / Rock",
    tags: ["rock", "pop", "barat", "oasis"],
  },
  {
    id: "3vMK0",
    title: "Payphone",
    artist: "Maroon 5",
    durationSec: 222,
    genre: "Pop",
    tags: ["pop", "barat", "maroon 5"],
  },
  {
    id: "mRZxr",
    title: "Teenagers",
    artist: "My Chemical Romance",
    durationSec: 162,
    genre: "Alt Rock",
    tags: ["rock", "barat", "my chemical romance", "mcr"],
  },
  {
    id: "7OK69Oy",
    title: "I Don't Love You",
    artist: "My Chemical Romance",
    durationSec: 238,
    genre: "Alt Rock",
    tags: ["rock", "barat", "my chemical romance", "mcr"],
  },
  {
    id: "WbGP6qv",
    title: "Best Part (Acoustic Cover)",
    artist: "Daniel Caesar ft. H.E.R.",
    durationSec: 176,
    genre: "R&B / Acoustic",
    tags: ["rnb", "indie", "acoustic", "barat", "daniel caesar"],
  },
  {
    id: "D7Pbv",
    title: "you were good to me",
    artist: "Jeremy Zucker & Chelsea Cutler",
    durationSec: 227,
    genre: "Indie Pop",
    tags: ["indie", "pop", "barat", "jeremy zucker"],
  },

  // --- Pop & Indie Indonesia Populer ---
  {
    id: "ja9qV",
    title: "Sepatu",
    artist: "Tulus",
    durationSec: 222,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "tulus"],
  },
  {
    id: "JE9aZ6k",
    title: "Kisah Sebentar",
    artist: "Tulus",
    durationSec: 175,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "tulus"],
  },
  {
    id: "bl5QX",
    title: "Tukar Jiwa",
    artist: "Tulus",
    durationSec: 230,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "tulus"],
  },
  {
    id: "4W96VAa",
    title: "Risalah Hati",
    artist: "Dewa 19",
    durationSec: 293,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "dewa 19", "dewa"],
  },
  {
    id: "Pg8861k",
    title: "Separuh Nafas",
    artist: "Dewa 19",
    durationSec: 300,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "dewa 19", "dewa"],
  },
  {
    id: "bmPmJ",
    title: "Aku Milikmu",
    artist: "Dewa 19",
    durationSec: 334,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "dewa 19", "dewa"],
  },
  {
    id: "NbP3YZ",
    title: "Sephia",
    artist: "Sheila on 7",
    durationSec: 294,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "sheila on 7", "so7"],
  },
  {
    id: "Kxgry",
    title: "Menghapus Jejakmu",
    artist: "Peterpan",
    durationSec: 185,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "peterpan", "noah"],
  },
  {
    id: "8M3Xv",
    title: "Mungkin Nanti",
    artist: "Peterpan",
    durationSec: 269,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "peterpan", "noah"],
  },
  {
    id: "W64zv",
    title: "Semua Tentang Kita",
    artist: "Peterpan",
    durationSec: 268,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "peterpan", "noah"],
  },
  {
    id: "JNWKz",
    title: "Ada Apa Denganmu",
    artist: "Peterpan",
    durationSec: 281,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "peterpan", "noah"],
  },
  {
    id: "44gKd",
    title: "Aku Tenang",
    artist: "Fourtwnty",
    durationSec: 232,
    genre: "Indie Folk Indonesia",
    tags: ["indie", "folk", "indo", "fourtwnty"],
  },
  {
    id: "VEayP",
    title: "Akad",
    artist: "Payung Teduh",
    durationSec: 259,
    genre: "Indie Folk Indonesia",
    tags: ["indie", "folk", "indo", "payung teduh"],
  },
  {
    id: "3v0bZ",
    title: "Desember",
    artist: "Efek Rumah Kaca",
    durationSec: 258,
    genre: "Indie Rock Indonesia",
    tags: ["indie", "rock", "indo", "efek rumah kaca", "erk"],
  },
  {
    id: "REWzj",
    title: "Waktu Yang Salah",
    artist: "Fiersa Besari",
    durationSec: 324,
    genre: "Indie Pop Indonesia",
    tags: ["indie", "pop", "indo", "fiersa besari"],
  },
  {
    id: "yyE2Bm7",
    title: "April",
    artist: "Fiersa Besari",
    durationSec: 262,
    genre: "Indie Pop Indonesia",
    tags: ["indie", "pop", "indo", "fiersa besari"],
  },
  {
    id: "k4xaON3",
    title: "Growing Up",
    artist: "Nadin Amizah",
    durationSec: 298,
    genre: "Indie Folk",
    tags: ["indie", "folk", "indo", "nadin amizah"],
  },
  {
    id: "OZR0Jg",
    title: "Ah",
    artist: "Nadin Amizah",
    durationSec: 232,
    genre: "Indie Folk",
    tags: ["indie", "folk", "indo", "nadin amizah", "acoustic"],
  },
  {
    id: "mWgk2",
    title: "Melawan Restu",
    artist: "Mahalini",
    durationSec: 260,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "mahalini", "ballad"],
  },
  {
    id: "ORaKl",
    title: "Hingga Tua Bersama",
    artist: "Rizky Febian",
    durationSec: 266,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "rizky febian", "ballad"],
  },
  {
    id: "xPY6q",
    title: "Laskar Pelangi",
    artist: "Nidji",
    durationSec: 234,
    genre: "Pop Rock Indonesia",
    tags: ["pop", "rock", "indo", "nidji"],
  },
  {
    id: "M0o0X",
    title: "Cinta dan Rahasia",
    artist: "Yura Yunita ft. Glenn Fredly",
    durationSec: 264,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "yura yunita", "glenn fredly"],
  },
  {
    id: "82EG0q3",
    title: "Bawalah Cintaku",
    artist: "Afgan",
    durationSec: 303,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "afgan", "ballad"],
  },
  {
    id: "P7vxN",
    title: "Merasa Indah",
    artist: "Tiara Andini",
    durationSec: 136,
    genre: "Pop Indonesia",
    tags: ["pop", "indo", "tiara andini", "ballad"],
  },
];

const TRENDING_LYRICAL_TRACKS: SongTrack[] = TRENDING_LYRICAL_SPECS.map((spec) => ({
  id: spec.id,
  title: spec.title,
  artist: spec.artist,
  durationSec: spec.durationSec,
  genre: spec.genre,
  tags: spec.tags,
  streamUrl: `${AUDIUS_BASE}/tracks/${encodeURIComponent(spec.id)}/stream?app_name=${APP_NAME}`,
  mode: "lyrical",
  source: "audius",
}));

function filterTrendingLyricalTracks(query: string): SongTrack[] {
  const trimmed = query.trim().toLowerCase().replace(/^\.+/, "");
  if (!trimmed) {
    return TRENDING_LYRICAL_TRACKS;
  }
  const tokens = trimmed
    .split(/\s+/)
    .map((t) => t.replace(/^\.+/, ""))
    .filter((t) => t.length >= 2 && !["lagu", "song", "music", "lyrics", "lirik", "vocal"].includes(t));
  if (tokens.length === 0) return [];

  return TRENDING_LYRICAL_TRACKS.filter((track) => {
    const blob = `${track.title} ${track.artist} ${track.genre} ${track.tags.join(" ")}`
      .toLowerCase()
      .replace(/\./g, "");
    return tokens.every((t) => blob.includes(t));
  });
}

// Track instrumental Genshin Impact terverifikasi di Audius (piano/lofi/orchestral)
const GENSHIN_AUDIUS_SEEDS = [
  "z2mdp",  // Yu-Peng Chen - The Fading Stories (Remake) [Classical Piano]
  "kRZkV",  // Inazuma Miscellany (Genshin Impact) | Piano
  "JGjBz",  // Eula Theme: Flickering Candlelight | Piano
  "4Aabr",  // Hu Tao's Theme ~ Genshin Impact Lofi
  "kKRGK",  // Dragonspine Frost ~ Genshin Impact Lofi
  "P6NkN",  // Raiden Shogun Theme (Termination of Desires) - Epic Dark Version
  "K5pxw",  // Illusory Apparitions (Cover) Genshin Impact
];

const GENSHIN_KEYWORDS = [
  "genshin",
  "hoyo",
  "hoyomix",
  "yu-peng",
  "yupeng",
  "mondstadt",
  "liyue",
  "inazuma",
  "sumeru",
  "fontaine",
  "dragonspine",
  "wangshu",
  "qingce",
  "teyvat",
  "kazuha",
  "nahida",
  "nilou",
  "hu tao",
  "eula",
  "raiden",
];

const GENSHIN_NOISE_ARTISTS = new Set(["panzerwafflez"]);

interface GenshinArchiveSpec {
  id: string;
  archiveItem: string;
  file: string;
  title: string;
  artist: string;
  durationSec: number;
  tags: string[];
  featured?: boolean;
}

function buildArchiveUrl(archiveItem: string, filePath: string): string {
  const encodedPath = filePath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `https://archive.org/download/${encodeURIComponent(archiveItem)}/${encodedPath}`;
}

function buildGenshinArchiveTrack(spec: GenshinArchiveSpec): SongTrack {
  return {
    id: spec.id,
    title: spec.title,
    artist: spec.artist,
    durationSec: spec.durationSec,
    genre: "Genshin OST",
    tags: spec.tags,
    streamUrl: buildArchiveUrl(spec.archiveItem, spec.file),
    artworkUrl: `https://archive.org/services/img/${encodeURIComponent(spec.archiveItem)}`,
    mode: "instrumental",
    source: "archive",
  };
}

// Katalog OST resmi Genshin Impact murni instrumental (terverifikasi HTTP 206 audio/mpeg)
const GENSHIN_ARCHIVE_SPECS: GenshinArchiveSpec[] = [
  {
    id: "gi_twilight_serenity",
    archiveItem: "genshin-impact-ost-flac-city-of-winds-and-idylls",
    file: "City of Winds and Idylls/City of Winds and Idylls/01 - Twilight Serenity (Genshin Impact Main Theme Var.).mp3",
    title: "Twilight Serenity (Genshin Main Theme)",
    artist: "Yu-Peng Chen • Mondstadt",
    durationSec: 102,
    tags: ["genshin", "genshin impact", "mondstadt", "piano", "main theme"],
    featured: true,
  },
  {
    id: "gi_liyue",
    archiveItem: "1-01-liyue",
    file: "1-01 Liyue.mp3",
    title: "Liyue",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 276,
    tags: ["genshin", "genshin impact", "liyue", "guzheng", "orchestral"],
    featured: true,
  },
  {
    id: "gi_inazuma",
    archiveItem: "1-01-inazuma",
    file: "1-01 Inazuma.mp3",
    title: "Inazuma",
    artist: "Yu-Peng Chen • Inazuma",
    durationSec: 330,
    tags: ["genshin", "genshin impact", "inazuma", "koto", "orchestral"],
    featured: true,
  },
  {
    id: "gi_sumeru",
    archiveItem: "1-01-sumeru",
    file: "1-01 Sumeru.mp3",
    title: "Sumeru",
    artist: "HOYO-MiX • Sumeru",
    durationSec: 285,
    tags: ["genshin", "genshin impact", "sumeru", "sitar", "orchestral"],
  },
  {
    id: "gi_fontaine",
    archiveItem: "1-01-fontaine",
    file: "1-01 Fontaine.mp3",
    title: "Fontaine",
    artist: "Yuan Dimeng • HOYO-MiX • Fontaine",
    durationSec: 273,
    tags: ["genshin", "genshin impact", "fontaine", "strings", "orchestral"],
  },
  {
    id: "gi_for_riddles",
    archiveItem: "1-01-sumeru",
    file: "1-04 For Riddles, For Wonders.mp3",
    title: "For Riddles, For Wonders",
    artist: "HOYO-MiX • Sumeru",
    durationSec: 134,
    tags: ["genshin", "genshin impact", "sumeru", "nahida", "piano"],
    featured: true,
  },
  {
    id: "gi_moonlike_smile",
    archiveItem: "06-ad-oblivione",
    file: "17 Moonlike Smile.mp3",
    title: "Moonlike Smile",
    artist: "Yu-Peng Chen • Dragonspine",
    durationSec: 78,
    tags: ["genshin", "genshin impact", "dragonspine", "piano", "cello"],
  },
  {
    id: "gi_qingce_night",
    archiveItem: "1-01-liyue",
    file: "2-02 The Fading Stories (Qingce Night).mp3",
    title: "The Fading Stories (Qingce Night)",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 129,
    tags: ["genshin", "genshin impact", "liyue", "qingce", "piano"],
  },
  {
    id: "gi_qingce_day",
    archiveItem: "1-01-liyue",
    file: "2-01 Peaceful Hike (Qingce Daytime).mp3",
    title: "Peaceful Hike (Qingce Daytime)",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 131,
    tags: ["genshin", "genshin impact", "liyue", "qingce", "flute"],
  },
  {
    id: "gi_wangshu_day",
    archiveItem: "1-01-liyue",
    file: "1-11 Cozy Leisure Time (Wangshu Daytime).mp3",
    title: "Cozy Leisure Time (Wangshu Daytime)",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 90,
    tags: ["genshin", "genshin impact", "liyue", "wangshu", "acoustic"],
  },
  {
    id: "gi_wangshu_night",
    archiveItem: "1-01-liyue",
    file: "1-12 Sojourner's Sweet Dream (Wangshu Night).mp3",
    title: "Sojourner's Sweet Dream (Wangshu Night)",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 96,
    tags: ["genshin", "genshin impact", "liyue", "wangshu", "relaxing"],
  },
  {
    id: "gi_moon_in_cup",
    archiveItem: "1-01-liyue",
    file: "1-02 Moon in One's Cup.mp3",
    title: "Moon in One's Cup",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 118,
    tags: ["genshin", "genshin impact", "liyue", "dizi", "chill"],
  },
  {
    id: "gi_sun_rises_liyue",
    archiveItem: "1-01-liyue",
    file: "1-05 Sun Rises in Liyue.mp3",
    title: "Sun Rises in Liyue",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 102,
    tags: ["genshin", "genshin impact", "liyue", "guzheng", "piano"],
  },
  {
    id: "gi_good_night_liyue",
    archiveItem: "1-01-liyue",
    file: "1-06 Good Night, Liyue.mp3",
    title: "Good Night, Liyue",
    artist: "Yu-Peng Chen • Liyue",
    durationSec: 88,
    tags: ["genshin", "genshin impact", "liyue", "ambient", "calm"],
  },
  {
    id: "gi_legend_wind",
    archiveItem: "genshin-impact-ost-flac-city-of-winds-and-idylls",
    file: "City of Winds and Idylls/City of Winds and Idylls/02 - Legend of the Wind.mp3",
    title: "Legend of the Wind",
    artist: "Yu-Peng Chen • Mondstadt",
    durationSec: 87,
    tags: ["genshin", "genshin impact", "mondstadt", "flute", "ambient"],
  },
  {
    id: "gi_bustling_mondstadt",
    archiveItem: "genshin-impact-ost-flac-city-of-winds-and-idylls",
    file: "City of Winds and Idylls/City of Winds and Idylls/04 - Bustling Afternoon in Mondstadt.mp3",
    title: "Bustling Afternoon in Mondstadt",
    artist: "Yu-Peng Chen • Mondstadt",
    durationSec: 108,
    tags: ["genshin", "genshin impact", "mondstadt", "acoustic"],
  },
  {
    id: "gi_dusk_mondstadt",
    archiveItem: "genshin-impact-ost-flac-city-of-winds-and-idylls",
    file: "City of Winds and Idylls/City of Winds and Idylls/05 - Dusk in Mondstadt.mp3",
    title: "Dusk in Mondstadt",
    artist: "Yu-Peng Chen • Mondstadt",
    durationSec: 109,
    tags: ["genshin", "genshin impact", "mondstadt", "piano", "relaxing"],
  },
  {
    id: "gi_windborne_hymn",
    archiveItem: "genshin-impact-ost-flac-city-of-winds-and-idylls",
    file: "City of Winds and Idylls/City of Winds and Idylls/09 - Windborne Hymn.mp3",
    title: "Windborne Hymn",
    artist: "Yu-Peng Chen • Mondstadt",
    durationSec: 108,
    tags: ["genshin", "genshin impact", "mondstadt", "harp", "ambient"],
  },
  {
    id: "gi_tender_strength",
    archiveItem: "genshin-impact-ost-flac-city-of-winds-and-idylls",
    file: "City of Winds and Idylls/City of Winds and Idylls/24 - Tender Strength.mp3",
    title: "Tender Strength",
    artist: "Yu-Peng Chen • Mondstadt",
    durationSec: 83,
    tags: ["genshin", "genshin impact", "mondstadt", "piano", "gentle"],
  },
  {
    id: "gi_snow_buried",
    archiveItem: "06-ad-oblivione",
    file: "01 Snow-Buried Tales.mp3",
    title: "Snow-Buried Tales",
    artist: "Yu-Peng Chen • Dragonspine",
    durationSec: 92,
    tags: ["genshin", "genshin impact", "dragonspine", "piano", "calm"],
  },
  {
    id: "gi_fragile_fantasy",
    archiveItem: "06-ad-oblivione",
    file: "02 Fragile Fantasy.mp3",
    title: "Fragile Fantasy",
    artist: "Yu-Peng Chen • Dragonspine",
    durationSec: 121,
    tags: ["genshin", "genshin impact", "dragonspine", "piano", "strings"],
  },
  {
    id: "gi_fall_of_maples",
    archiveItem: "1-01-inazuma",
    file: "1-02 Fall of Maples.mp3",
    title: "Fall of Maples",
    artist: "Yu-Peng Chen • Inazuma",
    durationSec: 117,
    tags: ["genshin", "genshin impact", "inazuma", "kazuha", "shamisen"],
  },
  {
    id: "gi_streets_elegance",
    archiveItem: "1-01-inazuma",
    file: "1-04 Streets of Elegance.mp3",
    title: "Streets of Elegance",
    artist: "Yu-Peng Chen • Inazuma",
    durationSec: 117,
    tags: ["genshin", "genshin impact", "inazuma", "koto", "relaxing"],
  },
  {
    id: "gi_strange_sakura",
    archiveItem: "1-01-inazuma",
    file: "1-07 In the Strange Realm of Sakura.mp3",
    title: "In the Strange Realm of Sakura",
    artist: "Yu-Peng Chen • Inazuma",
    durationSec: 89,
    tags: ["genshin", "genshin impact", "inazuma", "sakura", "ambient"],
  },
  {
    id: "gi_lucid_dreams",
    archiveItem: "1-01-sumeru",
    file: "1-09 Those Lucid Dreams.mp3",
    title: "Those Lucid Dreams",
    artist: "HOYO-MiX • Sumeru",
    durationSec: 129,
    tags: ["genshin", "genshin impact", "sumeru", "ambient", "study"],
  },
  {
    id: "gi_melody_utsava",
    archiveItem: "1-21-foregone-depiction_202601",
    file: "1-29 Melody of Utsava.mp3",
    title: "Melody of Utsava",
    artist: "Yu-Peng Chen • Sumeru",
    durationSec: 85,
    tags: ["genshin", "genshin impact", "sumeru", "aranara", "acoustic"],
  },
  {
    id: "gi_dance_sabzeruz",
    archiveItem: "1-21-foregone-depiction_202601",
    file: "1-31 Dance of Sabzeruz.mp3",
    title: "Dance of Sabzeruz",
    artist: "Yu-Peng Chen • Sumeru",
    durationSec: 116,
    tags: ["genshin", "genshin impact", "sumeru", "nilou", "orchestral"],
  },
  {
    id: "gi_souvenir_crepuscule",
    archiveItem: "1-01-fontaine",
    file: "1-02 Le Souvenir Avec le Crepuscule.mp3",
    title: "Le Souvenir Avec le Crepuscule",
    artist: "Yuan Dimeng • Fontaine",
    durationSec: 91,
    tags: ["genshin", "genshin impact", "fontaine", "accordion", "waltz"],
  },
  {
    id: "gi_leisurely_fontaine",
    archiveItem: "1-01-fontaine",
    file: "1-05 Leisurely Days in Fontaine.mp3",
    title: "Leisurely Days in Fontaine",
    artist: "Ding Qian • Fontaine",
    durationSec: 101,
    tags: ["genshin", "genshin impact", "fontaine", "piano", "clarinet"],
  },
];

const GENSHIN_INSTRUMENTAL_TRACKS: SongTrack[] =
  GENSHIN_ARCHIVE_SPECS.map(buildGenshinArchiveTrack);

function isGenshinQuery(query: string): boolean {
  const q = query.trim().toLowerCase();
  return q.length > 0 && GENSHIN_KEYWORDS.some((kw) => q.includes(kw));
}

const BROAD_GENSHIN_TOKENS = new Set([
  "genshin",
  "hoyo",
  "hoyo-mix",
  "hoyomix",
  "yu-peng",
  "yupeng",
  "chen",
  "teyvat",
]);

function filterGenshinArchiveTracks(query: string): SongTrack[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return GENSHIN_ARCHIVE_SPECS.filter((s) => s.featured).map(buildGenshinArchiveTrack);
  }

  const tokens = trimmed
    .split(/\s+/)
    .filter(
      (t) =>
        t.length >= 2 &&
        !["ost", "song", "music", "lagu", "track", "instrumental", "impact"].includes(t)
    );

  if (tokens.length === 0) return [];

  // Query merek umum ("genshin", "hoyo-mix", "yu-peng chen", "teyvat") tampilkan seluruh OST Genshin terkurasi
  if (tokens.every((t) => BROAD_GENSHIN_TOKENS.has(t))) {
    return GENSHIN_INSTRUMENTAL_TRACKS;
  }

  return GENSHIN_INSTRUMENTAL_TRACKS.filter((track) => {
    const blob = `${track.title} ${track.artist} ${track.genre} ${track.tags.join(" ")}`.toLowerCase();
    return tokens.every((t) => blob.includes(t));
  });
}

interface AudiusRawTrack {
  id?: string;
  title?: string;
  duration?: number;
  genre?: string;
  mood?: string;
  tags?: string;
  description?: string;
  is_streamable?: boolean;
  is_delete?: boolean;
  artwork?: { "150x150"?: string; "480x480"?: string };
  user?: { name?: string };
}

function normalizeTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function hasWord(haystack: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(haystack);
}

export function matchesStrictMode(
  track: AudiusRawTrack,
  mode: MusicMode,
  hasExplicitQuery = false,
  explicitQuery = ""
): boolean {
  if (!track.id || !track.title) return false;
  if (track.is_streamable !== true || track.is_delete === true) return false;

  const dur = Number(track.duration ?? 0);
  if (dur < 60 || dur > 3600) return false;

  const title = track.title.toLowerCase();
  const artist = (track.user?.name ?? "").toLowerCase();
  const tags = normalizeTags(track.tags);
  const genre = (track.genre ?? "").toLowerCase();
  const desc = (track.description ?? "").toLowerCase();
  const titleTagsBlob = `${title} ${tags.join(" ")}`;
  const coreBlob = `${titleTagsBlob} ${genre}`;
  const searchBlob = `${title} ${artist} ${tags.join(" ")} ${genre}`;

  if (JUNK_OR_NSFW.some((bad) => hasWord(coreBlob, bad))) return false;

  // Pastikan hasil pencarian eksplisit benar-benar relevan dengan judul/artis/tag lagu
  if (hasExplicitQuery && explicitQuery.trim().length > 0) {
    const queryWords = explicitQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2 && w !== "instrumental" && w !== "lyrics" && w !== "vocal");
    if (queryWords.length > 0 && !queryWords.some((w) => searchBlob.includes(w))) {
      return false;
    }
  }

  if (mode === "instrumental") {
    // Cek kata terlarang di title + tags saja agar genre "Hip-Hop/Rap" untuk lofi beats tetap bisa lolos
    if (INSTRUMENTAL_FORBIDDEN.some((kw) => hasWord(titleTagsBlob, kw))) return false;

    // Cek description hanya jika benar-benar mencantumkan lirik lagu (abaikan "no lyrics" / "without vocals")
    const cleanedDesc = desc
      .replace(/\b(no|without|non)\s+(vocal|vocals|lyric|lyrics)\b/g, "");
    if (/\b(lyrics:|\[verse|\[chorus|sung by)\b/i.test(cleanedDesc)) return false;

    const hasExplicitInstWord = [
      "instrumental",
      "piano",
      "guitar solo",
      "lofi",
      "lo-fi",
      "ambient",
      "beat",
      "beats",
      "no vocal",
      "no vocals",
      "violin",
      "cello",
      "orchestra",
      "orchestral",
      "music box",
    ].some((kw) => tags.includes(kw) || hasWord(title, kw));

    // Jika judul menyebut anime/opening/ending/disco, wajib ada penanda aransemen instrumental
    if (
      (hasWord(title, "opening") ||
        hasWord(title, "ending") ||
        hasWord(title, "anime") ||
        hasWord(title, "disco")) &&
      !hasExplicitInstWord
    ) {
      return false;
    }

    if ((VOCAL_HEAVY_GENRES.has(genre) || genre === "hip-hop/rap") && !hasExplicitInstWord) {
      return false;
    }

    return (
      INSTRUMENTAL_GENRES.has(genre) ||
      INSTRUMENTAL_POSITIVE.some((kw) => tags.includes(kw) || hasWord(title, kw))
    );
  }

  // Mode: lyrical
  if (LYRICAL_FORBIDDEN.some((kw) => hasWord(coreBlob, kw))) return false;

  const hasExplicitVocalWord = [
    "vocal",
    "vocals",
    "lyric",
    "lyrics",
    "lyrical",
    "singer",
    "songwriter",
  ].some((kw) => tags.includes(kw) || hasWord(title, kw));

  if (
    !hasExplicitVocalWord &&
    ["piano", "violin", "cello", "flute"].some((kw) => tags.includes(kw) || hasWord(title, kw))
  ) {
    return false;
  }

  if (LYRICAL_STRICT_BLOCK_GENRES.has(genre) && !hasExplicitVocalWord) {
    return false;
  }

  if (hasExplicitQuery) {
    return true;
  }

  return (
    LYRICAL_POSITIVE_GENRES.has(genre) ||
    hasExplicitVocalWord ||
    ["pop", "indie", "ballad", "acoustic"].some(
      (kw) => tags.includes(kw) || hasWord(title, kw)
    )
  );
}

function scoreTrackRelevance(
  raw: AudiusRawTrack,
  mode: MusicMode,
  query: string
): number {
  let score = 0;
  const dur = Number(raw.duration ?? 0);
  const title = (raw.title ?? "").toLowerCase();
  const artist = (raw.user?.name ?? "").toLowerCase();
  const tags = normalizeTags(raw.tags);
  const genre = (raw.genre ?? "").toLowerCase();
  const q = query.trim().toLowerCase();

  // Utamakan durasi lagu standar (2 - 6 menit)
  if (dur >= 120 && dur <= 360) score += 30;
  else if (dur >= 90 && dur <= 480) score += 15;
  else if (dur > 900) score -= 20;

  if (q) {
    if (title.includes(q)) score += 40;
    if (artist.includes(q)) score += 35;
    if (tags.some((t) => t.includes(q))) score += 20;
  }

  if (mode === "instrumental") {
    if (hasWord(title, "instrumental") || tags.includes("instrumental")) score += 25;
    if (hasWord(title, "piano") || tags.includes("piano")) score += 18;
    if (hasWord(title, "lofi") || tags.includes("lofi")) score += 15;
    if (hasWord(title, "study") || tags.includes("study")) score += 12;
  } else {
    if (["vocal", "vocals", "lyrics", "singer", "songwriter"].some((k) => tags.includes(k))) {
      score += 22;
    }
    if (["pop", "alternative", "folk", "r&b/soul"].includes(genre)) score += 18;
    if (["club", "edit", "trap", "mix"].some((k) => hasWord(title, k))) score -= 18;
  }

  return score;
}

function toSongTrack(raw: AudiusRawTrack, mode: MusicMode): SongTrack {
  const id = raw.id!;
  return {
    id,
    title: raw.title || "Untitled",
    artist: raw.user?.name || "Independent Artist",
    durationSec: Number(raw.duration || 180),
    genre: raw.genre || (mode === "instrumental" ? "Instrumental" : "Pop / Vocal"),
    tags: normalizeTags(raw.tags).slice(0, 4),
    streamUrl: `${AUDIUS_BASE}/tracks/${encodeURIComponent(id)}/stream?app_name=${APP_NAME}`,
    artworkUrl: raw.artwork?.["150x150"],
    mode,
    source: "audius",
  };
}

async function fetchAudiusByIds(ids: string[], mode: MusicMode): Promise<SongTrack[]> {
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const res = await fetch(
        `${AUDIUS_BASE}/tracks/${encodeURIComponent(id)}?app_name=${APP_NAME}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: AudiusRawTrack };
      if (!json.data || !matchesStrictMode(json.data, mode, false)) return null;
      return toSongTrack(json.data, mode);
    })
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<SongTrack | null> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value!);
}

async function searchAudiusRaw(q: string, limit = 50): Promise<AudiusRawTrack[]> {
  try {
    const res = await fetch(
      `${AUDIUS_BASE}/tracks/search?query=${encodeURIComponent(q)}&limit=${limit}&app_name=${APP_NAME}`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: AudiusRawTrack[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function searchAudiusLive(query: string, mode: MusicMode): Promise<SongTrack[]> {
  const trimmed = query.trim();
  const hasExplicit = trimmed.length > 0;
  const genshinQuery = mode === "instrumental" && isGenshinQuery(trimmed);

  const queries = hasExplicit
    ? genshinQuery
      ? [`${trimmed} piano`, `${trimmed} lofi`, trimmed]
      : mode === "instrumental"
      ? [trimmed, `${trimmed} instrumental`]
      : [trimmed]
    : mode === "instrumental"
    ? ["piano instrumental", "lofi study beats", "ambient classical", "acoustic guitar instrumental"]
    : ["indie pop", "pop vocals", "tulus", "nadin amizah", "acoustic singer"];

  const batches = await Promise.all(
    queries.map((q) => searchAudiusRaw(q, hasExplicit ? 50 : 25))
  );

  const rawMatched: AudiusRawTrack[] = [];
  const seen = new Set<string>();
  for (const batch of batches) {
    for (const raw of batch) {
      if (!raw.id || seen.has(raw.id)) continue;
      if (genshinQuery) {
        const artistLower = (raw.user?.name ?? "").trim().toLowerCase();
        const titleLower = (raw.title ?? "").toLowerCase();
        if (GENSHIN_NOISE_ARTISTS.has(artistLower) || titleLower.includes("blazing heart")) {
          continue;
        }
      }
      if (matchesStrictMode(raw, mode, hasExplicit, trimmed)) {
        seen.add(raw.id);
        rawMatched.push(raw);
      }
    }
  }

  rawMatched.sort(
    (a, b) => scoreTrackRelevance(b, mode, trimmed) - scoreTrackRelevance(a, mode, trimmed)
  );

  return rawMatched.map((raw) => toSongTrack(raw, mode));
}

async function searchJamendoOptional(query: string, mode: MusicMode): Promise<SongTrack[]> {
  const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
  if (!clientId) return [];

  const vocalParam = mode === "instrumental" ? "instrumental" : "vocal";
  const url =
    `https://api.jamendo.com/v3.0/tracks/?client_id=${encodeURIComponent(clientId)}` +
    `&format=json&vocalinstrumental=${vocalParam}&audioformat=mp32&limit=25&order=popularity_total` +
    (query.trim() ? `&search=${encodeURIComponent(query.trim())}` : "");

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      results?: Array<{
        id: string;
        name: string;
        artist_name: string;
        duration: number;
        audio: string;
        album_image?: string;
      }>;
    };
    return (json.results ?? [])
      .filter((t) => t.duration >= 60 && Boolean(t.audio))
      .map((t) => ({
        id: `jam_${t.id}`,
        title: t.name,
        artist: t.artist_name,
        durationSec: t.duration,
        genre: mode === "instrumental" ? "Instrumental" : "Vocal / Lyrics",
        tags: [vocalParam],
        streamUrl: t.audio,
        artworkUrl: t.album_image,
        mode,
        source: "jamendo" as const,
      }));
  } catch {
    return [];
  }
}

export async function getFilteredSongs(
  mode: MusicMode,
  query = ""
): Promise<{ tracks: SongTrack[]; fallbackUsed: boolean }> {
  const trimmed = query.trim();

  // Mode BERLIRIK: utamakan 100% katalog lagu terkenal terverifikasi agar tidak tercampur lagu asing/antah-berantah.
  // Pencarian live ke Audius hanya dipakai saat peserta mengetik artis/judul khusus yang tidak cukup ditemukan di katalog utama.
  if (mode === "lyrical") {
    const curatedMatches = filterTrendingLyricalTracks(trimmed);

    if (!trimmed) {
      return { tracks: curatedMatches, fallbackUsed: false };
    }

    if (curatedMatches.length >= 2) {
      return { tracks: curatedMatches, fallbackUsed: false };
    }

    const [jamendo, audiusLive] = await Promise.all([
      searchJamendoOptional(trimmed, "lyrical"),
      searchAudiusLive(trimmed, "lyrical"),
    ]);

    const mergedLyrical = [...curatedMatches, ...jamendo, ...audiusLive];
    const seenIds = new Set<string>();
    const seenTitleArtist = new Set<string>();
    const uniqueLyrical: SongTrack[] = [];

    for (const track of mergedLyrical) {
      const normKey = `${track.title.toLowerCase().trim()}::${track.artist.toLowerCase().trim()}`;
      if (seenIds.has(track.id) || seenTitleArtist.has(normKey)) continue;
      seenIds.add(track.id);
      seenTitleArtist.add(normKey);
      uniqueLyrical.push(track);
    }

    if (uniqueLyrical.length === 0) {
      return { tracks: TRENDING_LYRICAL_TRACKS.slice(0, 15), fallbackUsed: true };
    }

    return { tracks: uniqueLyrical.slice(0, 40), fallbackUsed: false };
  }

  const genshinQuery = isGenshinQuery(trimmed);
  const genshinArchive = filterGenshinArchiveTracks(trimmed);

  const [jamendo, audiusLive, audiusCurated, genshinAudiusRaw] = await Promise.all([
    searchJamendoOptional(trimmed, mode),
    searchAudiusLive(trimmed, mode),
    trimmed ? Promise.resolve([]) : fetchAudiusByIds(VERIFIED_AUDIUS_SEEDS[mode], mode),
    genshinQuery
      ? fetchAudiusByIds(GENSHIN_AUDIUS_SEEDS, "instrumental")
      : Promise.resolve([]),
  ]);

  const querySubTokens = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !BROAD_GENSHIN_TOKENS.has(t) && t !== "impact" && t !== "ost");

  const genshinAudius =
    querySubTokens.length > 0
      ? genshinAudiusRaw.filter((track) => {
          const blob = `${track.title} ${track.artist} ${track.tags.join(" ")}`.toLowerCase();
          return querySubTokens.every((t) => blob.includes(t));
        })
      : genshinAudiusRaw;

  const merged = genshinQuery
    ? [...genshinArchive, ...genshinAudius, ...jamendo, ...audiusLive]
    : trimmed
    ? [...jamendo, ...audiusLive, ...genshinArchive]
    : [...jamendo, ...genshinArchive, ...audiusCurated, ...audiusLive];

  const seenIds = new Set<string>();
  const seenTitleArtist = new Set<string>();
  const unique: SongTrack[] = [];

  for (const track of merged) {
    const normKey = `${track.title.toLowerCase().trim()}::${track.artist.toLowerCase().trim()}`;
    if (seenIds.has(track.id) || seenTitleArtist.has(normKey)) continue;
    seenIds.add(track.id);
    seenTitleArtist.add(normKey);
    unique.push(track);
  }

  if (unique.length === 0 && trimmed) {
    const fallbackTracks = await fetchAudiusByIds(VERIFIED_AUDIUS_SEEDS[mode], mode);
    return { tracks: fallbackTracks, fallbackUsed: true };
  }

  return { tracks: unique.slice(0, 40), fallbackUsed: false };
}
