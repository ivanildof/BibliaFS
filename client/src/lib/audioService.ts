// Bible Audio Service - Online/Offline Smart Playback with Backend API + IndexedDB fallback

// Define inline type to avoid circular dependency
interface OfflineContextType {
  getOfflineAudio?: (bookCode: string, chapter: number, version: string) => Promise<ArrayBuffer | null>;
  saveOfflineAudio?: (bookCode: string, chapter: number, version: string, audioData: ArrayBuffer) => Promise<void>;
}

// Use backend API for audio (generates via OpenAI TTS and caches)
const AUDIO_API_BASE = "/api/bible/audio";

// Comprehensive book mapping: Portuguese + English names → abbreviations
const BOOK_CODES: { [key: string]: string } = {
  // Portuguese
  "Gênesis": "gn", "Genesis": "gn", "Êxodo": "ex", "Exodus": "ex",
  "Levítico": "lv", "Leviticus": "lv", "Números": "nm", "Numbers": "nm",
  "Deuteronômio": "dt", "Deuteronomy": "dt", "Josué": "js", "Joshua": "js",
  "Juízes": "jz", "Judges": "jz", "Rute": "rt", "Ruth": "rt",
  "1 Samuel": "1sm", "1Samuel": "1sm", "2 Samuel": "2sm", "2Samuel": "2sm",
  "1 Reis": "1rs", "1Kings": "1rs", "2 Reis": "2rs", "2Kings": "2rs",
  "1 Crônicas": "1cr", "1Chronicles": "1cr", "2 Crônicas": "2cr", "2Chronicles": "2cr",
  "Esdras": "ed", "Ezra": "ed", "Neemias": "ne", "Nehemiah": "ne",
  "Ester": "et", "Esther": "et", "Jó": "job", "Job": "job",
  "Salmos": "sl", "Psalms": "sl", "Provérbios": "pv", "Proverbs": "pv",
  "Eclesiastes": "ec", "Ecclesiastes": "ec", "Cantares": "ct", "SongofSolomon": "ct",
  "Isaías": "is", "Isaiah": "is", "Jeremias": "jr", "Jeremiah": "jr",
  "Lamentações": "lm", "Lamentations": "lm", "Ezequiel": "ez", "Ezekiel": "ez",
  "Daniel": "dn", "Oseias": "os", "Hosea": "os", "Joel": "jl",
  "Amós": "am", "Amos": "am", "Obadias": "ob", "Obadiah": "ob",
  "Jonas": "jn", "Jonah": "jn", "Miqueias": "mq", "Micah": "mq",
  "Naum": "na", "Nahum": "na", "Habacuque": "hc", "Habakkuk": "hc",
  "Sofonias": "sf", "Zephaniah": "sf", "Ageu": "ag", "Haggai": "ag",
  "Zacarias": "zc", "Zechariah": "zc", "Malaquias": "ml", "Malachi": "ml",
  "Mateus": "mt", "Matthew": "mt", "Marcos": "mc", "Mark": "mc",
  "Lucas": "lc", "Luke": "lc", "João": "jo", "John": "jo", "Atos": "at", "Acts": "at",
  "Romanos": "rm", "Romans": "rm", "1 Coríntios": "1co", "1Corinthians": "1co",
  "2 Coríntios": "2co", "2Corinthians": "2co", "Gálatas": "gl", "Galatians": "gl",
  "Efésios": "ef", "Ephesians": "ef", "Filipenses": "fp", "Philippians": "fp",
  "Colossenses": "cl", "Colossians": "cl", "1 Tessalonicenses": "1ts",
  "1Thessalonians": "1ts", "2 Tessalonicenses": "2ts", "2Thessalonians": "2ts",
  "1 Timóteo": "1tm", "1Timothy": "1tm", "2 Timóteo": "2tm", "2Timothy": "2tm",
  "Tito": "tt", "Titus": "tt", "Filemom": "fm", "Philemon": "fm",
  "Hebreus": "hb", "Hebrews": "hb", "Tiago": "tg", "James": "tg",
  "1 Pedro": "1pe", "1Peter": "1pe", "2 Pedro": "2pe", "2Peter": "2pe",
  "1 João": "1jo", "1John": "1jo", "2 João": "2jo", "2John": "2jo",
  "3 João": "3jo", "3John": "3jo", "Judas": "jd", "Jude": "jd",
  "Apocalipse": "ap", "Revelation": "ap",
};

export interface AudioPlayOptions {
  book: string;
  chapter: number;
  version: string;
  offline: OfflineContextType | null;
  isOnline: boolean;
}

