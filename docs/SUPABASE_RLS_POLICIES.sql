-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- BíbliaFS v2.0
-- 
-- Execute este script no SQL Editor do Supabase para configurar
-- políticas de segurança que garantem isolamento de dados por usuário.
-- ============================================================================

-- Habilitar RLS em todas as tabelas que contêm dados de usuário
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_commentaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICA: USERS (Usuários)
-- Cada usuário só pode ver e editar seu próprio perfil
-- ============================================================================

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Administradores podem ver todos os usuários
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICA: NOTES (Notas)
-- ============================================================================

CREATE POLICY "Users can view own notes"
ON notes FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own notes"
ON notes FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notes"
ON notes FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own notes"
ON notes FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: HIGHLIGHTS (Destaques)
-- ============================================================================

CREATE POLICY "Users can view own highlights"
ON highlights FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own highlights"
ON highlights FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own highlights"
ON highlights FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: BOOKMARKS (Favoritos)
-- ============================================================================

CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own bookmarks"
ON bookmarks FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: PRAYERS (Orações)
-- ============================================================================

CREATE POLICY "Users can view own prayers"
ON prayers FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own prayers"
ON prayers FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own prayers"
ON prayers FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own prayers"
ON prayers FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: READING_PLANS (Planos de Leitura)
-- ============================================================================

CREATE POLICY "Users can view own reading plans"
ON reading_plans FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own reading plans"
ON reading_plans FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own reading plans"
ON reading_plans FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own reading plans"
ON reading_plans FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: OFFLINE_CONTENT (Conteúdo Offline)
-- ============================================================================

CREATE POLICY "Users can view own offline content"
ON offline_content FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own offline content"
ON offline_content FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own offline content"
ON offline_content FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: VERSE_COMMENTARIES (Comentários de Versículos)
-- ============================================================================

CREATE POLICY "Users can view own commentaries"
ON verse_commentaries FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own commentaries"
ON verse_commentaries FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: USER_ACHIEVEMENTS (Conquistas)
-- ============================================================================

CREATE POLICY "Users can view own achievements"
ON user_achievements FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can earn achievements"
ON user_achievements FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: DONATIONS (Doações)
-- ============================================================================

CREATE POLICY "Users can view own donations"
ON donations FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create donations"
ON donations FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Admins podem ver todas as doações
CREATE POLICY "Admins can view all donations"
ON donations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICA: COMMUNITY_POSTS (Posts da Comunidade)
-- Posts são públicos para leitura, mas só usuários autenticados podem criar
-- e só o autor pode editar/deletar
-- ============================================================================

CREATE POLICY "Anyone can view community posts"
ON community_posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON community_posts FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = user_id
);

CREATE POLICY "Users can update own posts"
ON community_posts FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own posts"
ON community_posts FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: COMMENTS (Comentários)
-- ============================================================================

CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: POST_LIKES (Curtidas)
-- ============================================================================

CREATE POLICY "Anyone can view likes"
ON post_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON post_likes FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can remove own likes"
ON post_likes FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: LESSONS (Aulas - Modo Professor)
-- ============================================================================

CREATE POLICY "Users can view own lessons"
ON lessons FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own lessons"
ON lessons FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own lessons"
ON lessons FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own lessons"
ON lessons FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: LESSON_PROGRESS (Progresso de Aulas)
-- ============================================================================

CREATE POLICY "Users can view own lesson progress"
ON lesson_progress FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can track lesson progress"
ON lesson_progress FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update lesson progress"
ON lesson_progress FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- POLÍTICA: PODCAST_SUBSCRIPTIONS (Inscrições em Podcasts)
-- ============================================================================

CREATE POLICY "Users can view own subscriptions"
ON podcast_subscriptions FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can subscribe to podcasts"
ON podcast_subscriptions FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can unsubscribe"
ON podcast_subscriptions FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- NOTA IMPORTANTE
-- ============================================================================
-- 
-- Este script configura RLS no Supabase. Como BíbliaFS usa Drizzle ORM
-- com conexão direta ao banco, as políticas RLS funcionam como uma
-- segunda camada de proteção.
--
-- A primeira camada é o filtro por userId implementado em server/storage.ts.
-- A segunda camada são estas políticas RLS do Supabase.
--
-- Para que as políticas funcionem corretamente com conexão direta (não via
-- Supabase client), você precisaria usar a extensão pgaudit ou configurar
-- o Postgres para usar RLS com roles específicas.
--
-- Recomendação: Mantenha AMBAS as proteções:
-- 1. Filtros userId no código (já implementado)
-- 2. RLS policies como backup (este script)
-- ============================================================================
