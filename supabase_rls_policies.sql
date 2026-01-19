-- Script de Segurança (RLS) para BíbliaFS
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
-- Permite que o usuário veja e edite apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());

-- 3. Políticas genéricas para tabelas com 'user_id'
-- Formato: Usuários podem Ver, Inserir, Atualizar e Deletar apenas seus próprios dados

-- Bookmarks
CREATE POLICY "User bookmarks access" ON bookmarks FOR ALL USING (user_id = auth.uid());

-- Notes
CREATE POLICY "User notes access" ON notes FOR ALL USING (user_id = auth.uid());

-- Highlights
CREATE POLICY "User highlights access" ON highlights FOR ALL USING (user_id = auth.uid());

-- Prayers
CREATE POLICY "User prayers access" ON prayers FOR ALL USING (user_id = auth.uid());

-- Reading Plans
CREATE POLICY "User reading plans access" ON reading_plans FOR ALL USING (user_id = auth.uid());

-- User Achievements
CREATE POLICY "User achievements access" ON user_achievements FOR ALL USING (user_id = auth.uid());

-- Bible Settings
CREATE POLICY "User bible settings access" ON bible_settings FOR ALL USING (user_id = auth.uid());

-- Podcast Subscriptions
CREATE POLICY "User podcast subscriptions access" ON podcast_subscriptions FOR ALL USING (user_id = auth.uid());

-- Offline Content
CREATE POLICY "User offline content access" ON offline_content FOR ALL USING (user_id = auth.uid());

-- Group Members (O usuário pode ver seus próprios registros de membro)
CREATE POLICY "User group memberships access" ON group_members FOR ALL USING (user_id = auth.uid());

-- 4. Políticas para Comunidade (Posts, Likes, Comentários)
-- Posts: Todos podem ver, mas só o dono pode editar/deletar
CREATE POLICY "Everyone can view community posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can manage own posts" ON community_posts FOR ALL USING (user_id = auth.uid());

-- Likes: Todos podem ver, mas só o dono pode dar/remover like
CREATE POLICY "Everyone can view post likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON post_likes FOR ALL USING (user_id = auth.uid());

-- Comments: Todos podem ver, mas só o dono pode editar/deletar
CREATE POLICY "Everyone can view post comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON post_comments FOR ALL USING (user_id = auth.uid());
