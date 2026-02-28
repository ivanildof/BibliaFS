# Changelog - BíbliaFS

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.0.12] - 2026-02-28

### 🔧 Correções Críticas

#### Erros de Sintaxe (7 correções)
- **progress.tsx**: Removidas declarações duplicadas de `isError` e `error`
- **settings.tsx**: Removida chave extra `}` no final do arquivo
- **reading-plans.tsx**: Removida chave extra `}` no final do arquivo
- **teacher.tsx**: Consolidado import duplicado de `Share2` do lucide-react
- **profile.tsx**: Removida chave extra `}` no final do arquivo
- **version-compare.tsx**: Removido import duplicado de `ProtectedRoute`
- **version-compare.tsx**: Renomeada função para `VersionCompareContent` evitando duplicação

#### Loops Infinitos (4 correções)
- **ProtectedRoute.tsx**: Removido `setLocation` das dependências do useEffect
- **App.tsx (useEffect #1)**: Removido `setLocation` das dependências
- **App.tsx (useEffect #2)**: Removido `setLocation` das dependências
- **App.tsx (useEffect #2)**: Implementado `useRef` com `hasRedirectedRef` para prevenir redirects infinitos

### 🔐 Google OAuth

- Configuração completa do Google OAuth 2.0
- Client ID e Client Secret configurados
- Gmail SMTP configurado para envio de emails
- Redirect URI registrada no Google Cloud Console
- Documentação completa criada em `CONFIGURACAO_GOOGLE_OAUTH.md`

### 📱 Android

- **AndroidManifest.xml**:
  - Adicionado namespace `tools` para resolução de conflitos
  - `usesCleartextTraffic` alterado para `true` (desenvolvimento)
  - Adicionado `tools:replace="android:usesCleartextTraffic"`
  
- **capacitor.config.ts**:
  - Habilitado `cleartext: true` para aceitar HTTP local
  - Adicionado IP local (`192.169.0.104:5000`) na `allowNavigation`
  - `allowMixedContent` alterado para `true`

### 🛡️ Segurança e Autenticação

- Criado componente `ProtectedRoute.tsx` para proteção de rotas
- 24 páginas agora protegidas com autenticação obrigatória:
  - achievements, bible, community, contact, donate
  - favorites, groups, help, home, podcasts, prayers
  - pricing, profile, progress, reading-plans, security
  - settings, teacher, version-compare, email-verification
  - forgot-password, reset-password, auth-callback, offline

### 📦 Configuração do Projeto

- `.env` adicionado ao `.gitignore` por segurança
- `.env.example` criado com template de todas as variáveis necessárias
- Credenciais sensíveis removidas do controle de versão

### 🐛 Outras Correções

- Consolidadas importações React duplicadas em `App.tsx`
- Resolvidos conflitos de manifesto entre app principal e plugins Cordova
- Configuração para desenvolvimento com servidor local via IP da rede

### ⚠️ Breaking Changes

- Páginas agora requerem autenticação - usuários não autenticados serão redirecionados para `/login`
- Variável `VITE_APP_URL` agora usa IP local da rede para desenvolvimento Android

### 📚 Documentação

- Adicionado guia completo de configuração Google OAuth
- Atualizado `.env.example` com todas as variáveis necessárias
- Instruções detalhadas para desenvolvimento Android

---

## [1.0.11] - 2026-02-27

### Versão anterior
- Funcionalidades base do aplicativo
- Sistema de autenticação Supabase
- Interface de leitura bíblica
- Sistema de planos de leitura
- Comunidade e grupos

---

## Como usar este changelog

Este arquivo segue o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

### Categorias

- **🔧 Correções Críticas**: Bug fixes críticos para estabilidade
- **✨ Novos Recursos**: Novas funcionalidades
- **🔐 Segurança**: Mudanças relacionadas a segurança
- **📱 Android/iOS**: Mudanças específicas de plataforma
- **🛡️ Autenticação**: Mudanças no sistema de autenticação
- **📦 Configuração**: Mudanças em arquivos de configuração
- **🐛 Outras Correções**: Correções menores
- **⚠️ Breaking Changes**: Mudanças que quebram compatibilidade
- **📚 Documentação**: Melhorias na documentação
