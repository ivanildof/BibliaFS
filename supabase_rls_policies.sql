-- Script de Segurança (RLS) para BíbliaFS (Versão Corrigida com Cast de Tipos)
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Habilitar RLS em todas as tabelas de dados pessoais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para a tabela 'users'
-- Cast explicativo: auth.uid() retorna UUID, a tabela usa VARCHAR (id)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid()::text);

-- 3. Políticas para tabelas com 'user_id' (Isolamento de dados)

-- Bookmarks
CREATE POLICY "User bookmarks access" ON bookmarks FOR ALL USING (user_id = auth.uid()::text);

-- Notes
CREATE POLICY "User notes access" ON notes FOR ALL USING (user_id = auth.uid()::text);

-- Highlights
CREATE POLICY "User highlights access" ON highlights FOR ALL USING (user_id = auth.uid()::text);

-- Prayers
CREATE POLICY "User prayers access" ON prayers FOR ALL USING (user_id = auth.uid()::text);

-- Reading Plans
CREATE POLICY "User reading plans access" ON reading_plans FOR ALL USING (user_id = auth.uid()::text);

-- User Achievements
CREATE POLICY "User achievements access" ON user_achievements FOR ALL USING (user_id = auth.uid()::text);

-- Bible Settings
CREATE POLICY "User bible settings access" ON bible_settings FOR ALL USING (user_id = auth.uid()::text);

-- Podcast Subscriptions
CREATE POLICY "User podcast subscriptions access" ON podcast_subscriptions FOR ALL USING (user_id = auth.uid()::text);

-- Offline Content
CREATE POLICY "User offline content access" ON offline_content FOR ALL USING (user_id = auth.uid()::text);

-- Group Members
CREATE POLICY "User group memberships access" ON group_members FOR ALL USING (user_id = auth.uid()::text);

-- 4. Políticas para Comunidade (Visibilidade Pública + Edição Privada)
-- Posts
CREATE POLICY "Everyone can view community posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can manage own posts" ON community_posts FOR ALL USING (user_id = auth.uid()::text);

-- Likes
CREATE POLICY "Everyone can view post likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON post_likes FOR ALL USING (user_id = auth.uid()::text);

-- Comments
CREATE POLICY "Everyone can view post comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON post_comments FOR ALL USING (user_id = auth.uid()::text);
