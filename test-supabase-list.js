const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://olvumxgyoazdftdyasmx.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY not set");
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

listFiles();
