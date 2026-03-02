import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarDados() {
  console.log("📊 TESTE DE DADOS - BIBLIAFS\n");
  console.log("=" .repeat(70) + "\n");

  // Teste 1: Traduções da Bíblia
  console.log("📖 TRADUÇÕES DA BÍBLIA");
  console.log("-".repeat(70));
  const { data: translations, error: transError } = await supabase
    .from("bible_translations")
    .select("*");
  
  if (transError) {
    console.log(`❌ Erro: ${transError.message}`);
  } else if (translations && translations.length > 0) {
    console.log(`✅ ${translations.length} tradução(ões) encontrada(s):`);
    translations.forEach((t, idx) => {
      console.log(`   ${idx + 1}. ${t.abbreviation} - ${t.name}`);
      console.log(`      Idioma: ${t.language || 'N/A'}`);
      console.log(`      Disponível: ${t.is_available ? 'Sim' : 'Não'}`);
    });
  } else {
    console.log("⚠️  Nenhuma tradução encontrada");
  }
  console.log("");

  // Teste 2: Livros da Bíblia
  console.log("📚 LIVROS DA BÍBLIA");
  console.log("-".repeat(70));
  const { data: books, error: booksError } = await supabase
    .from("bible_books")
    .select("*")
    .order("order_index", { ascending: true })
    .limit(10);
  
  if (booksError) {
    console.log(`❌ Erro: ${booksError.message}`);
  } else if (books && books.length > 0) {
    console.log(`✅ Primeiros 10 livros:`);
    books.forEach((b, idx) => {
      console.log(`   ${idx + 1}. ${b.name} (${b.abbreviation}) - ${b.chapter_count} capítulos`);
    });
  } else {
    console.log("⚠️  Nenhum livro encontrado");
  }
  console.log("");

  // Teste 3: Versículos (sample)
  console.log("📝 VERSÍCULOS (amostra)");
  console.log("-".repeat(70));
  const { data: verses, count: versesCount } = await supabase
    .from("bible_verses")
    .select("*", { count: "exact" })
    .limit(5);
  
  console.log(`📊 Total de versículos no banco: ${versesCount || 0}`);
  if (verses && verses.length > 0) {
    console.log(`\n📄 Amostra de 5 versículos:`);
    verses.forEach((v, idx) => {
      const text = v.verse_text.length > 80 ? v.verse_text.substring(0, 80) + '...' : v.verse_text;
      console.log(`   ${idx + 1}. Cap ${v.chapter_number}:${v.verse_number} - "${text}"`);
    });
  } else {
    console.log("⚠️  Nenhum versículo encontrado");
  }
  console.log("");

  // Teste 4: Usuários
  console.log("👥 USUÁRIOS");
  console.log("-".repeat(70));
  const { count: userCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  
  console.log(`👤 Total de usuários: ${userCount || 0}`);
  console.log("");

  // Teste 5: Planos de Leitura
  console.log("📅 PLANOS DE LEITURA");
  console.log("-".repeat(70));
  const { data: plans, count: plansCount } = await supabase
    .from("reading_plans")
    .select("*", { count: "exact" });
  
  console.log(`📋 Total de planos: ${plansCount || 0}`);
  if (plans && plans.length > 0) {
    plans.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name || p.title || 'Sem nome'}`);
      console.log(`      Duração: ${p.duration_days || 'N/A'} dias`);
    });
  }
  console.log("");

  // Teste 6: Conquistas
  console.log("🏆 CONQUISTAS");
  console.log("-".repeat(70));
  const { data: achievements, count: achCount } = await supabase
    .from("achievement_definitions")
    .select("*", { count: "exact" });
  
  console.log(`🎯 Total de conquistas disponíveis: ${achCount || 0}`);
  if (achievements && achievements.length > 0) {
    achievements.slice(0, 5).forEach((a, idx) => {
      console.log(`   ${idx + 1}. ${a.name}`);
      console.log(`      ${a.description}`);
    });
  }
  console.log("");

  // Teste 7: Comunidade
  console.log("💬 COMUNIDADE");
  console.log("-".repeat(70));
  const { count: postsCount } = await supabase
    .from("community_posts")
    .select("*", { count: "exact", head: true });
  
  console.log(`📝 Total de posts: ${postsCount || 0}`);
  console.log("");

  // Resumo final
  console.log("=" .repeat(70));
  console.log("\n✅ RESUMO GERAL:\n");
  console.log(`   📖 Traduções: ${translations?.length || 0}`);
  console.log(`   📚 Livros: ${books?.length || 0}+`);
  console.log(`   📝 Versículos: ${versesCount || 0}`);
  console.log(`   👤 Usuários: ${userCount || 0}`);
  console.log(`   📋 Planos: ${plansCount || 0}`);
  console.log(`   🏆 Conquistas: ${achCount || 0}`);
  console.log(`   💬 Posts: ${postsCount || 0}`);
  console.log("\n" + "=" .repeat(70) + "\n");

  // Diagnóstico
  const temDados = (versesCount || 0) > 0 && (books?.length || 0) > 0;
  
  if (temDados) {
    console.log("✅ STATUS: Banco de dados POPULADO e funcional!");
  } else {
    console.log("⚠️  STATUS: Banco de dados VAZIO");
    console.log("\n💡 PRÓXIMOS PASSOS:");
    console.log("   1. Importar dados bíblicos (livros, versículos)");
    console.log("   2. Configurar traduções disponíveis");
    console.log("   3. Popular planos de leitura");
    console.log("   4. Configurar conquistas");
  }
  console.log("");
}

await testarDados();
