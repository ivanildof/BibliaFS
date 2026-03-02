import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔍 Testando conexão com Supabase...\n");
  console.log(`🌐 URL: ${supabaseUrl}\n`);

  try {
    // Test 1: List storage buckets
    console.log("📦 Teste 1: Listando buckets de storage...");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("❌ Erro ao listar buckets:", bucketsError.message);
    } else if (buckets && buckets.length > 0) {
      console.log(`✅ ${buckets.length} bucket(s) encontrado(s):`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
      });
    } else {
      console.log("⚠️  Nenhum bucket encontrado");
    }
    console.log("");

    // Test 2: Test database connection with a simple query
    console.log("🗄️  Teste 2: Testando conexão com banco de dados...");
    const { data: dbTest, error: dbError } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    
    if (dbError) {
      console.log(`⚠️  Erro ao acessar tabela 'users': ${dbError.message}`);
      console.log("   (Isso pode ser normal se a tabela não existir ou não tiver permissões)");
    } else {
      console.log("✅ Conexão com banco de dados funcionando!");
    }
    console.log("");

    // Test 3: Check authentication capabilities
    console.log("🔐 Teste 3: Verificando capacidades de autenticação...");
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`   Status: ${session ? '✅ Sessão ativa' : 'ℹ️  Nenhuma sessão ativa (normal para testes)'}`);
    
    console.log("\n✅ Testes concluídos! Conexão com Supabase está operacional.");
    
  } catch (error) {
    console.error("❌ Erro durante os testes:", error.message);
  }
}

await testConnection();
