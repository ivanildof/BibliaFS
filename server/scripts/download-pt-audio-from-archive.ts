/**
 * Download Portuguese Bible Audio from Archive.org
 * Automatically organizes and uploads to Supabase Storage
 * 
 * Usage:
 *   npx tsx server/scripts/download-pt-audio-from-archive.ts [book-abbrev] [chapters]
 * 
 * Examples:
 *   npx tsx server/scripts/download-pt-audio-from-archive.ts gn 50    # Genesis
 *   npx tsx server/scripts/download-pt-audio-from-archive.ts mt 28    # Matthew
 *   npx tsx server/scripts/download-pt-audio-from-archive.ts all 1189 # Full Bible
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import "dotenv/config";

const execPromise = promisify(exec);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = "bible-audio";

// Bible book map to Archive.org file names
const BOOK_MAP: { [key: string]: { archiveName: string; chapters: number } } = {
  gn: { archiveName: "Bible_pt_01_genesis", chapters: 50 },
  ex: { archiveName: "Bible_pt_02_exodus", chapters: 40 },
  lv: { archiveName: "Bible_pt_03_leviticus", chapters: 27 },
  nm: { archiveName: "Bible_pt_04_numbers", chapters: 36 },
  dt: { archiveName: "Bible_pt_05_deuteronomy", chapters: 34 },
  js: { archiveName: "Bible_pt_06_joshua", chapters: 24 },
  jz: { archiveName: "Bible_pt_07_judges", chapters: 21 },
  rt: { archiveName: "Bible_pt_08_ruth", chapters: 4 },
  mt: { archiveName: "Bible_pt_40_matthew", chapters: 28 },
  mc: { archiveName: "Bible_pt_41_mark", chapters: 16 },
  lc: { archiveName: "Bible_pt_42_luke", chapters: 24 },
  jo: { archiveName: "Bible_pt_43_john", chapters: 21 },
};

async function downloadFromArchive(url: string, outputFile: string): Promise<boolean> {
  try {
    console.log(`  Downloading: ${url}`);
    const { stdout } = await execPromise(
      `curl -L -o "${outputFile}" "${url}" 2>/dev/null && echo "success"`
    );
    
    if (!fs.existsSync(outputFile)) {
      console.error(`    ❌ Download failed`);
      return false;
    }
    
    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`    ✅ Downloaded (${sizeMB} MB)`);
    return true;
  } catch (error: any) {
    console.error(`    ❌ Error:`, error.message);
    return false;
  }
}

async function uploadToSupabase(
  filePath: string,
  bookAbbrev: string,
  chapter: number
): Promise<boolean> {
  try {
    const fileData = fs.readFileSync(filePath);
    const remoteFileName = `PT/ARC/${bookAbbrev}/${chapter}.mp3`;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remoteFileName, fileData, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (error) {
      console.error(`    ❌ Upload failed:`, error.message);
      return false;
    }

    const sizeMB = (fileData.byteLength / 1024 / 1024).toFixed(2);
    console.log(`    ✅ Uploaded to PT/ARC/${bookAbbrev}/${chapter}.mp3 (${sizeMB} MB)`);
    return true;
  } catch (error: any) {
    console.error(`    ❌ Upload error:`, error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log("🎵 Download Portuguese Bible Audio from Archive.org\n");
    console.log("Usage:");
    console.log("  npx tsx server/scripts/download-pt-audio-from-archive.ts [book] [chapters]\n");
    console.log("Available books:");
    Object.entries(BOOK_MAP).forEach(([abbrev, info]) => {
      console.log(`  ${abbrev.padEnd(4)} - ${info.archiveName} (${info.chapters} chapters)`);
    });
    console.log("\nExamples:");
    console.log("  npx tsx server/scripts/download-pt-audio-from-archive.ts gn 50");
    console.log("  npx tsx server/scripts/download-pt-audio-from-archive.ts mt 28\n");
    process.exit(0);
  }

  const [bookAbbrev, chaptersArg] = args;
  const bookInfo = BOOK_MAP[bookAbbrev];

  if (!bookInfo) {
    console.error(`❌ Unknown book: ${bookAbbrev}`);
    process.exit(1);
  }

  const chapters = parseInt(chaptersArg);
  const tempDir = "./temp-audio-download";
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log(`\n🚀 Download & Upload Portuguese Audio`);
  console.log(`📖 Book: ${bookInfo.archiveName}`);
  console.log(`📦 Chapters: ${chapters}\n`);

  let successful = 0;
  let failed = 0;

  for (let ch = 1; ch <= chapters; ch++) {
    const archiveUrl = `https://archive.org/download/por_audio_bible/${bookInfo.archiveName}_${ch.toString().padStart(2, "0")}.mp3`;
    const tempFile = path.join(tempDir, `ch_${ch}.mp3`);

    process.stdout.write(`Ch ${ch.toString().padStart(3)}: `);

    // Download from Archive.org
    if (!await downloadFromArchive(archiveUrl, tempFile)) {
      failed++;
      continue;
    }

    // Upload to Supabase
    if (await uploadToSupabase(tempFile, bookAbbrev, ch)) {
      successful++;
    } else {
      failed++;
    }

    // Delete temp file to save space
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }

    // Rate limiting: 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Cleanup
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }

  console.log(`\n✨ Complete!`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
}

main().catch(console.error);
