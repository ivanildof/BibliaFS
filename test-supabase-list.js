import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listFiles() {
  console.log("📂 Listing bible-audio bucket...\n");
  
  try {
    const { data, error } = await supabase.storage
      .from("bible-audio")
      .list("PT/ARC/rt", { limit: 100 });
    
    if (error) {
      console.error("❌ Error:", error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log("❌ Nenhum arquivo encontrado em PT/ARC/rt/");
      return;
    }
    
    console.log(`✅ Found ${data.length} files:`);
    data.forEach(file => {
      console.log(`  - ${file.name}`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

await listFiles();
