import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tabelasEsperadas = [
  'users',
  'bible_books',
  'bible_chapters',
  'bible_translations',
  'bible_verses',
  'bible_settings',
  'bookmarks',
  'notes',
  'highlights',
  'favorites',
  'reading_plans',
  'reading_progress',
  'reading_history',
  'user_achievements',
  'achievements',
  'achievement_definitions',
  'churches',
  'community_posts',
  'prayer_requests',
  'study_groups',
  'subscriptions',
  'notifications',
  'audio_cache',
  'additional_content'
];

async function verificarTabelas() {
  console.log("🔍 VERIFICANDO ESTRUTURA DO BANCO DE DADOS\n");
  console.log("=" .repeat(70) + "\n");

  const tabelasExistentes = [];
  const tabelasFaltando = [];

  console.log("Testando tabelas...\n");

  for (const tabela of tabelasEsperadas) {
    try {
      const { error } = await supabase
        .from(tabela)
        .select("*", { count: "exact", head: true });
      
      if (error) {
        if (error.message.includes("Could not find the table")) {
          console.log(`❌ ${tabela.padEnd(30)} - NÃO EXISTE`);
          tabelasFaltando.push(tabela);
        } else {
          console.log(`⚠️  ${tabela.padEnd(30)} - EXISTE (erro de permissão)`);
          tabelasExistentes.push(tabela);
        }
      } else {
        console.log(`✅ ${tabela.padEnd(30)} - EXISTE`);
        tabelasExistentes.push(tabela);
      }
    } catch (e) {
      console.log(`❌ ${tabela.padEnd(30)} - ERRO: ${e.message}`);
      tabelasFaltando.push(tabela);
    }
  }

  console.log("\n" + "=" .repeat(70) + "\n");
  console.log("📊 RESUMO:\n");
  console.log(`✅ Tabelas existentes: ${tabelasExistentes.length}`);
  console.log(`❌ Tabelas faltando: ${tabelasFaltando.length}\n`);

  if (tabelasFaltando.length > 0) {
    console.log("⚠️  AÇÃO NECESSÁRIA:");
    console.log("\nO banco de dados está incompleto. Para importar o schema:\n");
    console.log("1️⃣  Acesse o painel do Supabase:");
    console.log(`    ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}\n`);
    console.log("2️⃣  Vá em: SQL Editor\n");
    console.log("3️⃣  Execute o arquivo: supabase_complete_backup.sql\n");
    console.log("4️⃣  Execute este script novamente para verificar\n");
    
    console.log("\n💡 TABELAS FALTANDO:");
    tabelasFaltando.forEach(t => console.log(`    - ${t}`));
  } else {
    console.log("✅ Banco de dados completo e pronto para uso!");
  }

  console.log("\n" + "=" .repeat(70));

  // Salvar relatório
  const relatorio = {
    data_verificacao: new Date().toISOString(),
    url: supabaseUrl,
    tabelas_existentes: tabelasExistentes,
    tabelas_faltando: tabelasFaltando,
    total_esperadas: tabelasEsperadas.length,
    status: tabelasFaltando.length === 0 ? 'COMPLETO' : 'INCOMPLETO'
  };

  fs.writeFileSync(
    'supabase-status.json',
    JSON.stringify(relatorio, null, 2)
  );

  console.log("\n📄 Relatório salvo em: supabase-status.json\n");
}

await verificarTabelas();
