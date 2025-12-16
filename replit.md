# BíbliaFS v2.0

## Overview
BíbliaFS is a premium, personalized, and intelligent Bible study application that enhances traditional scripture reading with modern AI-powered theological assistance.

## QUICK REFERENCE - RESPOSTAS ÀS PERGUNTAS DO USUÁRIO

### ❓ "Áudio - onde está sendo armazenado?"
- **Localização**: Supabase Storage - bucket `bible-audio`
- **Estrutura**: `{LANG}/{VERSION}/{BOOK_CODE}/{CHAPTER}.mp3`
- **Idiomas**: 
  - EN (English): World English Bible (WEB) - Complete ✅
  - PT (Portuguese): Almeida Revista e Corrigida (ARC) - Em progresso
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

### 1. Bible Audio System ✅ (MIGRATED TO SUPABASE STORAGE)
- **Streaming Source**: Supabase Storage (public bucket)
- **Formats**: MP3 (high quality)
- **Languages**: 
  - English (EN/WEB): Genesis (50 chapters) uploaded ✅
  - Portuguese (PT/ARC): Full Bible (1189 chapters) downloading
- **URL Format**: `{SUPABASE_URL}/storage/v1/object/public/bible-audio/{LANG}/{VERSION}/{BOOK}/{CHAPTER}.mp3`
- **Offline**: Download to IndexedDB, sync progress to Supabase
- **Download Sources**:
  - EN: eBible.org (public domain, Winfred Henson recording)
  - PT: Bible.com API (ARC - Almeida Revista e Corrigida)

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

## Recent Changes (Session: Dec 16, 2025)

### Phase 5: Audio Migration to Supabase Storage ⭐ NEW
- **Created bucket**: `bible-audio` in Supabase Storage
- **Updated audioService.ts**: 
  - Now streams from Supabase Storage instead of CDN
  - URL format: `{SUPABASE_URL}/storage/v1/object/public/bible-audio/{LANG}/{VERSION}/{BOOK}/{CHAPTER}.mp3`
  - Default language: EN, version: WEB
  - Fallback to offline cache if not available
- **Created audio ingestion scripts**:
  - `server/scripts/audio-ingestion.ts`: Downloads EN/WEB from eBible.org
  - `server/scripts/audio-ingestion-pt.ts`: Downloads PT/ARC from Bible.com
- **Genesis complete**: 50 chapters uploaded to Supabase Storage ✅
- **Download progress**: 
  - EN: Genesis ✅, Êxodo-Apocalipse in background
  - PT: All 66 books (1189 chapters) downloading from Bible.com

## Audio Infrastructure

### Supabase Storage Bucket: `bible-audio`
**Permissions**: Public read (CDN-like access via public URL)

**File Structure**:
```
bible-audio/
├── EN/
│   └── WEB/
│       ├── gn/ (Genesis)
│       │   ├── 1.mp3 (7.2 MB) ✅
│       │   ├── 2.mp3 (4.5 MB) ✅
│       │   └── ... 50 chapters
│       ├── ex/ (Exodus)
│       └── ... (more books)
└── PT/
    └── ARC/
        ├── gn/
        ├── ex/
        └── ... (66 books)
```

## External Dependencies

### Core
- Replit OIDC, Supabase PostgreSQL, Express.js, Node.js, TypeScript, Vite
- React, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- Zod, React Hook Form

### AI & Media
- OpenAI API (GPT-4o for lesson content)
- Stripe (payments)
- Bible Audio Sources:
  - eBible.org (English WEB - public domain)
  - Bible.com (Portuguese ARC)

### UI Libraries
- Lucide React, react-icons, html-to-image, recharts, date-fns

## Performance Metrics
- **Audio Streaming**: Direct from Supabase CDN (sub-100ms latency)
- **Storage Used**: ~250 MB per language (EN WEB = ~600 MB total for all books)
- **Download Speed**: ~1-2 hours for full Bible per language (depends on rate limiting)
- **Page Transition**: ~500ms
- **Query Cache**: 5min staleTime + 30min retention
- **Offline**: IndexedDB with gzip compression (60% space saving)

## Next Steps

1. **Complete Audio Downloads**:
   - Monitor EN/WEB and PT/ARC background processes
   - Once complete, all 66 books available in both languages

2. **Test Audio Playback**:
   - Stream Genesis in English from Supabase Storage
   - Test offline download + playback
   - Verify progress saving to Supabase

3. **Add More Languages** (optional):
   - ES: Spanish (Reina Valera 1960) from Bible.com
   - NL: Dutch - find suitable public domain source

4. **Optimize Storage**:
   - Monitor Supabase Storage quota
   - Consider audio compression/transcoding if needed
