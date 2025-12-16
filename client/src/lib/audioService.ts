// Bible Audio Service - Online/Offline Smart Playback with CDN/IndexedDB fallback
import { supabase } from "./supabase";

const AUDIO_CDN_BASE = "https://cdn.bibliafs.com.br/bible-audio";
const BOOK_CODES: { [key: string]: string } = {
  "Genesis": "GEN", "Êxodo": "EXO", "Levítico": "LEV", "Números": "NUM",
  "Deuteronômio": "DEU", "Josué": "JOS", "Juízes": "JZG", "Rute": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Reis": "1RE", "2 Reis": "2RE",
  "1 Crônicas": "1CR", "2 Crônicas": "2CR", "Esdras": "EZR", "Neemias": "NEE",
  "Ester": "EST", "Jó": "JOB", "Salmos": "PSA", "Provérbios": "PRO",
  "Eclesiastes": "ECC", "Cantares": "CAN", "Isaías": "ISA", "Jeremias": "JER",
  "Lamentações": "LAM", "Ezequiel": "EZE", "Daniel": "DAN", "Oseias": "OSE",
  "Joel": "JOL", "Amós": "AMO", "Obadias": "OBA", "Jonas": "JON",
  "Miqueias": "MIQ", "Naum": "NAM", "Habacuque": "HAB", "Sofonias": "SOF",
  "Ageu": "HAG", "Zacarias": "ZAC", "Malaquias": "MAL", "Mateus": "MAT",
  "Marcos": "MAR", "Lucas": "LUC", "João": "JOA", "Atos": "ACT",
  "Romanos": "ROM", "1 Coríntios": "1CO", "2 Coríntios": "2CO", "Gálatas": "GAL",
  "Efésios": "EFE", "Filipenses": "FIL", "Colossenses": "COL", "1 Tessalonicenses": "1TE",
  "2 Tessalonicenses": "2TE", "1 Timóteo": "1TI", "2 Timóteo": "2TI", "Tito": "TIT",
  "Filemom": "FIL", "Hebreus": "HEB", "Tiago": "TIA", "1 Pedro": "1PE",
  "2 Pedro": "2PE", "1 João": "1JO", "2 João": "2JO", "3 João": "3JO",
  "Judas": "JUD", "Apocalipse": "APO",
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
  return BOOK_CODES[bookName] || bookName.toUpperCase().substring(0, 3);
}

export async function getAudioUrl(
  book: string,
  chapter: number,
  version: string = "ARA",
  language: string = "pt"
): Promise<string> {
  const bookCode = getBookCode(book);
  // Format: /bible-audio/{LANGUAGE}/{VERSION}/{BOOK_CODE}/{CHAPTER}.mp3
  return `${AUDIO_CDN_BASE}/${language.toUpperCase()}/${version.toUpperCase()}/${bookCode}/${chapter}.mp3`;
}

export async function playBibleAudio(
  options: AudioPlayOptions,
  audioElement: HTMLAudioElement,
  language: string = "pt"
): Promise<void> {
  const { book, chapter, version, offline, isOnline } = options;
  const bookCode = getBookCode(book);

  try {
    // Online: try CDN first
    if (isOnline) {
      const url = await getAudioUrl(book, chapter, version, language);
      audioElement.src = url;
      await audioElement.play();
      return;
    }

    // Offline: check IndexedDB
    if (offline) {
      const audioData = await offline.getOfflineAudio?.(bookCode, chapter, version);
      if (audioData) {
        const blob = new Blob([audioData], { type: "audio/mpeg" });
        const blobUrl = URL.createObjectURL(blob);
        audioElement.src = blobUrl;
        await audioElement.play();
        return;
      }
    }

    throw new Error("Áudio não disponível. Baixe para ouvir offline.");
  } catch (error) {
    console.error("Erro ao reproduzir áudio:", error);
    throw error;
  }
}

// Upload áudio para Supabase Storage
async function uploadAudioToStorage(
  book: string,
  chapter: number,
  version: string,
  language: string,
  audioBlob: Blob
): Promise<string | null> {
  try {
    const fileName = `${language}/${version}/${book}/${chapter}.mp3`;
    const { data, error } = await supabase.storage
      .from("bible-audio")
      .upload(fileName, audioBlob, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (error) {
      console.warn("[AudioService] Upload error:", error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("bible-audio")
      .getPublicUrl(fileName);

    console.log("[AudioService] Áudio salvo em Supabase Storage:", publicData.publicUrl);
    return publicData.publicUrl;
  } catch (error) {
    console.warn("[AudioService] Erro ao fazer upload:", error);
    return null;
  }
}

export async function downloadChapterAudio(
  book: string,
  chapter: number,
  version: string = "ARA",
  language: string = "pt",
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const url = await getAudioUrl(book, chapter, version, language);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar áudio: ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length")) || 0;
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Não foi possível ler o stream de áudio");
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

  const audioBlob = new Blob(chunks, { type: "audio/mpeg" });

  // Upload para Supabase Storage em background (não espera terminar)
  uploadAudioToStorage(book, chapter, version, language, audioBlob).catch(
    (err) => console.warn("[AudioService] Background upload error:", err)
  );

  return audioBlob;
}

export async function downloadBookAudio(
  book: string,
  chapters: number,
  version: string = "ARA",
  onProgress?: (progress: number) => void
): Promise<Map<number, Blob>> {
  const audioMap = new Map<number, Blob>();
  const totalChapters = chapters;

  for (let ch = 1; ch <= totalChapters; ch++) {
    try {
      const audio = await downloadChapterAudio(book, ch, version);
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
