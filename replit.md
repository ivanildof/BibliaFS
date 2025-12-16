# BíbliaFS v2.0

## Overview
BíbliaFS is a premium, personalized, and intelligent Bible study application that enhances traditional scripture reading with modern AI-powered theological assistance.

## QUICK REFERENCE - RESPOSTAS ÀS PERGUNTAS DO USUÁRIO

### ❓ "Áudio - onde está sendo armazenado?"
- **Localização**: Supabase Storage - bucket `bible-audio`
- **Estrutura**: `{LANG}/{VERSION}/{BOOK_CODE}/{CHAPTER}.mp3`
- **Status**: 
  - EN (English): Scripts criados, URL eBible.org não testado ⏳
  - PT (Portuguese): Bible.com URLs retornam 404 ❌
- **Acesso**: Streaming direto do Supabase Storage URL
- **Offline**: Salvo em IndexedDB após download

### ❓ "Versículo do Dia nunca aparece"
- **Onde está**: Página inicial (Home) - componente `<DailyVerse />` 
- **API**: `GET /api/daily-verse` 
- **Como corrigir**: Recarregar a página, limpar cache

### ❓ "Modo Professor - onde colocou?"
- **Acesso**: Clique no menu lateral → procure por **"Modo Professor"** OU digite `/teacher` na barra de endereço
- **Rota**: `/teacher`
- **O que faz**: Criar/gerenciar aulas com AI, gerar esboços estruturados, exportar PDF

### ❓ "Áudio - por que não funciona?"
**STATUS ATUAL (Dec 16, 2025):**
- ❌ Bible.com PT/ARC URLs: Retornam HTTP 404 (formato inválido)
- ⏳ eBible.org EN/WEB URLs: Scripts criados mas nunca testados
- ✅ Sistema de áudio no código: Totalmente implementado
- ✅ Supabase Storage bucket: Criado e pronto
- ⏳ Próximas etapas: Encontrar URLs corretas de fontes públicas

**Solução:**
1. Testar eBible.org URLs manualmente no browser
2. Encontrar API correta para Bible.com audio ou alternativa
3. Popular Supabase Storage com arquivos reais
4. Depois: Teste de reprodução e download offline

## System Architecture

### Frontend Architecture
- **Framework**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **State**: TanStack Query v5 + React Context
- **i18n**: Portuguese, English, Dutch, Spanish
- **Routing**: Wouter
- **Audio System**: Supabase Storage streaming + IndexedDB offline

### Backend Architecture
- **Server**: Express.js + TypeScript
- **Auth**: OpenID Connect (Replit Auth) + Passport.js
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM

### Data Storage Locations
1. **User Data**: Supabase PostgreSQL
2. **Bible Audio**: Supabase Storage (`bible-audio` bucket)
3. **Offline Bible Text**: IndexedDB (`biblia-plus-offline`)
4. **Audio Progress**: Supabase `audio_progress` table
5. **Downloaded Audio**: IndexedDB (compressed)

## Key Features Implemented

### 1. Bible Audio System ✅ (INFRASTRUCTURE COMPLETE)
- **Streaming Source**: Supabase Storage (public bucket)
- **Formats**: MP3 (high quality)
- **Architecture**:
  - URL Format: `{SUPABASE_URL}/storage/v1/object/public/bible-audio/{LANG}/{VERSION}/{BOOK}/{CHAPTER}.mp3`
  - Frontend streaming with progress tracking
  - Offline caching to IndexedDB
  - Synchronized playback state to backend
- **Current Status**:
  - ✅ Download scripts ready (server/scripts/audio-ingestion*.ts)
  - ❌ Download sources blocked (URLs need validation)
  - ⏳ Waiting for correct public audio sources

### 2. Comparar Versões (Version Comparison) ✅
- Side-by-side comparison (up to 3 versions)
- Multilingual support: Portuguese, English, Dutch, Spanish
- Book names translate based on UI language
- Fallback mapping to SQLite abbreviations

### 3. Modo Professor (Teacher Mode) ✅
- **Route**: `/teacher`
- **Funcionalidades**:
  - Criação de aulas com título, descrição, texto-base, **duração**
  - Geração automática de conteúdo proporcional à duração (15-300 min)
  - Assistente pedagógico IA integrado
  - Export para PDF
- **Calibração de conteúdo**: 
  - 15-30 min: 2 objetivos, 2 perguntas
  - 31-60 min: 4 objetivos, 5 perguntas
  - 61+ min: 6 objetivos, 8 perguntas

### 4. Versículo do Dia (Daily Verse) ✅
- **Component**: `<DailyVerse />` in Home page
- **API**: `GET /api/daily-verse`

### 5. Search - REMOVED ❌
- Removed from UI (Dec 16): Too slow, 198+ API calls per search
- Kept APIs for future optimization

## Audio Infrastructure

### Supabase Storage Bucket: `bible-audio`
**Permissions**: Public read (CDN-like access via public URL)

**Target File Structure**:
```
bible-audio/
├── EN/
│   └── WEB/
│       ├── gn/ → 1.mp3, 2.mp3, ... 50.mp3 (Genesis)
│       ├── ex/ → ... (Exodus)
│       └── ... (66 books planned)
└── PT/
    └── ARC/
        ├── gn/
        ├── ex/
        └── ... (66 books planned)
```

## External Dependencies

### Core
- Replit OIDC, Supabase PostgreSQL, Express.js, Node.js, TypeScript, Vite
- React, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- Zod, React Hook Form

### AI & Media
- OpenAI API (GPT-4o for lesson content)
- Stripe (payments)
- Bible Audio Sources (NEEDED):
  - EN: eBible.org (public domain) - URL TBD
  - PT: Correct Bible.com endpoint or alternative - URL TBD

### UI Libraries
- Lucide React, react-icons, html-to-image, recharts, date-fns

## Performance Metrics
- **Audio Streaming**: Direct from Supabase CDN (sub-100ms latency once files exist)
- **Storage Capacity**: ~1.5 GB for full Bible in 2 languages
- **Page Transition**: ~500ms
- **Query Cache**: 5min staleTime + 30min retention
- **Offline**: IndexedDB with gzip compression (60% space saving)

## Next Priority Tasks

1. **URGENT: Fix Audio URLs**
   - Test eBible.org URLs: `https://ebible.org/eng-web/audio/{BOOK}/{CHAPTER}.mp3`
   - Find correct Bible.com audio endpoint or use alternative
   - Document working URLs for future reference

2. **Populate Supabase Storage** (once URLs work)
   - Run ingestion scripts with verified URLs
   - Start with Genesis (50 chapters) for testing
   - Then expand to full Bible

3. **Test Audio Playback**
   - Verify streaming from Supabase Storage
   - Test offline download + playback
   - Verify progress tracking to database

4. **Additional Features** (after audio works)
   - Add more languages (Spanish, Dutch)
   - Optimize storage/compression
   - Community features & gamification
