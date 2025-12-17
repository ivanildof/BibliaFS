import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listFiles() {
  console.log("📂 Listing bible-audio bucket contents...\n");
  
  try {
    // List PT/ARC folder
    const { data, error } = await supabase.storage
      .from("bible-audio")
      .list("PT/ARC", { limit: 100 });
    
    if (error) {
      console.error("❌ Error:", error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log("❌ Nenhum arquivo em PT/ARC/");
      return;
    }
    
    console.log(`✅ Found ${data.length} items in PT/ARC/:\n`);
    for (const item of data) {
      if (item.id) {
        console.log(`  📁 ${item.name}/ (folder)`);
      }
    }
    
    // Try to list Ruth files
    console.log("\n--- Checking RT folder ---");
    const { data: rtFiles, error: rtError } = await supabase.storage
      .from("bible-audio")
      .list("PT/ARC/rt", { limit: 100 });
    
    if (rtError) {
      console.error("❌ RT Error:", rtError.message);
      return;
    }
    
    if (rtFiles && rtFiles.length > 0) {
      console.log(`✅ Found ${rtFiles.length} files in PT/ARC/rt/:`);
      rtFiles.forEach(f => console.log(`  - ${f.name}`));
    } else {
      console.log("❌ No files found in PT/ARC/rt/");
    }
    
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

listFiles();