export interface AudioProgress {
  bookCode: string;
  chapter: number;
  version: string;
  playbackPosition: number;
  totalDuration: number;
  lastPlayedAt: Date;
}

function getBookCode(bookName: string): string {
  // Try exact match first
  if (BOOK_CODES[bookName]) return BOOK_CODES[bookName];
  
  // Try case-insensitive match
  for (const [key, value] of Object.entries(BOOK_CODES)) {
    if (key.toLowerCase() === bookName.toLowerCase()) {
      return value;
    }
  }
  
  // Fallback: use first 2 letters lowercase
  return bookName.toLowerCase().substring(0, 2);
}

// Get auth token from localStorage (Supabase stores it there)
function getAuthToken(): string | null {
  try {
    const supabaseKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (supabaseKey) {
      const data = JSON.parse(localStorage.getItem(supabaseKey) || '{}');
      return data?.access_token || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAudioUrl(
  book: string,
  chapter: number,
  version: string = "nvi",
  language: string = "pt"
): Promise<string> {
  const bookCode = getBookCode(book);
  // Use backend API that generates and caches audio
  return `${AUDIO_API_BASE}/${language.toLowerCase()}/${version.toLowerCase()}/${bookCode}/${chapter}`;
}

export async function playBibleAudio(
  options: AudioPlayOptions,
  audioElement: HTMLAudioElement,
  language: string = "pt"
): Promise<void> {
  const { book, chapter, version, offline, isOnline } = options;
  const bookCode = getBookCode(book);

  try {
    // First: check offline cache (IndexedDB)
    if (offline?.getOfflineAudio) {
      const cachedAudio = await offline.getOfflineAudio(bookCode, chapter, version);
      if (cachedAudio) {
        console.log(`[Audio] Playing from offline cache: ${book} ${chapter}`);
        const blob = new Blob([cachedAudio], { type: "audio/mpeg" });
        const blobUrl = URL.createObjectURL(blob);
        audioElement.src = blobUrl;
        await audioElement.play();
        return;
      }
    }

    // Online: fetch from backend API (which generates via OpenAI TTS and caches)
    if (isOnline) {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Faça login para ouvir o áudio.");
      }

      const url = await getAudioUrl(book, chapter, version, language);
      console.log(`[Audio] Fetching from backend: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao carregar áudio: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioArrayBuffer = await audioBlob.arrayBuffer();
      
      // Save to offline cache for future use
      if (offline?.saveOfflineAudio) {
        try {
          await offline.saveOfflineAudio(bookCode, chapter, version, audioArrayBuffer);
          console.log(`[Audio] Saved to offline cache: ${book} ${chapter}`);
        } catch (cacheErr) {
          console.warn("[Audio] Failed to save to offline cache:", cacheErr);
        }
      }

      const blobUrl = URL.createObjectURL(audioBlob);
      audioElement.src = blobUrl;
      await audioElement.play();
      return;
    }

    throw new Error("Áudio não disponível. Conecte à internet ou baixe para uso offline.");
  } catch (error) {
    console.error("Erro ao reproduzir áudio:", error);
    throw error;
  }
}

export async function downloadChapterAudio(
  book: string,
  chapter: number,
  version: string = "nvi",
  language: string = "pt",
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Faça login para baixar o áudio.");
  }

  const url = await getAudioUrl(book, chapter, version, language);
  console.log(`[Audio] Downloading: ${url}`);

  // Notify start
  onProgress?.(5);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Falha ao baixar áudio: ${response.status}`);
  }

  // Progress simulation since we can't stream with auth headers easily
  onProgress?.(50);

  const blob = await response.blob();
  
  onProgress?.(100);
  console.log(`[Audio] Downloaded ${book} ${chapter}: ${blob.size} bytes`);

  return blob;
}

export async function downloadBookAudio(
  book: string,
  chapters: number,
  version: string = "nvi",
  language: string = "pt",
  onProgress?: (progress: number) => void
): Promise<Map<number, Blob>> {
  const audioMap = new Map<number, Blob>();
  const totalChapters = chapters;

  for (let ch = 1; ch <= totalChapters; ch++) {
    try {
      const audio = await downloadChapterAudio(book, ch, version, language);
      audioMap.set(ch, audio);
      onProgress?.(Math.round((ch / totalChapters) * 100));
    } catch (error) {
      console.warn(`Falha ao baixar capítulo ${ch}:`, error);
      continue;
    }
  }

  return audioMap;
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
