import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthUsers() {
  console.log("🔍 Verificando dados de autenticação...\n");
  console.log(`🔑 Usando: ${supabaseKey.includes('service_role') ? 'SERVICE ROLE KEY' : 'ANON KEY'}\n`);

  try {
    // Tentar listar usuários do Auth (requer service_role)
    console.log("👥 Tentando listar usuários do Auth...");
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log(`   ⚠️  Não foi possível acessar: ${authError.message}`);
      console.log("   💡 Isso é normal com ANON KEY (proteção de segurança)");
    } else if (users) {
      console.log(`   ✅ ${users.length} usuários encontrados:`);
      users.slice(0, 10).forEach((user, idx) => {
        console.log(`      ${idx + 1}. ${user.email || 'Sem email'}`);
        console.log(`         ID: ${user.id}`);
        console.log(`         Criado: ${new Date(user.created_at).toLocaleDateString('pt-BR')}`);
        console.log(`         Último login: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}`);
      });
      
      if (users.length > 10) {
        console.log(`      ... e mais ${users.length - 10} usuários`);
      }
    }
    console.log("");

    // Verificar dados públicos que podem estar acessíveis
    console.log("📊 Verificando dados públicos...");
    
    const tables = [
      'bible_translations',
      'bible_books', 
      'bible_verses',
      'reading_plans',
      'achievements'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`   ✅ ${table}: ${count || 0} registros`);
      } else {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

await checkAuthUsers();
