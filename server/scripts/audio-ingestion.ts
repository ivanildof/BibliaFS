/**
 * Bible Audio Ingestion Script
 * Downloads audio from public domain sources and uploads to Supabase Storage
 * 
 * Sources:
 * - PT: Almeida Revista e Corrigida (public domain)
 * - EN: World English Bible (public domain)
 * - ES: Reina Valera 1960 (public domain in most uses)
 * 
 * Usage: npx tsx server/scripts/audio-ingestion.ts [language] [startBook] [endBook]
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = "bible-audio";

// Bible books with chapter counts
const BIBLE_BOOKS = [
  { abbrev: "gn", name: "Genesis", chapters: 50 },
  { abbrev: "ex", name: "Exodus", chapters: 40 },
  { abbrev: "lv", name: "Leviticus", chapters: 27 },
  { abbrev: "nm", name: "Numbers", chapters: 36 },
  { abbrev: "dt", name: "Deuteronomy", chapters: 34 },
  { abbrev: "js", name: "Joshua", chapters: 24 },
  { abbrev: "jz", name: "Judges", chapters: 21 },
  { abbrev: "rt", name: "Ruth", chapters: 4 },
  { abbrev: "1sm", name: "1Samuel", chapters: 31 },
  { abbrev: "2sm", name: "2Samuel", chapters: 24 },
  { abbrev: "1rs", name: "1Kings", chapters: 22 },
  { abbrev: "2rs", name: "2Kings", chapters: 25 },
  { abbrev: "1cr", name: "1Chronicles", chapters: 29 },
  { abbrev: "2cr", name: "2Chronicles", chapters: 36 },
  { abbrev: "ed", name: "Ezra", chapters: 10 },
  { abbrev: "ne", name: "Nehemiah", chapters: 13 },
  { abbrev: "et", name: "Esther", chapters: 10 },
  { abbrev: "job", name: "Job", chapters: 42 },
  { abbrev: "sl", name: "Psalms", chapters: 150 },
  { abbrev: "pv", name: "Proverbs", chapters: 31 },
  { abbrev: "ec", name: "Ecclesiastes", chapters: 12 },
  { abbrev: "ct", name: "SongofSolomon", chapters: 8 },
  { abbrev: "is", name: "Isaiah", chapters: 66 },
  { abbrev: "jr", name: "Jeremiah", chapters: 52 },
  { abbrev: "lm", name: "Lamentations", chapters: 5 },
  { abbrev: "ez", name: "Ezekiel", chapters: 48 },
  { abbrev: "dn", name: "Daniel", chapters: 12 },
  { abbrev: "os", name: "Hosea", chapters: 14 },
  { abbrev: "jl", name: "Joel", chapters: 3 },
  { abbrev: "am", name: "Amos", chapters: 9 },
  { abbrev: "ob", name: "Obadiah", chapters: 1 },
  { abbrev: "jn", name: "Jonah", chapters: 4 },
  { abbrev: "mq", name: "Micah", chapters: 7 },
  { abbrev: "na", name: "Nahum", chapters: 3 },
  { abbrev: "hc", name: "Habakkuk", chapters: 3 },
  { abbrev: "sf", name: "Zephaniah", chapters: 3 },
  { abbrev: "ag", name: "Haggai", chapters: 2 },
  { abbrev: "zc", name: "Zechariah", chapters: 14 },
  { abbrev: "ml", name: "Malachi", chapters: 4 },
  { abbrev: "mt", name: "Matthew", chapters: 28 },
  { abbrev: "mc", name: "Mark", chapters: 16 },
  { abbrev: "lc", name: "Luke", chapters: 24 },
  { abbrev: "jo", name: "John", chapters: 21 },
  { abbrev: "at", name: "Acts", chapters: 28 },
  { abbrev: "rm", name: "Romans", chapters: 16 },
  { abbrev: "1co", name: "1Corinthians", chapters: 16 },
  { abbrev: "2co", name: "2Corinthians", chapters: 13 },
  { abbrev: "gl", name: "Galatians", chapters: 6 },
  { abbrev: "ef", name: "Ephesians", chapters: 6 },
  { abbrev: "fp", name: "Philippians", chapters: 4 },
  { abbrev: "cl", name: "Colossians", chapters: 4 },
  { abbrev: "1ts", name: "1Thessalonians", chapters: 5 },
  { abbrev: "2ts", name: "2Thessalonians", chapters: 3 },
  { abbrev: "1tm", name: "1Timothy", chapters: 6 },
  { abbrev: "2tm", name: "2Timothy", chapters: 4 },
  { abbrev: "tt", name: "Titus", chapters: 3 },
  { abbrev: "fm", name: "Philemon", chapters: 1 },
  { abbrev: "hb", name: "Hebrews", chapters: 13 },
  { abbrev: "tg", name: "James", chapters: 5 },
  { abbrev: "1pe", name: "1Peter", chapters: 5 },
  { abbrev: "2pe", name: "2Peter", chapters: 3 },
  { abbrev: "1jo", name: "1John", chapters: 5 },
  { abbrev: "2jo", name: "2John", chapters: 1 },
  { abbrev: "3jo", name: "3John", chapters: 1 },
  { abbrev: "jd", name: "Jude", chapters: 1 },
  { abbrev: "ap", name: "Revelation", chapters: 22 },
];

// Audio sources - using free public domain audio
// Source: wordproject.org (public domain audio Bibles)
const AUDIO_SOURCES: Record<string, { baseUrl: string; version: string; bookMapping: Record<string, string> }> = {
  pt: {
    baseUrl: "https://audio.wordproject.org/pt/drama",
    version: "ACF",
    bookMapping: {
      gn: "01", ex: "02", lv: "03", nm: "04", dt: "05",
      js: "06", jz: "07", rt: "08", "1sm": "09", "2sm": "10",
      "1rs": "11", "2rs": "12", "1cr": "13", "2cr": "14",
      ed: "15", ne: "16", et: "17", job: "18", sl: "19",
      pv: "20", ec: "21", ct: "22", is: "23", jr: "24",
      lm: "25", ez: "26", dn: "27", os: "28", jl: "29",
      am: "30", ob: "31", jn: "32", mq: "33", na: "34",
      hc: "35", sf: "36", ag: "37", zc: "38", ml: "39",
      mt: "40", mc: "41", lc: "42", jo: "43", at: "44",
      rm: "45", "1co": "46", "2co": "47", gl: "48", ef: "49",
      fp: "50", cl: "51", "1ts": "52", "2ts": "53", "1tm": "54",
      "2tm": "55", tt: "56", fm: "57", hb: "58", tg: "59",
      "1pe": "60", "2pe": "61", "1jo": "62", "2jo": "63",
      "3jo": "64", jd: "65", ap: "66"
    }
  },
  en: {
    baseUrl: "https://audio.wordproject.org/en/drama",
    version: "KJV",
    bookMapping: {
      gn: "01", ex: "02", lv: "03", nm: "04", dt: "05",
      js: "06", jz: "07", rt: "08", "1sm": "09", "2sm": "10",
      "1rs": "11", "2rs": "12", "1cr": "13", "2cr": "14",
      ed: "15", ne: "16", et: "17", job: "18", sl: "19",
      pv: "20", ec: "21", ct: "22", is: "23", jr: "24",
      lm: "25", ez: "26", dn: "27", os: "28", jl: "29",
      am: "30", ob: "31", jn: "32", mq: "33", na: "34",
      hc: "35", sf: "36", ag: "37", zc: "38", ml: "39",
      mt: "40", mc: "41", lc: "42", jo: "43", at: "44",
      rm: "45", "1co": "46", "2co": "47", gl: "48", ef: "49",
      fp: "50", cl: "51", "1ts": "52", "2ts": "53", "1tm": "54",
      "2tm": "55", tt: "56", fm: "57", hb: "58", tg: "59",
      "1pe": "60", "2pe": "61", "1jo": "62", "2jo": "63",
      "3jo": "64", jd: "65", ap: "66"
    }
  },
  es: {
    baseUrl: "https://audio.wordproject.org/es/drama",
    version: "RV60",
    bookMapping: {
      gn: "01", ex: "02", lv: "03", nm: "04", dt: "05",
      js: "06", jz: "07", rt: "08", "1sm": "09", "2sm": "10",
      "1rs": "11", "2rs": "12", "1cr": "13", "2cr": "14",
      ed: "15", ne: "16", et: "17", job: "18", sl: "19",
      pv: "20", ec: "21", ct: "22", is: "23", jr: "24",
      lm: "25", ez: "26", dn: "27", os: "28", jl: "29",
      am: "30", ob: "31", jn: "32", mq: "33", na: "34",
      hc: "35", sf: "36", ag: "37", zc: "38", ml: "39",
      mt: "40", mc: "41", lc: "42", jo: "43", at: "44",
      rm: "45", "1co": "46", "2co": "47", gl: "48", ef: "49",
      fp: "50", cl: "51", "1ts": "52", "2ts": "53", "1tm": "54",
      "2tm": "55", tt: "56", fm: "57", hb: "58", tg: "59",
      "1pe": "60", "2pe": "61", "1jo": "62", "2jo": "63",
      "3jo": "64", jd: "65", ap: "66"
    }
  }
};

// Tracking file for resume capability
const PROGRESS_FILE = "audio-ingestion-progress.json";

interface ProgressData {
  completed: { [key: string]: boolean };
  failed: { [key: string]: string };
  lastUpdated: string;
}

function loadProgress(): ProgressData {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("Could not load progress file, starting fresh");
  }
  return { completed: {}, failed: {}, lastUpdated: new Date().toISOString() };
}

function saveProgress(progress: ProgressData) {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function ensureBucketExists() {
  console.log(`[Storage] Checking if bucket '${BUCKET_NAME}' exists...`);
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error("[Storage] Error listing buckets:", listError);
    throw listError;
  }
  
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`[Storage] Creating bucket '${BUCKET_NAME}'...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
    
    if (createError) {
      console.error("[Storage] Error creating bucket:", createError);
      throw createError;
    }
    console.log(`[Storage] Bucket '${BUCKET_NAME}' created successfully`);
  } else {
    console.log(`[Storage] Bucket '${BUCKET_NAME}' already exists`);
  }
}

async function downloadAudio(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "BíbliaFS/2.0 (Bible Study App)"
      }
    });
    
    if (!response.ok) {
      console.warn(`[Download] Failed: ${url} - ${response.status}`);
      return null;
    }
    
    return await response.arrayBuffer();
  } catch (error) {
    console.warn(`[Download] Error: ${url} -`, error);
    return null;
  }
}

async function uploadToSupabase(
  lang: string,
  version: string,
  bookAbbrev: string,
  chapter: number,
  audioData: ArrayBuffer
): Promise<boolean> {
  const filePath = `${lang.toUpperCase()}/${version.toUpperCase()}/${bookAbbrev}/${chapter}.mp3`;
  
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, audioData, {
        contentType: "audio/mpeg",
        upsert: true
      });
    
    if (error) {
      console.error(`[Upload] Failed: ${filePath} -`, error.message);
      return false;
    }
    
    console.log(`[Upload] Success: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`[Upload] Error: ${filePath} -`, error);
    return false;
  }
}

function getAudioUrl(lang: string, bookAbbrev: string, chapter: number): string {
  const source = AUDIO_SOURCES[lang];
  if (!source) {
    throw new Error(`No audio source configured for language: ${lang}`);
  }
  
  const bookNum = source.bookMapping[bookAbbrev];
  if (!bookNum) {
    throw new Error(`No book mapping for: ${bookAbbrev}`);
  }
  
  // Format: https://audio.wordproject.org/pt/drama/01/01.mp3
  const chapterStr = chapter.toString().padStart(2, "0");
  return `${source.baseUrl}/${bookNum}/${chapterStr}.mp3`;
}

async function processBook(
  lang: string,
  book: typeof BIBLE_BOOKS[0],
  progress: ProgressData
): Promise<{ success: number; failed: number }> {
  const source = AUDIO_SOURCES[lang];
  if (!source) {
    console.error(`No audio source for language: ${lang}`);
    return { success: 0, failed: book.chapters };
  }
  
  let success = 0;
  let failed = 0;
  
  for (let ch = 1; ch <= book.chapters; ch++) {
    const key = `${lang}/${book.abbrev}/${ch}`;
    
    if (progress.completed[key]) {
      console.log(`[Skip] Already completed: ${key}`);
      success++;
      continue;
    }
    
    const url = getAudioUrl(lang, book.abbrev, ch);
    console.log(`[Download] ${key} from ${url}`);
    
    const audioData = await downloadAudio(url);
    
    if (!audioData) {
      progress.failed[key] = "Download failed";
      failed++;
      saveProgress(progress);
      continue;
    }
    
    const uploaded = await uploadToSupabase(
      lang,
      source.version,
      book.abbrev,
      ch,
      audioData
    );
    
    if (uploaded) {
      progress.completed[key] = true;
      delete progress.failed[key];
      success++;
    } else {
      progress.failed[key] = "Upload failed";
      failed++;
    }
    
    saveProgress(progress);
    
    // Rate limiting - wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return { success, failed };
}

async function main() {
  const args = process.argv.slice(2);
  const lang = args[0] || "pt";
  const startBookIdx = parseInt(args[1]) || 0;
  const endBookIdx = parseInt(args[2]) || BIBLE_BOOKS.length;
  
  console.log("=".repeat(60));
  console.log("Bible Audio Ingestion Script");
  console.log("=".repeat(60));
  console.log(`Language: ${lang}`);
  console.log(`Books: ${startBookIdx + 1} to ${endBookIdx} of ${BIBLE_BOOKS.length}`);
  console.log("=".repeat(60));
  
  if (!AUDIO_SOURCES[lang]) {
    console.error(`Unsupported language: ${lang}`);
    console.log("Supported languages:", Object.keys(AUDIO_SOURCES).join(", "));
    process.exit(1);
  }
  
  // Ensure bucket exists
  await ensureBucketExists();
  
  // Load progress
  const progress = loadProgress();
  console.log(`Loaded progress: ${Object.keys(progress.completed).length} completed, ${Object.keys(progress.failed).length} failed`);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  const books = BIBLE_BOOKS.slice(startBookIdx, endBookIdx);
  
  for (const book of books) {
    console.log(`\n[Processing] ${book.name} (${book.chapters} chapters)`);
    const { success, failed } = await processBook(lang, book, progress);
    totalSuccess += success;
    totalFailed += failed;
    console.log(`[${book.name}] Completed: ${success}/${book.chapters}, Failed: ${failed}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Success: ${totalSuccess}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`Progress saved to: ${PROGRESS_FILE}`);
}

main().catch(console.error);
