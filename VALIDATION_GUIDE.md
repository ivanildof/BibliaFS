# Guia Completo de Validação - Bíblia+ v2.0

## 📋 Visão Geral

Este guia apresenta uma estratégia completa para validar todo o aplicativo Bíblia+ em múltiplas camadas: dados, segurança, integridade e funcionalidade.

---

## 1. 🛡️ Validação de Dados (Frontend + Backend)

### 1.1 Schema Centralizado (`shared/schema.ts`)

**Estratégia**: Definir schemas Zod reutilizáveis que servem tanto para validação frontend quanto backend.

**Como funciona atualmente**:
```typescript
// Exemplo: Schema de orações
export const insertPrayerSchema = createInsertSchema(prayers).omit({
  id: true,
  userId: true,
  createdAt: true,
});
```

**Melhorias recomendadas**:
- ✅ Adicionar validações de domínio específicas
- ✅ Validar limites de caracteres
- ✅ Validar formatos específicos

**Exemplo de validação robusta**:
```typescript
export const insertPrayerSchema = createInsertSchema(prayers)
  .omit({ id: true, userId: true, createdAt: true })
  .extend({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(100),
    content: z.string().min(10, "Oração deve ter pelo menos 10 caracteres").max(5000),
    category: z.enum(["thanksgiving", "supplication", "intercession", "confession"]),
  });
```

### 1.2 Validação Frontend (Formulários)

**Localização**: Componentes de formulário usam `react-hook-form` + `zodResolver`

**Checklist de validação frontend**:
- ✅ Usar `zodResolver` em todos os formulários
- ✅ Mostrar mensagens de erro claras
- ✅ Validar antes de enviar ao backend
- ✅ Feedback visual de erros

**Exemplo**:
```typescript
const form = useForm<InsertPrayer>({
  resolver: zodResolver(insertPrayerSchema),
  defaultValues: { title: "", content: "", category: "supplication" }
});
```

### 1.3 Validação Backend (API Routes)

**Localização**: `server/routes.ts`

**Checklist de validação backend**:
- ✅ Re-validar SEMPRE no backend (nunca confiar no cliente)
- ✅ Usar `safeParse()` do Zod para validação segura
- ✅ Retornar erros HTTP apropriados (400 para dados inválidos)
- ✅ Validar ownership (userId)

**Exemplo de rota validada**:
```typescript
app.post("/api/prayers", isAuthenticated, async (req, res) => {
  // 1. Validar dados com Zod
  const result = insertPrayerSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ 
      error: "Dados inválidos", 
      details: result.error.errors 
    });
  }
  
  // 2. Adicionar userId do usuário autenticado
  const prayerData = {
    ...result.data,
    userId: req.user!.id
  };
  
  // 3. Criar no banco
  const prayer = await storage.createPrayer(prayerData);
  
  res.json(prayer);
});
```

---

## 2. 🔐 Validação de Segurança

### 2.1 Autenticação

**Middleware**: `isAuthenticated` em `server/index.ts`

**Checklist**:
- ✅ Todas as rotas protegidas usam `isAuthenticated`
- ✅ Session management com PostgreSQL
- ✅ Cookies httpOnly e secure

**Rotas que DEVEM ser protegidas**:
```typescript
// ✅ Correto
app.get("/api/prayers", isAuthenticated, async (req, res) => { ... });
app.post("/api/plans/:id/progress", isAuthenticated, async (req, res) => { ... });
app.delete("/api/highlights/:id", isAuthenticated, async (req, res) => { ... });
```

### 2.2 Autorização (Ownership)

**Estratégia**: Verificar se o usuário tem permissão para acessar/modificar o recurso

**Checklist**:
- ✅ Sempre verificar `userId` antes de modificar dados
- ✅ Usar queries com filtro `where: { id, userId }`
- ✅ Retornar 403 Forbidden se não for o dono

