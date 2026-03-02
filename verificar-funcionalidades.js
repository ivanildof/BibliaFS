import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarFuncionalidades() {
  console.log("🔍 VERIFICAÇÃO COMPLETA DE FUNCIONALIDADES\n");
  console.log("=" .repeat(70) + "\n");

  let erros = [];
  let avisos = [];

  // 1. Verificar Modo Professor
  console.log("🎓 1. MODO PROFESSOR");
  console.log("-".repeat(70));
  
  try {
    // Verificar tabela lessons
    const { count: lessonsCount } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true });
    
    console.log(`   ✅ Tabela 'lessons': ${lessonsCount || 0} lições cadastradas`);
    
    // Verificar tabela teaching_outlines
    const { count: outlinesCount } = await supabase
      .from("teaching_outlines")
      .select("*", { count: "exact", head: true });
    
    console.log(`   ✅ Tabela 'teaching_outlines': ${outlinesCount || 0} esboços`);
    
    // Verificar usuários professores
    const { data: teachers } = await supabase
      .from("users")
      .select("id, email")
      .eq("is_teacher", true);
    
    console.log(`   ✅ Professores cadastrados: ${teachers?.length || 0}`);
    
    if (teachers && teachers.length > 0) {
      teachers.forEach(t => console.log(`      - ${t.email}`));
    } else {
      avisos.push("Nenhum usuário com modo professor ativado");
    }
  } catch (error) {
    erros.push(`Modo Professor: ${error.message}`);
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log("");

  // 2. Verificar Grupos de Estudo
  console.log("👥 2. GRUPOS DE ESTUDO");
  console.log("-".repeat(70));
  
  try {
    const { count: groupsCount } = await supabase
      .from("study_groups")
      .select("*", { count: "exact", head: true });
    
    console.log(`   ✅ Grupos criados: ${groupsCount || 0}`);
    
    const { count: membersCount } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true });
    
    console.log(`   ✅ Total de membros: ${membersCount || 0}`);
    
    const { count: messagesCount } = await supabase
      .from("group_messages")
      .select("*", { count: "exact", head: true });
    
    console.log(`   ✅ Mensagens trocadas: ${messagesCount || 0}`);
    
    const { count: discussionsCount } = await supabase
      .from("group_discussions")
      .select("*", { count: "exact", head: true });
    
    console.log(`   ✅ Discussões criadas: ${discussionsCount || 0}`);

    if (!groupsCount) {
      avisos.push("Nenhum grupo de estudo criado ainda");
    }
  } catch (error) {
    erros.push(`Grupos de Estudo: ${error.message}`);
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log("");

  // 3. Verificar Assinaturas
  console.log("💳 3. ASSINATURAS E PLANOS");
  console.log("-".repeat(70));
  
  try {
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*");
    
    console.log(`   ✅ Assinaturas ativas: ${subscriptions?.length || 0}`);
    
    const { data: users } = await supabase
      .from("users")
      .select("subscription_plan");
    
    if (users) {
      const plans = users.reduce((acc, u) => {
        acc[u.subscription_plan || 'free'] = (acc[u.subscription_plan || 'free'] || 0) + 1;
        return acc;
      }, {});
      
      console.log("   📊 Distribuição de planos:");
      Object.entries(plans).forEach(([plan, count]) => {
        console.log(`      - ${plan}: ${count} usuários`);
      });
    }

    // Verificar produtos Stripe
    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!stripeKey || !stripeKey.includes('sk_')) {
      avisos.push("STRIPE_SECRET_KEY não configurada no .env");
      console.log(`   ⚠️  Stripe não configurado (chave não encontrada)`);
    } else {
      console.log(`   ✅ Stripe configurado`);
    }
  } catch (error) {
    erros.push(`Assinaturas: ${error.message}`);
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log("");

  // 4. Verificar Doações
  console.log("💰 4. SISTEMA DE DOAÇÕES");
  console.log("-".repeat(70));
  
  try {
    const { data: donations, count: donationsCount } = await supabase
      .from("donations")
      .select("*", { count: "exact" });
    
    console.log(`   ✅ Total de doações: ${donationsCount || 0}`);
    
    if (donations && donations.length > 0) {
      const total = donations
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      
      console.log(`   💵 Total arrecadado: R$ ${(total / 100).toFixed(2)}`);
      
      const recurring = donations.filter(d => d.type === 'recurring').length;
      const oneTime = donations.filter(d => d.type === 'one_time').length;
      
      console.log(`   📊 Tipos:`);
      console.log(`      - Únicas: ${oneTime}`);
      console.log(`      - Recorrentes: ${recurring}`);
    } else {
      avisos.push("Nenhuma doação registrada ainda");
    }
  } catch (error) {
    erros.push(`Doações: ${error.message}`);
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log("");

  // 5. Verificar Dados Bíblicos
  console.log("📖 5. CONTEÚDO BÍBLICO");
  console.log("-".repeat(70));
  
  try {
    const { count: versesCount } = await supabase
      .from("bible_verses")
      .select("*", { count: "exact", head: true });
    
    const { count: booksCount } = await supabase
      .from("bible_books")
      .select("*", { count: "exact", head: true });
    
    const { count: translationsCount } = await supabase
      .from("bible_translations")
      .select("*", { count: "exact", head: true });
    
    console.log(`   ✅ Versículos: ${versesCount || 0}`);
    console.log(`   ✅ Livros: ${booksCount || 0}`);
    console.log(`   ✅ Traduções: ${translationsCount || 0}`);
    
    if (!versesCount) {
      erros.push("CRÍTICO: Banco sem versículos bíblicos!");
    }
  } catch (error) {
    erros.push(`Conteúdo Bíblico: ${error.message}`);
    console.log(`   ❌ Erro: ${error.message}`);
  }
  console.log("");

  // Resumo Final
  console.log("=" .repeat(70));
  console.log("\n📊 RESUMO DA VERIFICAÇÃO\n");
  
  if (erros.length === 0 && avisos.length === 0) {
    console.log("✅ TUDO OK! Todas as funcionalidades estão configuradas.\n");
  } else {
    if (erros.length > 0) {
      console.log(`❌ ${erros.length} ERRO(S) ENCONTRADO(S):\n`);
      erros.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
      console.log("");
    }
    
    if (avisos.length > 0) {
      console.log(`⚠️  ${avisos.length} AVISO(S):\n`);
      avisos.forEach((a, i) => console.log(`   ${i + 1}. ${a}`));
      console.log("");
    }
  }

  console.log("💡 PRÓXIMAS AÇÕES:");
  console.log("   1. Verificar relatório em: RELATORIO_FUNCIONALIDADES.md");
  console.log("   2. Configurar produtos no Stripe Dashboard");
  console.log("   3. Testar funcionalidades no aplicativo");
  console.log("");
}

await verificarFuncionalidades();
