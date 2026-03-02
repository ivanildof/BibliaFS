import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleto() {
  console.log("🔥 TESTE COMPLETO DO SUPABASE\n");
  console.log("=" .repeat(60) + "\n");

  // Teste 1: Usuários
  console.log("👥 Teste 1: Tabela USERS");
  console.log("-".repeat(60));
  try {
    const { data, error, count } = await supabase
      .from("users")
      .select("*", { count: "exact" })
      .limit(5);
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      console.log(`✅ Total de usuários: ${count}`);
      if (data && data.length > 0) {
        console.log(`📄 Primeiros ${data.length} registros:`);
        data.forEach((user, idx) => {
          console.log(`   ${idx + 1}. ID: ${user.id} | Email: ${user.email || 'N/A'} | Username: ${user.username || 'N/A'}`);
        });
      } else {
        console.log("   Nenhum registro encontrado");
      }
    }
  } catch (e) {
    console.log(`❌ Exceção: ${e.message}`);
  }
  console.log("");

  // Teste 2: Versões da Bíblia
  console.log("📖 Teste 2: Tabela BIBLE_VERSIONS");
  console.log("-".repeat(60));
  try {
    const { data, error, count } = await supabase
      .from("bible_versions")
      .select("*", { count: "exact" });
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      console.log(`✅ Total de versões: ${count}`);
      if (data && data.length > 0) {
        data.forEach((version, idx) => {
          console.log(`   ${idx + 1}. ${version.abbreviation} - ${version.full_name || version.name || 'N/A'}`);
        });
      }
    }
  } catch (e) {
    console.log(`❌ Exceção: ${e.message}`);
  }
  console.log("");

  // Teste 3: Livros
  console.log("📚 Teste 3: Tabela BOOKS");
  console.log("-".repeat(60));
  try {
    const { data, error, count } = await supabase
      .from("books")
      .select("*", { count: "exact" })
      .limit(10);
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      console.log(`✅ Total de livros: ${count}`);
      if (data && data.length > 0) {
        console.log(`📄 Primeiros ${data.length} livros:`);
        data.forEach((book, idx) => {
          console.log(`   ${idx + 1}. ${book.name} (${book.abbreviation || 'N/A'})`);
        });
      }
    }
  } catch (e) {
    console.log(`❌ Exceção: ${e.message}`);
  }
  console.log("");

  // Teste 4: Versículos (sample)
  console.log("📝 Teste 4: Tabela VERSES (amostra)");
  console.log("-".repeat(60));
  try {
    const { data, error, count } = await supabase
      .from("verses")
      .select("*", { count: "exact" })
      .limit(3);
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      console.log(`✅ Total de versículos: ${count}`);
      if (data && data.length > 0) {
        console.log(`📄 Primeiros ${data.length} versículos:`);
        data.forEach((verse, idx) => {
          const text = verse.text || verse.content || 'N/A';
          const preview = text.length > 60 ? text.substring(0, 60) + '...' : text;
          console.log(`   ${idx + 1}. ${verse.book_id}:${verse.chapter}:${verse.verse} - "${preview}"`);
        });
      }
    }
  } catch (e) {
    console.log(`❌ Exceção: ${e.message}`);
  }
  console.log("");

  // Teste 5: Storage buckets
  console.log("🗂️  Teste 5: Storage Buckets");
  console.log("-".repeat(60));
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else if (buckets && buckets.length > 0) {
      console.log(`✅ ${buckets.length} bucket(s) encontrado(s):`);
      buckets.forEach((bucket, idx) => {
        console.log(`   ${idx + 1}. ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
      });
    } else {
      console.log("⚠️  Nenhum bucket encontrado ou sem permissões");
    }
  } catch (e) {
    console.log(`❌ Exceção: ${e.message}`);
  }
  console.log("");

  // Teste 6: Favoritos
  console.log("⭐ Teste 6: Tabela FAVORITES");
  console.log("-".repeat(60));
  try {
    const { data, error, count } = await supabase
      .from("favorites")
      .select("*", { count: "exact" })
      .limit(5);
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      console.log(`✅ Total de favoritos: ${count || 0}`);
      if (data && data.length > 0) {
        console.log(`📄 ${data.length} registro(s) encontrado(s)`);
      }
    }
  } catch (e) {
    console.log(`❌ Exceção: ${e.message}`);
  }
  console.log("");

  // Teste 7: Notas
  console.log("📓 Teste 7: Tabela NOTES");
  console.log("-".repeat(60));
  try {
    const { data, error, count } = await supabase
      .from("notes")
      .select("*", { count: "exact" })
      .limit(5);
    
    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      console.log(`✅ Total de notas: ${count || 0}`);
      if (data && data.length > 0) {
        console.log(`📄 ${data.length} registro(s) encontrado(s)`);
      }
    }
  } catch (e) {
    console.log(`❌ Exceção: ${e.message}`);
  }
  console.log("");

  console.log("=" .repeat(60));
  console.log("✅ TESTES CONCLUÍDOS!\n");
}

await testCompleto();