**Exemplo**:
```typescript
// ❌ INSEGURO - qualquer usuário pode deletar qualquer oração
app.delete("/api/prayers/:id", isAuthenticated, async (req, res) => {
  await storage.deletePrayer(parseInt(req.params.id));
  res.json({ success: true });
});

// ✅ SEGURO - só pode deletar suas próprias orações
app.delete("/api/prayers/:id", isAuthenticated, async (req, res) => {
  const prayerId = parseInt(req.params.id);
  const prayer = await storage.getPrayerById(prayerId);
  
  if (!prayer || prayer.userId !== req.user!.id) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  
  await storage.deletePrayer(prayerId);
  res.json({ success: true });
});
```

### 2.3 Proteção de Dados Sensíveis

**Checklist**:
- ✅ Nunca retornar senhas ou tokens
- ✅ Usar variáveis de ambiente para secrets
- ✅ Sanitizar inputs de usuário (especialmente em posts da comunidade)
- ✅ Validar webhooks do Stripe com assinatura

---

## 3. 💾 Validação de Integridade de Dados

### 3.1 Transações para Operações Múltiplas

**Quando usar**: Ao modificar múltiplas tabelas relacionadas

**Exemplos críticos**:
- Completar plano de leitura → atualizar progress + adicionar XP + desbloquear conquista
- Ler capítulo → marcar como lido + adicionar XP + verificar streak

**Implementação**:
```typescript
// Usar transação do Drizzle
await db.transaction(async (tx) => {
  // 1. Marcar progresso
  await tx.update(readingProgress).set({ completed: true });
  
  // 2. Adicionar XP
  await tx.update(users).set({ xp: sql`${users.xp} + 50` });
  
  // 3. Verificar conquistas
  const newAchievements = await checkAchievements(userId, tx);
});
```

### 3.2 Validação de Relacionamentos

**Checklist**:
- ✅ Verificar se recursos relacionados existem antes de criar
- ✅ Impedir órfãos (ex: progresso de plano sem plano existente)
- ✅ Cascata de deleções quando apropriado

**Exemplo**:
```typescript
// Antes de criar progresso, validar que o plano existe
app.post("/api/plans/:planId/start", isAuthenticated, async (req, res) => {
  const plan = await storage.getReadingPlanById(parseInt(req.params.planId));
  
  if (!plan) {
    return res.status(404).json({ error: "Plano não encontrado" });
  }
  
  // Agora pode criar o progresso
  const progress = await storage.startReadingPlan(req.user!.id, plan.id);
  res.json(progress);
});
```

### 3.3 Sincronização Offline

**Validação necessária**:
- ✅ Verificar conflitos de versão ao sincronizar
- ✅ Resolver conflitos (last-write-wins ou merge)
- ✅ Validar integridade do cache IndexedDB

---

## 4. 🧪 Estratégia de Testes

### 4.1 Testes Unitários (Schemas e Lógica)

**Ferramenta**: Vitest

**O que testar**:
```typescript
// Exemplo: Testar validação de schema
describe("Prayer Schema", () => {
  it("deve aceitar oração válida", () => {
    const valid = { title: "Oração", content: "Senhor, ajude...", category: "supplication" };
    expect(insertPrayerSchema.safeParse(valid).success).toBe(true);
  });
  
  it("deve rejeitar título muito curto", () => {
    const invalid = { title: "A", content: "Conteúdo válido", category: "supplication" };
    expect(insertPrayerSchema.safeParse(invalid).success).toBe(false);
  });
});
```

### 4.2 Testes de Integração (API)

**Ferramenta**: Supertest + banco de teste

**O que testar**:
```typescript
describe("POST /api/prayers", () => {
  it("deve criar oração com dados válidos", async () => {
    const response = await request(app)
      .post("/api/prayers")
      .send({ title: "Título", content: "Conteúdo...", category: "thanksgiving" })
      .set("Cookie", authCookie);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });
  
  it("deve rejeitar dados inválidos", async () => {
    const response = await request(app)
      .post("/api/prayers")
      .send({ title: "A" }); // título muito curto, sem content
    
    expect(response.status).toBe(400);
  });
});
```

