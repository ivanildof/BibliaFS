/**
 * Upload Local Bible Audio Files to Supabase Storage
 * 
 * Usage:
 *   npx tsx server/scripts/upload-local-audio.ts [sourceDir] [lang] [version] [bookAbbrev]
 * 
 * Examples:
 *   npx tsx server/scripts/upload-local-audio.ts ./audio-files EN WEB gn
 *   npx tsx server/scripts/upload-local-audio.ts ./pt-audio PT ARC mt
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = "bible-audio";

async function uploadFile(
  filePath: string,
  remoteFileName: string
): Promise<boolean> {
  try {
    const fileData = fs.readFileSync(filePath);
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remoteFileName, fileData, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (error) {
      console.error(`❌ Upload failed: ${remoteFileName}`);
      console.error(`   Error: ${error.message}`);
      return false;
    }

    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✅ ${remoteFileName} (${sizeMB} MB)`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error uploading ${remoteFileName}:`, error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log("📚 Bible Audio Uploader for Supabase Storage\n");
    console.log("Usage:");
    console.log("  npx tsx server/scripts/upload-local-audio.ts [sourceDir] [lang] [version] [bookAbbrev]\n");
    console.log("Examples:");
    console.log("  npx tsx server/scripts/upload-local-audio.ts ./audio-files EN WEB gn");
    console.log("  npx tsx server/scripts/upload-local-audio.ts ./pt-audio PT ARC mt\n");
    console.log("File Structure Expected:");
    console.log("  sourceDir/");
    console.log("    ├── 1.mp3");
    console.log("    ├── 2.mp3");
    console.log("    └── ... (chapter MP3s)\n");
    process.exit(0);
  }

  const [sourceDir, lang, version, bookAbbrev] = args;

  // Validate source directory
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  // Get all MP3 files from source directory
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.mp3'));
  
  if (files.length === 0) {
    console.error(`❌ No MP3 files found in: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`🚀 Uploading Bible Audio to Supabase Storage`);
  console.log(`🗂️  Source: ${sourceDir}`);
  console.log(`📍 Destination: ${lang}/${version}/${bookAbbrev}/`);
  console.log(`📦 Files: ${files.length}\n`);

  let successful = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const remoteFileName = `${lang}/${version}/${bookAbbrev}/${file}`;
    
    if (await uploadFile(filePath, remoteFileName)) {
      successful++;
    } else {
      failed++;
    }
    
    // Rate limiting: 1 second between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✨ Upload Complete!`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n📝 Files available at:`);
  console.log(`   https://[supabase-url]/storage/v1/object/public/bible-audio/${lang}/${version}/${bookAbbrev}/[chapter].mp3`);
}

main().catch(console.error);
