/**
 * Bible Audio Ingestion Script
 * Downloads audio from eBible.org (public domain) and uploads to Supabase Storage
 * 
 * Source: eBible.org - World English Bible (WEB) audio
 * License: Public Domain - free to download, copy, and distribute
 * 
 * Usage: npx tsx server/scripts/audio-ingestion.ts [startBookIdx] [endBookIdx]
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

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

// Chapter number to English word mapping (for eBible.org URL format - uses underscores)
const CHAPTER_WORDS: { [key: number]: string } = {
  1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
  6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten",
  11: "Eleven", 12: "Twelve", 13: "Thirteen", 14: "Fourteen", 15: "Fifteen",
  16: "Sixteen", 17: "Seventeen", 18: "Eighteen", 19: "Nineteen", 20: "Twenty",
  21: "Twenty_One", 22: "Twenty_Two", 23: "Twenty_Three", 24: "Twenty_Four", 25: "Twenty_Five",
  26: "Twenty_Six", 27: "Twenty_Seven", 28: "Twenty_Eight", 29: "Twenty_Nine", 30: "Thirty",
  31: "Thirty_One", 32: "Thirty_Two", 33: "Thirty_Three", 34: "Thirty_Four", 35: "Thirty_Five",
  36: "Thirty_Six", 37: "Thirty_Seven", 38: "Thirty_Eight", 39: "Thirty_Nine", 40: "Forty",
  41: "Forty_One", 42: "Forty_Two", 43: "Forty_Three", 44: "Forty_Four", 45: "Forty_Five",
  46: "Forty_Six", 47: "Forty_Seven", 48: "Forty_Eight", 49: "Forty_Nine", 50: "Fifty",
  51: "Fifty_One", 52: "Fifty_Two", 53: "Fifty_Three", 54: "Fifty_Four", 55: "Fifty_Five",
  56: "Fifty_Six", 57: "Fifty_Seven", 58: "Fifty_Eight", 59: "Fifty_Nine", 60: "Sixty",
  61: "Sixty_One", 62: "Sixty_Two", 63: "Sixty_Three", 64: "Sixty_Four", 65: "Sixty_Five",
  66: "Sixty_Six", 67: "Sixty_Seven", 68: "Sixty_Eight", 69: "Sixty_Nine", 70: "Seventy",
  71: "Seventy_One", 72: "Seventy_Two", 73: "Seventy_Three", 74: "Seventy_Four", 75: "Seventy_Five",
  76: "Seventy_Six", 77: "Seventy_Seven", 78: "Seventy_Eight", 79: "Seventy_Nine", 80: "Eighty",
  81: "Eighty_One", 82: "Eighty_Two", 83: "Eighty_Three", 84: "Eighty_Four", 85: "Eighty_Five",
  86: "Eighty_Six", 87: "Eighty_Seven", 88: "Eighty_Eight", 89: "Eighty_Nine", 90: "Ninety",
  91: "Ninety_One", 92: "Ninety_Two", 93: "Ninety_Three", 94: "Ninety_Four", 95: "Ninety_Five",
  96: "Ninety_Six", 97: "Ninety_Seven", 98: "Ninety_Eight", 99: "Ninety_Nine", 100: "One_Hundred",
  101: "One_Hundred_One", 102: "One_Hundred_Two", 103: "One_Hundred_Three", 104: "One_Hundred_Four",
  105: "One_Hundred_Five", 106: "One_Hundred_Six", 107: "One_Hundred_Seven", 108: "One_Hundred_Eight",
  109: "One_Hundred_Nine", 110: "One_Hundred_Ten", 111: "One_Hundred_Eleven", 112: "One_Hundred_Twelve",
  113: "One_Hundred_Thirteen", 114: "One_Hundred_Fourteen", 115: "One_Hundred_Fifteen",
  116: "One_Hundred_Sixteen", 117: "One_Hundred_Seventeen", 118: "One_Hundred_Eighteen",
  119: "One_Hundred_Nineteen", 120: "One_Hundred_Twenty", 121: "One_Hundred_Twenty_One",
  122: "One_Hundred_Twenty_Two", 123: "One_Hundred_Twenty_Three", 124: "One_Hundred_Twenty_Four",
  125: "One_Hundred_Twenty_Five", 126: "One_Hundred_Twenty_Six", 127: "One_Hundred_Twenty_Seven",
  128: "One_Hundred_Twenty_Eight", 129: "One_Hundred_Twenty_Nine", 130: "One_Hundred_Thirty",
  131: "One_Hundred_Thirty_One", 132: "One_Hundred_Thirty_Two", 133: "One_Hundred_Thirty_Three",
  134: "One_Hundred_Thirty_Four", 135: "One_Hundred_Thirty_Five", 136: "One_Hundred_Thirty_Six",
  137: "One_Hundred_Thirty_Seven", 138: "One_Hundred_Thirty_Eight", 139: "One_Hundred_Thirty_Nine",
  140: "One_Hundred_Forty", 141: "One_Hundred_Forty_One", 142: "One_Hundred_Forty_Two",
  143: "One_Hundred_Forty_Three", 144: "One_Hundred_Forty_Four", 145: "One_Hundred_Forty_Five",
  146: "One_Hundred_Forty_Six", 147: "One_Hundred_Forty_Seven", 148: "One_Hundred_Forty_Eight",
  149: "One_Hundred_Forty_Nine", 150: "One_Hundred_Fifty"
};

// Bible books with eBible.org URL structure
// Format: https://ebible.org/eng-web/audio/{bookNum}_{bookName}/{chapterFile}.mp3
const BIBLE_BOOKS = [
  // Old Testament
  { abbrev: "gn", name: "Genesis", urlName: "Genesis", bookNum: "01", chapters: 50 },
  { abbrev: "ex", name: "Exodus", urlName: "Exodus", bookNum: "02", chapters: 40 },
  { abbrev: "lv", name: "Leviticus", urlName: "Leviticus", bookNum: "03", chapters: 27 },
  { abbrev: "nm", name: "Numbers", urlName: "Numbers", bookNum: "04", chapters: 36 },
  { abbrev: "dt", name: "Deuteronomy", urlName: "Deuteronomy", bookNum: "05", chapters: 34 },
  { abbrev: "js", name: "Joshua", urlName: "Joshua", bookNum: "06", chapters: 24 },
  { abbrev: "jz", name: "Judges", urlName: "Judges", bookNum: "07", chapters: 21 },
  { abbrev: "rt", name: "Ruth", urlName: "Ruth", bookNum: "08", chapters: 4 },
  { abbrev: "1sm", name: "1 Samuel", urlName: "First_Samuel", bookNum: "09", chapters: 31 },
  { abbrev: "2sm", name: "2 Samuel", urlName: "Second_Samuel", bookNum: "10", chapters: 24 },
  { abbrev: "1rs", name: "1 Kings", urlName: "First_Kings", bookNum: "11", chapters: 22 },
  { abbrev: "2rs", name: "2 Kings", urlName: "Second_Kings", bookNum: "12", chapters: 25 },
  { abbrev: "1cr", name: "1 Chronicles", urlName: "First_Chronicles", bookNum: "13", chapters: 29 },
  { abbrev: "2cr", name: "2 Chronicles", urlName: "Second_Chronicles", bookNum: "14", chapters: 36 },
  { abbrev: "ed", name: "Ezra", urlName: "Ezra", bookNum: "15", chapters: 10 },
  { abbrev: "ne", name: "Nehemiah", urlName: "Nehemiah", bookNum: "16", chapters: 13 },
  { abbrev: "et", name: "Esther", urlName: "Esther", bookNum: "17", chapters: 10 },
  { abbrev: "job", name: "Job", urlName: "Job", bookNum: "18", chapters: 42 },
  { abbrev: "sl", name: "Psalms", urlName: "Psalms", bookNum: "19", chapters: 150 },
  { abbrev: "pv", name: "Proverbs", urlName: "Proverbs", bookNum: "20", chapters: 31 },
  { abbrev: "ec", name: "Ecclesiastes", urlName: "Ecclesiastes", bookNum: "21", chapters: 12 },
  { abbrev: "ct", name: "Song of Solomon", urlName: "Song_of_Solomon", bookNum: "22", chapters: 8 },
  { abbrev: "is", name: "Isaiah", urlName: "Isaiah", bookNum: "23", chapters: 66 },
  { abbrev: "jr", name: "Jeremiah", urlName: "Jeremiah", bookNum: "24", chapters: 52 },
  { abbrev: "lm", name: "Lamentations", urlName: "Lamentations", bookNum: "25", chapters: 5 },
  { abbrev: "ez", name: "Ezekiel", urlName: "Ezekiel", bookNum: "26", chapters: 48 },
  { abbrev: "dn", name: "Daniel", urlName: "Daniel", bookNum: "27", chapters: 12 },
  { abbrev: "os", name: "Hosea", urlName: "Hosea", bookNum: "28", chapters: 14 },
  { abbrev: "jl", name: "Joel", urlName: "Joel", bookNum: "29", chapters: 3 },
  { abbrev: "am", name: "Amos", urlName: "Amos", bookNum: "30", chapters: 9 },
  { abbrev: "ob", name: "Obadiah", urlName: "Obadiah", bookNum: "31", chapters: 1 },
  { abbrev: "jn", name: "Jonah", urlName: "Jonah", bookNum: "32", chapters: 4 },
  { abbrev: "mq", name: "Micah", urlName: "Micah", bookNum: "33", chapters: 7 },
  { abbrev: "na", name: "Nahum", urlName: "Nahum", bookNum: "34", chapters: 3 },
  { abbrev: "hc", name: "Habakkuk", urlName: "Habakkuk", bookNum: "35", chapters: 3 },
  { abbrev: "sf", name: "Zephaniah", urlName: "Zephaniah", bookNum: "36", chapters: 3 },
  { abbrev: "ag", name: "Haggai", urlName: "Haggai", bookNum: "37", chapters: 2 },
  { abbrev: "zc", name: "Zechariah", urlName: "Zechariah", bookNum: "38", chapters: 14 },
  { abbrev: "ml", name: "Malachi", urlName: "Malachi", bookNum: "39", chapters: 4 },
  // New Testament
  { abbrev: "mt", name: "Matthew", urlName: "Matthew", bookNum: "40", chapters: 28 },
  { abbrev: "mc", name: "Mark", urlName: "Mark", bookNum: "41", chapters: 16 },
  { abbrev: "lc", name: "Luke", urlName: "Luke", bookNum: "42", chapters: 24 },
  { abbrev: "jo", name: "John", urlName: "John", bookNum: "43", chapters: 21 },
  { abbrev: "at", name: "Acts", urlName: "Acts", bookNum: "44", chapters: 28 },
  { abbrev: "rm", name: "Romans", urlName: "Romans", bookNum: "45", chapters: 16 },
  { abbrev: "1co", name: "1 Corinthians", urlName: "First_Corinthians", bookNum: "46", chapters: 16 },
  { abbrev: "2co", name: "2 Corinthians", urlName: "Second_Corinthians", bookNum: "47", chapters: 13 },
  { abbrev: "gl", name: "Galatians", urlName: "Galatians", bookNum: "48", chapters: 6 },
  { abbrev: "ef", name: "Ephesians", urlName: "Ephesians", bookNum: "49", chapters: 6 },
  { abbrev: "fp", name: "Philippians", urlName: "Philippians", bookNum: "50", chapters: 4 },
  { abbrev: "cl", name: "Colossians", urlName: "Colossians", bookNum: "51", chapters: 4 },
  { abbrev: "1ts", name: "1 Thessalonians", urlName: "First_Thessalonians", bookNum: "52", chapters: 5 },
  { abbrev: "2ts", name: "2 Thessalonians", urlName: "Second_Thessalonians", bookNum: "53", chapters: 3 },
  { abbrev: "1tm", name: "1 Timothy", urlName: "First_Timothy", bookNum: "54", chapters: 6 },
  { abbrev: "2tm", name: "2 Timothy", urlName: "Second_Timothy", bookNum: "55", chapters: 4 },
  { abbrev: "tt", name: "Titus", urlName: "Titus", bookNum: "56", chapters: 3 },
  { abbrev: "fm", name: "Philemon", urlName: "Philemon", bookNum: "57", chapters: 1 },
  { abbrev: "hb", name: "Hebrews", urlName: "Hebrews", bookNum: "58", chapters: 13 },
  { abbrev: "tg", name: "James", urlName: "James", bookNum: "59", chapters: 5 },
  { abbrev: "1pe", name: "1 Peter", urlName: "First_Peter", bookNum: "60", chapters: 5 },
  { abbrev: "2pe", name: "2 Peter", urlName: "Second_Peter", bookNum: "61", chapters: 3 },
  { abbrev: "1jo", name: "1 John", urlName: "First_John", bookNum: "62", chapters: 5 },
  { abbrev: "2jo", name: "2 John", urlName: "Second_John", bookNum: "63", chapters: 1 },
  { abbrev: "3jo", name: "3 John", urlName: "Third_John", bookNum: "64", chapters: 1 },
  { abbrev: "jd", name: "Jude", urlName: "Jude", bookNum: "65", chapters: 1 },
  { abbrev: "ap", name: "Revelation", urlName: "Revelations", bookNum: "66", chapters: 22 },
];

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

function getEbibleAudioUrl(book: typeof BIBLE_BOOKS[0], chapter: number): string {
  const chapterStr = chapter.toString().padStart(2, "0");
  const chapterWord = CHAPTER_WORDS[chapter] || `${chapter}`;
  // Format: https://ebible.org/eng-web/audio/01_Genesis/01_01_Genesis_Chapter_One.mp3
  return `https://ebible.org/eng-web/audio/${book.bookNum}_${book.urlName}/${book.bookNum}_${chapterStr}_${book.urlName}_Chapter_${chapterWord}.mp3`;
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
  // Store as: EN/WEB/gn/1.mp3
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
    
    console.log(`[Upload] Success: ${filePath} (${(audioData.byteLength / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (error) {
    console.error(`[Upload] Error: ${filePath} -`, error);
    return false;
  }
}

async function processBook(
  book: typeof BIBLE_BOOKS[0],
  progress: ProgressData
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  
  for (let ch = 1; ch <= book.chapters; ch++) {
    const key = `en/web/${book.abbrev}/${ch}`;
    
    if (progress.completed[key]) {
      console.log(`[Skip] Already completed: ${key}`);
      success++;
      continue;
    }
    
    const url = getEbibleAudioUrl(book, ch);
    console.log(`[Download] ${book.name} ${ch} from eBible.org`);
    
    const audioData = await downloadAudio(url);
    
    if (!audioData) {
      progress.failed[key] = "Download failed";
      failed++;
      saveProgress(progress);
      // Try alternative URL format for some books
      continue;
    }
    
    const uploaded = await uploadToSupabase(
      "EN",
      "WEB",
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
    
    // Rate limiting - wait 300ms between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return { success, failed };
}

async function main() {
  const args = process.argv.slice(2);
  const startBookIdx = parseInt(args[0]) || 0;
  const endBookIdx = parseInt(args[1]) || BIBLE_BOOKS.length;
  
  console.log("=".repeat(60));
  console.log("Bible Audio Ingestion Script - eBible.org (World English Bible)");
  console.log("=".repeat(60));
  console.log(`Books: ${startBookIdx + 1} to ${endBookIdx} of ${BIBLE_BOOKS.length}`);
  console.log("=".repeat(60));
  
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
    const { success, failed } = await processBook(book, progress);
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
  
  // Show Supabase Storage URL
  console.log(`\nSupabase Storage URL: ${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`);
}

main().catch(console.error);