### 4.3 Testes E2E (Fluxo Completo)

**Ferramenta**: Playwright ou Cypress

**Fluxos críticos para testar**:

1. **Plano de Leitura Completo**:
   - Login → Escolher plano → Iniciar → Ler capítulos → Completar → Verificar XP/conquistas

2. **Diário de Orações**:
   - Criar oração → Gravar áudio → Editar → Marcar como respondida → Deletar

3. **Modo Offline**:
   - Baixar capítulos → Desconectar internet → Ler offline → Reconectar → Sincronizar

4. **Doações**:
   - Preencher formulário → Processar pagamento Stripe → Receber confirmação → Ver no perfil

5. **Gamificação**:
   - Ler 7 dias seguidos → Verificar streak → Desbloquear conquista → Subir de nível

**Exemplo**:
```typescript
test("fluxo completo de plano de leitura", async ({ page }) => {
  // 1. Login
  await page.goto("/");
  await page.click("[data-testid='button-login']");
  
  // 2. Escolher plano
  await page.goto("/plans");
  await page.click("[data-testid='plan-7-days']");
  await page.click("[data-testid='button-start-plan']");
  
  // 3. Ler primeiro capítulo
  await page.click("[data-testid='link-first-chapter']");
  await page.waitForSelector("[data-testid='verse-1']");
  
  // 4. Marcar como lido
  await page.click("[data-testid='button-mark-complete']");
  
  // 5. Verificar XP aumentou
  await page.goto("/progress");
  const xp = await page.textContent("[data-testid='text-xp']");
  expect(parseInt(xp!)).toBeGreaterThan(0);
});
```

---

## 5. 🌐 Validação de APIs Externas

### 5.1 ABíbliaDigital API

**Checklist**:
- ✅ Validar resposta com Zod schema
- ✅ Fallback para cache offline se API falhar
- ✅ Retry logic para falhas temporárias
- ✅ Logging de erros

