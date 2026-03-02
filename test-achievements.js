import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function showAchievements() {
  console.log("🏆 CONQUISTAS CADASTRADAS\n");
  
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) {
    console.log(`❌ Erro: ${error.message}`);
    return;
  }

  if (achievements && achievements.length > 0) {
    console.log(`✅ Total: ${achievements.length} conquistas\n`);
    achievements.forEach((achievement, idx) => {
      console.log(`${idx + 1}. ${achievement.title || achievement.name}`);
      console.log(`   Descrição: ${achievement.description || 'N/A'}`);
      console.log(`   Tipo: ${achievement.type || 'N/A'}`);
      console.log(`   Pontos: ${achievement.points || 0}`);
      console.log(`   Ícone: ${achievement.icon || 'N/A'}`);
      console.log("");
    });
  }
}

await showAchievements();
