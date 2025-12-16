/**
 * Portuguese Bible Audio Ingestion - IMPROVED
 * Downloads from Bible.com with retry logic and better error handling
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = "bible-audio";
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAudioWithRetry(url: string, retries = MAX_RETRIES): Promise<ArrayBuffer | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "BíbliaFS/2.0" },
        timeout: 30000
      });
      if (!response.ok) {
        console.warn(`⚠️  HTTP ${response.status}: ${url}`);
        if (attempt < retries - 1) await delay(RETRY_DELAY * (attempt + 1));
        continue;
      }
      return await response.arrayBuffer();
    } catch (error: any) {
      console.warn(`⚠️  Attempt ${attempt + 1}/${retries} failed:`, error.message);
      if (attempt < retries - 1) await delay(RETRY_DELAY * (attempt + 1));
    }
  }
  return null;
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
      console.error(`❌ Upload failed: ${filePath} -`, error.message);
      return false;
    }
    console.log(`✅ ${filePath}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Upload error: ${filePath}`, error.message);
    return false;
  }
}

async function main() {
  const books = [
    { abbrev: "gn", name: "Genesis", bibleComNum: 1, chapters: 50 },
    { abbrev: "ex", name: "Exodus", bibleComNum: 2, chapters: 40 },
    { abbrev: "mt", name: "Matthew", bibleComNum: 40, chapters: 28 },
    { abbrev: "jo", name: "John", bibleComNum: 43, chapters: 21 },
  ];

  console.log("🚀 Portuguese Bible Audio Download (PT/ARC) - IMPROVED");
  console.log("=========================================================");

  for (const book of books) {
    console.log(`\n📖 ${book.name.padEnd(20)} (${book.chapters} chapters)`);
    
    for (let ch = 1; ch <= book.chapters; ch++) {
      const url = `https://www.bible.com/audio/pt-ARC_PT_AUDIO/${book.bibleComNum}/${ch}.mp3`;
      
      process.stdout.write(`  Ch ${ch.toString().padStart(3)}: `);
      
      const audioData = await fetchAudioWithRetry(url);
      if (!audioData) {
        console.log("❌ Failed");
        continue;
      }

      if (await uploadToSupabase("PT", "ARC", book.abbrev, ch, audioData)) {
        process.stdout.write("✓\n");
      } else {
        process.stdout.write("❌\n");
      }
      
      // Rate limiting: wait 500ms between requests
      await delay(500);
    }
  }

  console.log("\n✨ Download completed!");
}

main().catch(console.error);