**Exemplo**:
```typescript
const bibleVerseSchema = z.object({
  book: z.object({ name: z.string() }),
  chapter: z.object({ number: z.number() }),
  verses: z.array(z.object({
    number: z.number(),
    text: z.string()
  }))
});

async function fetchChapter(book: string, chapter: number) {
  try {
    const response = await fetch(`https://www.abibliadigital.com.br/api/verses/nvi/${book}/${chapter}`);
    const data = await response.json();
    
    // Validar resposta
    const result = bibleVerseSchema.safeParse(data);
    
    if (!result.success) {
      console.error("Resposta da API inválida:", result.error);
      return loadFromOfflineCache(book, chapter); // fallback
    }
    
    return result.data;
  } catch (error) {
    console.error("Erro ao buscar capítulo:", error);
    return loadFromOfflineCache(book, chapter);
  }
}
```

### 5.2 Stripe (Doações)

**Checklist**:
- ✅ Validar webhook signature
- ✅ Verificar payment_intent status
- ✅ Atualizar banco apenas após confirmação
- ✅ Idempotência (não processar evento duplicado)

---

## 6. ✅ Checklist de Validação por Feature

### 📖 Planos de Leitura
- [ ] Schema validado (duração, schedule)
- [ ] Ownership verificado (só pode modificar seus planos)
- [ ] Transação ao completar (progress + XP + conquista)
- [ ] Teste E2E: criar → ler → completar

### 🙏 Diário de Orações
- [ ] Validação de tamanho (título, conteúdo)
- [ ] Categorias enum validadas
- [ ] Áudio base64 validado
- [ ] Ownership em edição/deleção
- [ ] Teste: criar → editar → marcar respondida → deletar

### 🎮 Gamificação
- [ ] XP sempre não-negativo
- [ ] Níveis calculados corretamente
- [ ] Streak UTC midnight logic validado
- [ ] Conquistas desbloqueadas apenas uma vez
- [ ] Teste: acumular XP → subir nível → desbloquear badge

### 📱 Modo Offline
- [ ] IndexedDB sync validado
- [ ] Conflitos de versão resolvidos
- [ ] Limite de armazenamento respeitado
- [ ] Teste: download → offline → sync

### 💰 Doações (Stripe)
- [ ] Webhook signature verificada
- [ ] Status transitions validadas
- [ ] Valores monetários validados (>= 1.00)
- [ ] Teste: formulário → pagamento → confirmação

### 👥 Comunidade
- [ ] Input sanitizado (XSS prevention)
- [ ] Like/unlike idempotente
- [ ] Referências bíblicas validadas
- [ ] Teste: criar post → curtir → descurtir

---

## 7. 🚀 Implementação Rápida

### Prioridade 1 (Crítico - Fazer Agora)
1. ✅ Adicionar validação de ownership em TODAS as rotas de edição/deleção
2. ✅ Re-validar dados no backend com `safeParse()`
3. ✅ Proteger webhooks do Stripe com signature
4. ✅ Adicionar tratamento de erro em APIs externas

### Prioridade 2 (Importante - Esta Semana)
1. ✅ Implementar transações para operações de gamificação
2. ✅ Adicionar testes unitários para schemas críticos
3. ✅ Validar sincronização offline
4. ✅ Adicionar rate limiting em endpoints sensíveis

### Prioridade 3 (Desejável - Próximo Sprint)
1. ✅ Testes E2E para fluxos principais
2. ✅ Monitoring e alertas de erro
3. ✅ Performance testing
4. ✅ Accessibility validation

---

## 8. 📊 Como Validar Tudo (Passo a Passo)

### Método 1: Validação Manual
1. **Frontend**: Testar cada formulário com dados inválidos
2. **Backend**: Usar Postman/Insomnia para testar APIs
3. **Segurança**: Tentar acessar recursos de outros usuários
4. **Fluxos**: Seguir user stories do início ao fim

### Método 2: Automação
1. **Setup**: Configurar Vitest + Playwright
2. **Escrever**: Criar testes para schemas + rotas + fluxos
3. **Executar**: `npm test` antes de cada deploy
4. **CI/CD**: Integrar testes no pipeline

### Método 3: Code Review
1. **Checklist**: Usar este guia como checklist
2. **Pair Review**: Revisar código com colega
3. **Security Audit**: Verificar endpoints protegidos
4. **Data Flow**: Rastrear dados do frontend ao banco

---

## 🎯 Resumo Executivo

| Camada | O que validar | Como validar | Status Atual |
|--------|---------------|--------------|--------------|
| **Frontend** | Formulários, inputs | Zod + react-hook-form | ✅ Parcial |
| **Backend** | Dados, ownership | safeParse() + middleware | ⚠️ Precisa melhorar |
| **Segurança** | Auth, autorização | isAuthenticated + userId check | ✅ Implementado |
| **Dados** | Integridade, relacionamentos | Transactions + foreign keys | ⚠️ Precisa transações |
| **APIs** | Respostas externas | Schema validation + fallback | ⚠️ Precisa schemas |
| **Testes** | Fluxos completos | Vitest + Playwright | ❌ Não implementado |

---

## 📝 Próximos Passos

1. **Imediato**: Auditar todas as rotas e adicionar validação de ownership
2. **Curto prazo**: Implementar testes unitários para schemas
3. **Médio prazo**: Adicionar testes E2E para fluxos críticos
4. **Longo prazo**: CI/CD com validação automática

---

**Documento criado em**: 20 de novembro de 2025  
**Versão do app**: Bíblia+ v2.0  
**Próxima revisão**: Após implementar Prioridade 1
