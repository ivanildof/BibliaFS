const fs = require('fs');
const path = require('path');

const pagesDir = 'h:\\Arquivos\\Aplicativos\\Biblia Sagrada\\Aplicativo\\Bibliafs\\Bibliafs\\client\\src\\pages';

const pages = [
  'about.tsx', 'achievements.tsx', 'auth-callback.tsx', 'bible-reader.tsx',
  'bible.tsx', 'community.tsx', 'contact.tsx', 'donate.tsx',
  'email-verification.tsx', 'favorites.tsx', 'forgot-password.tsx', 'groups.tsx',
  'help.tsx', 'home.tsx', 'landing.tsx', 'login.tsx',
  'not-found.tsx', 'offline.tsx', 'podcasts.tsx', 'prayers.tsx',
  'pricing.tsx', 'privacy.tsx', 'profile.tsx', 'progress.tsx',
  'reading-plans.tsx', 'register.tsx', 'reset-password.tsx', 'security.tsx',
  'settings.tsx', 'teacher.tsx', 'terms.tsx', 'version-compare.tsx'
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 ANÁLISE COMPLETA DE TODAS AS PÁGINAS');
console.log('═══════════════════════════════════════════════════════════════\n');

const issues = [];
const pageSummary = [];

pages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  
  if (!fs.existsSync(filePath)) {
    issues.push({ page, type: 'MISSING', message: 'Arquivo não encontrado' });
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  
  const pageIssues = [];
  const pageName = page.replace('.tsx', '');
  
  // Análise 1: UseEffect sem dependências
  const useEffectMatches = content.match(/useEffect\([^)]+\),\s*\[\]/g);
  if (useEffectMatches && useEffectMatches.length > 3) {
    pageIssues.push('Muitos useEffect com deps vazias (possível bug)');
  }
  
  // Análise 2: Console.log esquecido
  const consoleLogs = (content.match(/console\.(log|error|warn)/g) || []).length;
  if (consoleLogs > 5) {
    pageIssues.push(`${consoleLogs} console.logs (limpar para produção)`);
  }
  
  // Análise 3: Imports não usados
  const unusedImports = content.match(/import\s+{\s*[^}]*}\s+from\s+['"][^'"]+['"]\s*$/gm);
  
  // Análise 4: Estados não usados
  const stateDeclarations = content.match(/const\s+\[\w+,\s*set\w+\]\s*=\s*useState/g) || [];
  
  // Análise 5: Funções assíncronas sem try-catch
  const asyncWithoutTryCatch = content.match(/async\s+\([^)]*\)\s*=>\s*{[^}]*await[^}]*}/g) || [];
  const hasTryCatch = content.includes('try {');
  if (asyncWithoutTryCatch.length > 0 && !hasTryCatch) {
    pageIssues.push('Funções async sem tratamento de erro');
  }
  
  // Análise 6: Hardcoded strings (i18n)
  const hardcodedStrings = (content.match(/[>"']\s*[A-ZÀ-Ú][a-zà-ú]{3,}/g) || []).length;
  
  // Análise 7: useQuery/useMutation sem error handling
  const queries = (content.match(/useQuery|useMutation/g) || []).length;
  const errorHandling = (content.match(/isError|error\?/g) || []).length;
  if (queries > 0 && errorHandling === 0) {
    pageIssues.push('Queries sem tratamento de erro');
  }
  
  // Análise 8: Proteção de autenticação
  const hasAuthCheck = content.includes('useAuth') || content.includes('user');
  const isPublicPage = ['landing', 'login', 'register', 'about', 'terms', 'privacy', 'contact'].includes(pageName);
  if (!hasAuthCheck && !isPublicPage) {
    pageIssues.push('⚠️ Sem verificação de autenticação');
  }
  
  // Análise 9: Componentes muito grandes
  if (lines > 500) {
    pageIssues.push(`⚠️ Arquivo grande (${lines} linhas) - considerar split`);
  }
  
  // Análise 10: Performance - re-renders desnecessários
  const inlineCallbacks = (content.match(/onClick=\{[^}]*=>/g) || []).length;
  if (inlineCallbacks > 10) {
    pageIssues.push('Muitas funções inline (performance)');
  }
  
  pageSummary.push({
    page: pageName,
    lines,
    issues: pageIssues,
    hasAuth: hasAuthCheck,
    queries,
    states: stateDeclarations.length,
    consoleLogs
  });
});

// Agrupar por categoria
const criticalIssues = pageSummary.filter(p => 
  p.issues.some(i => i.includes('⚠️'))
);

const performanceIssues = pageSummary.filter(p => 
  p.issues.some(i => i.includes('performance') || i.includes('grande'))
);

const codeQualityIssues = pageSummary.filter(p => 
  p.consoleLogs > 5 || p.issues.some(i => i.includes('console'))
);

const errorHandlingIssues = pageSummary.filter(p => 
  p.issues.some(i => i.includes('erro') || i.includes('error'))
);

// Relatório
console.log('📊 ESTATÍSTICAS GERAIS:\n');
console.log(`   Total de páginas: ${pages.length}`);
console.log(`   Páginas com problemas: ${pageSummary.filter(p => p.issues.length > 0).length}`);
console.log(`   Linhas totais: ${pageSummary.reduce((acc, p) => acc + p.lines, 0).toLocaleString()}`);

if (criticalIssues.length > 0) {
  console.log('\n\n🚨 PROBLEMAS CRÍTICOS:\n');
  criticalIssues.forEach(p => {
    console.log(`   ${p.page}.tsx:`);
    p.issues.forEach(i => console.log(`      • ${i}`));
  });
}

if (errorHandlingIssues.length > 0) {
  console.log('\n\n⚠️  TRATAMENTO DE ERROS:\n');
  errorHandlingIssues.forEach(p => {
    console.log(`   ${p.page}.tsx:`);
    p.issues.filter(i => i.includes('erro') || i.includes('error')).forEach(i => 
      console.log(`      • ${i}`)
    );
  });
}

if (performanceIssues.length > 0) {
  console.log('\n\n⚡ PERFORMANCE:\n');
  performanceIssues.forEach(p => {
    console.log(`   ${p.page}.tsx (${p.lines} linhas):`);
    p.issues.filter(i => i.includes('performance') || i.includes('grande')).forEach(i => 
      console.log(`      • ${i}`)
    );
  });
}

if (codeQualityIssues.length > 0) {
  console.log('\n\n🧹 LIMPEZA DE CÓDIGO:\n');
  codeQualityIssues.forEach(p => {
    console.log(`   ${p.page}.tsx: ${p.consoleLogs} console.logs`);
  });
}

// Top 10 maiores arquivos
console.log('\n\n📏 TOP 10 MAIORES ARQUIVOS:\n');
pageSummary
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 10)
  .forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.page}.tsx - ${p.lines} linhas (${p.states} states, ${p.queries} queries)`);
  });

// Páginas sem problemas
const cleanPages = pageSummary.filter(p => p.issues.length === 0 && p.consoleLogs < 3);
console.log('\n\n✅ PÁGINAS OTIMIZADAS (' + cleanPages.length + '):\n');
cleanPages.slice(0, 10).forEach(p => {
  console.log(`   • ${p.page}.tsx`);
});

// Resumo de ações
console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('📋 AÇÕES RECOMENDADAS:');
console.log('═══════════════════════════════════════════════════════════════\n');

if (criticalIssues.length > 0) {
  console.log(`1. ⚠️  Adicionar autenticação em ${criticalIssues.length} páginas`);
}
if (errorHandlingIssues.length > 0) {
  console.log(`2. 🛡️  Adicionar tratamento de erros em ${errorHandlingIssues.length} páginas`);
}
if (performanceIssues.length > 0) {
  console.log(`3. ⚡ Otimizar ${performanceIssues.length} páginas grandes`);
}
if (codeQualityIssues.length > 0) {
  console.log(`4. 🧹 Remover console.logs de ${codeQualityIssues.length} páginas`);
}

console.log('\n═══════════════════════════════════════════════════════════════\n');
