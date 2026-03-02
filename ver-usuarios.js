import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verUsuarios() {
  console.log("👥 DETALHES DOS USUÁRIOS\n");
  console.log("=" .repeat(70) + "\n");

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error(`❌ Erro: ${error.message}`);
    return;
  }

  if (!users || users.length === 0) {
    console.log("⚠️  Nenhum usuário encontrado");
    return;
  }

  console.log(`✅ Total: ${users.length} usuários cadastrados\n`);
  console.log("-".repeat(70));

  users.forEach((user, idx) => {
    console.log(`\n${idx + 1}. ID: ${user.id}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Username: ${user.username || 'N/A'}`);
    console.log(`   Nome: ${user.display_name || user.name || 'N/A'}`);
    console.log(`   Tipo: ${user.account_type || user.subscription_tier || 'free'}`);
    console.log(`   Criado: ${user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}`);
    console.log(`   Ativo: ${user.is_active !== false ? 'Sim' : 'Não'}`);
  });

  console.log("\n" + "=" .repeat(70));
  
  // Estatísticas
  const comEmail = users.filter(u => u.email).length;
  const premium = users.filter(u => u.subscription_tier === 'premium' || u.account_type === 'premium').length;
  const ativos = users.filter(u => u.is_active !== false).length;

  console.log("\n📊 ESTATÍSTICAS:\n");
  console.log(`   Total: ${users.length}`);
  console.log(`   Com email: ${comEmail}`);
  console.log(`   Premium: ${premium}`);
  console.log(`   Ativos: ${ativos}`);
  console.log("");
}

await verUsuarios();
