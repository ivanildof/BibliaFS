const fs = require('fs');
const path = require('path');

const pagesDir = 'h:\\Arquivos\\Aplicativos\\Biblia Sagrada\\Aplicativo\\Bibliafs\\Bibliafs\\client\\src\\pages';

const largeFiles = [
  { file: 'groups.tsx', lines: 2959 },
  { file: 'bible-reader.tsx', lines: 2106 },
  { file: 'teacher.tsx', lines: 1432 },
  { file: 'settings.tsx', lines: 1119 },
  { file: 'podcasts.tsx', lines: 1058 }
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔬 ANÁLISE PROFUNDA DOS ARQUIVOS MAIORES');
console.log('═══════════════════════════════════════════════════════════════\n');

largeFiles.forEach(({ file, lines }) => {
  const filePath = path.join(pagesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`\n📄 ${file} (${lines} linhas):\n`);
  
  // 1. Contar componentes inline
  const inlineComponents = (content.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/g) || []).length;
  console.log(`   Componentes inline: ${inlineComponents}`);
  
  // 2. Contar useState
  const statesCount = (content.match(/useState</g) || []).length;
  console.log(`   Estados (useState): ${statesCount}`);
  
  // 3. Contar useEffect
  const effectsCount = (content.match(/useEffect\(/g) || []).length;
  console.log(`   Effects (useEffect): ${effectsCount}`);
  
  // 4. Contar queries
  const queriesCount = (content.match(/useQuery\(/g) || []).length;
  const mutationsCount = (content.match(/useMutation\(/g) || []).length;
  console.log(`   Queries: ${queriesCount}, Mutations: ${mutationsCount}`);
  
  // 5. Verificar duplicação de código
  const functionBodies = content.match(/\{[^}]{50,}\}/g) || [];
  const uniqueFunctions = new Set(functionBodies);
  const duplicationRate = ((1 - (uniqueFunctions.size / functionBodies.length)) * 100).toFixed(1);
  console.log(`   Taxa de duplicação: ${duplicationRate}%`);
  
  // 6. Verificar complexidade ciclomática (aproximação)
  const ifStatements = (content.match(/\bif\s*\(/g) || []).length;
  const switchStatements = (content.match(/\bswitch\s*\(/g) || []).length;
  const ternaries = (content.match(/\?.*:/g) || []).length;
  const complexity = ifStatements + switchStatements + ternaries;
  console.log(`   Complexidade aproximada: ${complexity} pontos`);
  
  // 7. Tamanho médio de função
  const functionDeclarations = content.match(/(?:function|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)\s*\{[\s\S]*?\n\}/g) || [];
  const avgFunctionSize = functionDeclarations.length > 0 
    ? Math.round(functionDeclarations.reduce((acc, fn) => acc + fn.split('\n').length, 0) / functionDeclarations.length)
    : 0;
  console.log(`   Tamanho médio de função: ${avgFunctionSize} linhas`);
  
  // 8. Verificar imports
  const imports = (content.match(/^import .*/gm) || []).length;
  console.log(`   Imports: ${imports}`);
  
  // 9. Verificar comentários
  const comments = (content.match(/\/\/.*/g) || []).length + (content.match(/\/\*[\s\S]*?\*\//g) || []).length;
  console.log(`   Comentários: ${comments}`);
  
  // 10. Detectar code smells
  const codeSmells = [];
  
  if (statesCount > 15) codeSmells.push('Muitos estados - considerar Context ou Zustand');
  if (effectsCount > 10) codeSmells.push('Muitos useEffects - refatorar lógica');
  if (inlineComponents > 5) codeSmells.push('Muitos componentes inline - extrair arquivos separados');
  if (avgFunctionSize > 50) codeSmells.push('Funções muito grandes - dividir responsabilidades');
  if (complexity > 100) codeSmells.push('Complexidade alta - simplificar lógica');
  if (imports > 40) codeSmells.push('Muitos imports - arquivo fazendo demais');
  if (parseFloat(duplicationRate) > 30) codeSmells.push('Alta duplicação - extrair funções comuns');
  
  if (codeSmells.length > 0) {
    console.log('\n   ⚠️  Code Smells Detectados:');
    codeSmells.forEach(smell => console.log(`      • ${smell}`));
  }
  
  // 11. Sugestões de refatoração
  console.log('\n   💡 Sugestões de Refatoração:');
  
  if (statesCount > 10) {
    console.log('      • Mover estados para Context/Zustand');
  }
  if (inlineComponents > 3) {
    console.log('      • Extrair componentes para arquivos separados');
  }
  if (effectsCount > 8) {
    console.log('      • Consolidar useEffects relacionados');
  }
  if (lines > 1000) {
    console.log(`      • Dividir em ${Math.ceil(lines / 500)} arquivos menores`);
  }
  if (queriesCount + mutationsCount > 10) {
    console.log('      • Criar custom hook para data fetching');
  }
});

console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('📊 ANÁLISE DE PADRÕES GERAIS');
console.log('═══════════════════════════════════════════════════════════════\n');

// Análise cross-file
const allFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));
const allContents = allFiles.map(f => {
  const content = fs.readFileSync(path.join(pagesDir, f), 'utf8');
  return { file: f, content };
});

// Detectar imports duplicados (oportunidade de criar utils)
const importCounts = {};
allContents.forEach(({ content }) => {
  const imports = content.match(/from ['"](@\/[^'"]+)['"]/g) || [];
  imports.forEach(imp => {
    const path = imp.match(/from ['"]([^'"]+)['"]/)[1];
    importCounts[path] = (importCounts[path] || 0) + 1;
  });
});

console.log('📦 Imports Mais Utilizados (oportunidades de abstração):\n');
Object.entries(importCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([path, count]) => {
    console.log(`   ${count}x - ${path}`);
  });

// Detectar código duplicado comum
const commonPatterns = {
  'toast({ title:': 'Toast notifications',
  'useQuery(': 'Data fetching',
  'useMutation(': 'Data mutations',
  'useAuth()': 'Autenticação',
  'useToast()': 'Notificações',
  'useState<': 'State management',
  'useEffect(': 'Side effects',
  'try {': 'Error handling',
  'isLoading': 'Loading states',
  'isError': 'Error states'
};

console.log('\n\n🔍 Padrões Comuns no Código:\n');
Object.entries(commonPatterns).forEach(([pattern, description]) => {
  const count = allContents.reduce((acc, { content }) => {
    return acc + (content.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  }, 0);
  console.log(`   ${count.toString().padStart(4)}x - ${description}`);
});

console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('✅ RECOMENDAÇÕES FINAIS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. Criar arquivo /hooks/useGroupData.ts para groups.tsx');
console.log('2. Criar arquivo /hooks/useBibleReader.ts para bible-reader.tsx');
console.log('3. Criar arquivo /hooks/useTeacherData.ts para teacher.tsx');
console.log('4. Extrair componentes:');
console.log('   - GroupCard, GroupChat, GroupMembers de groups.tsx');
console.log('   - BibleToolbar, VerseCard, ChapterNavigation de bible-reader.tsx');
console.log('   - LessonForm, LessonCard, StudentList de teacher.tsx');
console.log('5. Criar Context para estados globais repetidos');
console.log('6. Consolidar error handling em utility function');
console.log('7. Criar abstração para toast notifications');
console.log('8. Implementar lazy loading para componentes grandes');
console.log('9. Adicionar React.memo em componentes que re-renderizam muito');
console.log('10. Considerar code splitting por rota');

console.log('\n═══════════════════════════════════════════════════════════════\n');
