// Bible Audio Service - Online/Offline Smart Playback with Supabase Storage

// Define inline type to avoid circular dependency
interface OfflineContextType {
  getOfflineAudio?: (bookCode: string, chapter: number, version: string) => Promise<ArrayBuffer | null>;
}

// Supabase Storage URL for Bible audio files
// Format: {SUPABASE_URL}/storage/v1/object/public/bible-audio/{LANG}/{VERSION}/{BOOK}/{CHAPTER}.mp3
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const AUDIO_STORAGE_BASE = SUPABASE_URL 
  ? `${SUPABASE_URL}/storage/v1/object/public/bible-audio`
  : "";

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
  version: string = "ARC",
  language: string = "PT"
): Promise<string> {
  const bookCode = getBookCode(book);
  if (!AUDIO_STORAGE_BASE) {
    console.error("[Audio] Supabase URL not configured");
    throw new Error("Audio storage not configured");
  }
  // Format: {SUPABASE}/storage/v1/object/public/bible-audio/{LANG}/{VERSION}/{BOOK}/{CHAPTER}.mp3
  const url = `${AUDIO_STORAGE_BASE}/${language.toUpperCase()}/${version.toUpperCase()}/${bookCode}/${chapter}.mp3`;
  console.log(`[Audio] Generated URL: ${url}`);
  return url;
}

export async function playBibleAudio(
  options: AudioPlayOptions,
  audioElement: HTMLAudioElement,
  language: string = "PT"
): Promise<void> {
  const { book, chapter, version, offline, isOnline } = options;
  const bookCode = getBookCode(book);

  try {
    // Offline: check IndexedDB first
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

    // Online: Use backend API (has server-side cache + OpenAI TTS fallback)
    if (isOnline) {
      const apiUrl = `/api/bible/audio/${language.toLowerCase()}/${version.toLowerCase()}/${bookCode}/${chapter}`;
      console.log(`[Audio] Streaming via API: ${apiUrl}`);
      
      const token = getAuthToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
        headers,
        signal: AbortSignal.timeout(120000),
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao carregar áudio: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      audioElement.src = blobUrl;
      await audioElement.play();
      return;
    }

    throw new Error("Áudio não disponível. Conecte à internet para ouvir.");
  } catch (error) {
    console.error("Erro ao reproduzir áudio:", error);
    throw error;
  }
}

export async function downloadChapterAudio(
  book: string,
  chapter: number,
  version: string = "ARC",
  language: string = "PT",
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const bookCode = getBookCode(book);
  
  // Use OpenAI TTS API endpoint (Supabase Storage is empty)
  const apiUrl = `/api/bible/audio/${language.toLowerCase()}/${version.toLowerCase()}/${bookCode}/${chapter}`;
  console.log(`[Audio] Downloading via TTS API: ${apiUrl}`);
  
  const token = getAuthToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(apiUrl, {
    method: "GET",
    credentials: "include",
    headers,
    signal: AbortSignal.timeout(120000),
  });
  
  if (!response.ok) {
    throw new Error(`Falha ao baixar áudio: ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length")) || 0;
  const reader = response.body?.getReader();

  if (!reader) {
    const blob = await response.blob();
    onProgress?.(100);
    return blob;
  }

  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    if (onProgress && contentLength) {
      onProgress(Math.round((receivedLength / contentLength) * 100));
    }
  }

  return new Blob(chunks, { type: "audio/mpeg" });
}

export async function downloadBookAudio(
  book: string,
  chapters: number,
  version: string = "ARC",
  language: string = "PT",
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
