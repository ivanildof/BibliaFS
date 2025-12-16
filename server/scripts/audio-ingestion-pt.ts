/**
 * Portuguese Bible Audio Ingestion Script
 * Downloads from Bible.com and uploads to Supabase Storage
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = "bible-audio";

// Bible.com audio URL structure: https://www.bible.com/audio/{VERSION_ID}/{BOOK_NUM}/{CHAPTER}.mp3
// ARC (Almeida Revista e Corrigida): pt-ARC_PT_AUDIO
// NVI (Nova Versão Internacional): pt-NVI_PT_AUDIO

const BIBLE_BOOKS = [
  { abbrev: "gn", name: "Genesis", bibleComNum: 1, chapters: 50 },
  { abbrev: "ex", name: "Exodus", bibleComNum: 2, chapters: 40 },
  { abbrev: "lv", name: "Leviticus", bibleComNum: 3, chapters: 27 },
  { abbrev: "nm", name: "Numbers", bibleComNum: 4, chapters: 36 },
  { abbrev: "dt", name: "Deuteronomy", bibleComNum: 5, chapters: 34 },
  { abbrev: "js", name: "Joshua", bibleComNum: 6, chapters: 24 },
  { abbrev: "jz", name: "Judges", bibleComNum: 7, chapters: 21 },
  { abbrev: "rt", name: "Ruth", bibleComNum: 8, chapters: 4 },
  { abbrev: "1sm", name: "1 Samuel", bibleComNum: 9, chapters: 31 },
  { abbrev: "2sm", name: "2 Samuel", bibleComNum: 10, chapters: 24 },
  { abbrev: "1rs", name: "1 Kings", bibleComNum: 11, chapters: 22 },
  { abbrev: "2rs", name: "2 Kings", bibleComNum: 12, chapters: 25 },
  { abbrev: "1cr", name: "1 Chronicles", bibleComNum: 13, chapters: 29 },
  { abbrev: "2cr", name: "2 Chronicles", bibleComNum: 14, chapters: 36 },
  { abbrev: "ed", name: "Ezra", bibleComNum: 15, chapters: 10 },
  { abbrev: "ne", name: "Nehemiah", bibleComNum: 16, chapters: 13 },
  { abbrev: "et", name: "Esther", bibleComNum: 17, chapters: 10 },
  { abbrev: "job", name: "Job", bibleComNum: 18, chapters: 42 },
  { abbrev: "sl", name: "Psalms", bibleComNum: 19, chapters: 150 },
  { abbrev: "pv", name: "Proverbs", bibleComNum: 20, chapters: 31 },
  { abbrev: "ec", name: "Ecclesiastes", bibleComNum: 21, chapters: 12 },
  { abbrev: "ct", name: "Song of Solomon", bibleComNum: 22, chapters: 8 },
  { abbrev: "is", name: "Isaiah", bibleComNum: 23, chapters: 66 },
  { abbrev: "jr", name: "Jeremiah", bibleComNum: 24, chapters: 52 },
  { abbrev: "lm", name: "Lamentations", bibleComNum: 25, chapters: 5 },
  { abbrev: "ez", name: "Ezekiel", bibleComNum: 26, chapters: 48 },
  { abbrev: "dn", name: "Daniel", bibleComNum: 27, chapters: 12 },
  { abbrev: "os", name: "Hosea", bibleComNum: 28, chapters: 14 },
  { abbrev: "jl", name: "Joel", bibleComNum: 29, chapters: 3 },
  { abbrev: "am", name: "Amos", bibleComNum: 30, chapters: 9 },
  { abbrev: "ob", name: "Obadiah", bibleComNum: 31, chapters: 1 },
  { abbrev: "jn", name: "Jonah", bibleComNum: 32, chapters: 4 },
  { abbrev: "mq", name: "Micah", bibleComNum: 33, chapters: 7 },
  { abbrev: "na", name: "Nahum", bibleComNum: 34, chapters: 3 },
  { abbrev: "hc", name: "Habakkuk", bibleComNum: 35, chapters: 3 },
  { abbrev: "sf", name: "Zephaniah", bibleComNum: 36, chapters: 3 },
  { abbrev: "ag", name: "Haggai", bibleComNum: 37, chapters: 2 },
  { abbrev: "zc", name: "Zechariah", bibleComNum: 38, chapters: 14 },
  { abbrev: "ml", name: "Malachi", bibleComNum: 39, chapters: 4 },
  { abbrev: "mt", name: "Matthew", bibleComNum: 40, chapters: 28 },
  { abbrev: "mc", name: "Mark", bibleComNum: 41, chapters: 16 },
  { abbrev: "lc", name: "Luke", bibleComNum: 42, chapters: 24 },
  { abbrev: "jo", name: "John", bibleComNum: 43, chapters: 21 },
  { abbrev: "at", name: "Acts", bibleComNum: 44, chapters: 28 },
  { abbrev: "rm", name: "Romans", bibleComNum: 45, chapters: 16 },
  { abbrev: "1co", name: "1 Corinthians", bibleComNum: 46, chapters: 16 },
  { abbrev: "2co", name: "2 Corinthians", bibleComNum: 47, chapters: 13 },
  { abbrev: "gl", name: "Galatians", bibleComNum: 48, chapters: 6 },
  { abbrev: "ef", name: "Ephesians", bibleComNum: 49, chapters: 6 },
  { abbrev: "fp", name: "Philippians", bibleComNum: 50, chapters: 4 },
  { abbrev: "cl", name: "Colossians", bibleComNum: 51, chapters: 4 },
  { abbrev: "1ts", name: "1 Thessalonians", bibleComNum: 52, chapters: 5 },
  { abbrev: "2ts", name: "2 Thessalonians", bibleComNum: 53, chapters: 3 },
  { abbrev: "1tm", name: "1 Timothy", bibleComNum: 54, chapters: 6 },
  { abbrev: "2tm", name: "2 Timothy", bibleComNum: 55, chapters: 4 },
  { abbrev: "tt", name: "Titus", bibleComNum: 56, chapters: 3 },
  { abbrev: "fm", name: "Philemon", bibleComNum: 57, chapters: 1 },
  { abbrev: "hb", name: "Hebrews", bibleComNum: 58, chapters: 13 },
  { abbrev: "tg", name: "James", bibleComNum: 59, chapters: 5 },
  { abbrev: "1pe", name: "1 Peter", bibleComNum: 60, chapters: 5 },
  { abbrev: "2pe", name: "2 Peter", bibleComNum: 61, chapters: 3 },
  { abbrev: "1jo", name: "1 John", bibleComNum: 62, chapters: 5 },
  { abbrev: "2jo", name: "2 John", bibleComNum: 63, chapters: 1 },
  { abbrev: "3jo", name: "3 John", bibleComNum: 64, chapters: 1 },
  { abbrev: "jd", name: "Jude", bibleComNum: 65, chapters: 1 },
  { abbrev: "ap", name: "Revelation", bibleComNum: 66, chapters: 22 },
];

const PROGRESS_FILE = "audio-ingestion-pt-progress.json";

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

async function downloadAudio(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "BíbliaFS/2.0" }
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
      .upload(filePath, audioData, { contentType: "audio/mpeg", upsert: true });
    if (error) {
      console.error(`[Upload] Failed: ${filePath}`, error.message);
      return false;
    }
    console.log(`[Upload] ✓ ${filePath}`);
    return true;
  } catch (error) {
    console.error(`[Upload] Error: ${filePath}`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const versionId = args[0] || "pt-ARC_PT_AUDIO"; // ARC by default
  const versionShort = args[1] || "ARC";
  const startBookIdx = parseInt(args[2]) || 0;
  const endBookIdx = parseInt(args[3]) || BIBLE_BOOKS.length;

  console.log("=".repeat(60));
  console.log("Bible Audio Ingestion - Portuguese (Bible.com)");
  console.log("=".repeat(60));
  console.log(`Version: ${versionShort} (${versionId})`);
  console.log(`Books: ${startBookIdx + 1} to ${endBookIdx} of ${BIBLE_BOOKS.length}`);
  console.log("=".repeat(60));

  const progress = loadProgress();
  console.log(`Loaded: ${Object.keys(progress.completed).length} completed`);

  let totalSuccess = 0;
  let totalFailed = 0;

  const books = BIBLE_BOOKS.slice(startBookIdx, endBookIdx);

  for (const book of books) {
    console.log(`\n[${book.name}] (${book.chapters} chapters)`);
    
    for (let ch = 1; ch <= book.chapters; ch++) {
      const key = `pt/${versionShort.toLowerCase()}/${book.abbrev}/${ch}`;
      
      if (progress.completed[key]) {
        totalSuccess++;
        continue;
      }

      const url = `https://www.bible.com/audio/${versionId}/${book.bibleComNum}/${ch}.mp3`;
      const audioData = await downloadAudio(url);

      if (!audioData) {
        progress.failed[key] = "Download failed";
        totalFailed++;
      } else {
        if (await uploadToSupabase("PT", versionShort, book.abbrev, ch, audioData)) {
          progress.completed[key] = true;
          delete progress.failed[key];
          totalSuccess++;
        } else {
          progress.failed[key] = "Upload failed";
          totalFailed++;
        }
      }
      
      saveProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 250)); // Rate limit
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Success: ${totalSuccess} | ❌ Failed: ${totalFailed}`);
}

main().catch(console.error);
