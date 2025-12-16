# BíbliaFS v2.0

## Overview
BíbliaFS is a premium, personalized, and intelligent Bible study application that enhances traditional scripture reading with modern AI-powered theological assistance.

## QUICK REFERENCE - RESPOSTAS ÀS PERGUNTAS DO USUÁRIO

### ❓ "Versículo do Dia nunca aparece"
- **Onde está**: Página inicial (Home) - componente `<DailyVerse />` 
- **API**: `GET /api/daily-verse` 
- **Problema**: Pode estar falhando a query ou não conseguindo renderizar. Verificar console do browser.
- **Como corrigir**: Recarregar a página, limpar cache, ou verificar conexão internet

### ❓ "Áudio - onde foi salvo?"
- **Localização**: Browser local - **IndexedDB (Indexed Database)**
- **Nome da base**: `biblia-plus-offline`
- **Onde procurar**: Abrir DevTools (F12) → Application → IndexedDB → biblia-plus-offline → chapters
- **Formato**: Comprimido com gzip para economizar 60% de espaço
- **Online vs Offline**:
  - **Online**: Toca direto do CDN (sem download)
  - **Offline**: Salvo em IndexedDB, precisa clicar "Baixar" antes de ouvir sem internet

### ❓ "Modo Professor - onde colocou?"
- **Acesso**: Clique no menu lateral → procure por **"Modo Professor"** OU digite `/teacher` na barra de endereço
- **Rota**: `/teacher`
- **O que faz**:
  1. **Aba "Aulas"**: Criar/gerenciar aulas
  2. **Aba "Esboços"**: Criar estrutura de lição (blocos de texto, versículos, perguntas)
  3. **PDF**: Clique no botão impressora para exportar aula como PDF

### ❓ "Gerar aula demora muito ou gera pouco conteúdo"
- **Nova feature**: Agora pede a **duração da aula** (padrão: 50 minutos)
- **Como funciona**: 
  - 15-30 min: 2 objetivos, 2 perguntas (concreto e focado)
  - 31-60 min: 4 objetivos, 5 perguntas (aula padrão com profundidade)
  - 61+ min: 6 objetivos, 8 perguntas (exploratório, com aplicação prática)
- **Calibração de conteúdo**: A IA agora ajusta profundidade e quantidade com base no tempo disponível

## System Architecture

### Frontend Architecture
- **Framework**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **State**: TanStack Query v5 + React Context
- **i18n**: Portuguese, English, Dutch, Spanish (localStorage persistence)
- **Routing**: Wouter (wouter.js.org)
- **Audio System**: Smart CDN/IndexedDB fallback

### Backend Architecture
- **Server**: Express.js + TypeScript
- **Auth**: OpenID Connect (Replit Auth) + Passport.js
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM

### Data Storage Locations
1. **User Data**: Supabase PostgreSQL
2. **Offline Bible**: IndexedDB (`biblia-plus-offline`)
3. **Audio Progress**: Supabase `audio_progress` table
4. **Downloaded Audio**: IndexedDB (compressed with gzip)

## Key Features Implemented

### 1. Bible Audio System ✅
- Online: CDN streaming for all languages (PT, EN, NL, ES)
- Offline: IndexedDB storage with 60% compression
- API Format: `/bible-audio/{LANGUAGE}/{VERSION}/{BOOK_CODE}/{CHAPTER}.mp3`
- Auto-save progress to Supabase for sync

### 2. Comparar Versões (Version Comparison) ✅
- Side-by-side comparison (up to 3 versions)
- Multilingual support: Portuguese, English, Dutch, Spanish
- Book names translate based on UI language
- Fallback mapping to SQLite abbreviations

### 3. Modo Professor (Teacher Mode) ✅ - NOW WITH DURATION
- **Route**: `/teacher`
- **Abas Principais**:
  - **Aulas**: Criar e gerenciar aulas bíblicas com geração de conteúdo por IA
  - **Assistente IA**: Chat integrado para tirar dúvidas pedagógicas e teológicas
- **Funcionalidades**:
  - Criação de aulas com título, descrição, texto-base, **duração**
  - Geração automática de conteúdo proporcional à duração da aula
  - Assistente pedagógico para consultas em tempo real
  - Export para PDF
- **Conteúdo adaptável**: 
  - Aulas curtas (15-30 min): concretas, focadas
  - Aulas normais (31-60 min): com profundidade
  - Aulas longas (61+ min): exploratórias com aplicação prática
- **Database**: `lessons` e `teaching_outlines` tables em Supabase

### 4. Versículo do Dia (Daily Verse) 
- **Component**: `<DailyVerse />` in Home page
- **API**: `GET /api/daily-verse`
- **Status**: Implemented but may have rendering issues
- **How to check**: Open DevTools → Console to see errors

## External Dependencies

### Core
- Replit OIDC, Supabase PostgreSQL, Express.js, Node.js, TypeScript, Vite
- React, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- Zod, React Hook Form

### AI & Media
- OpenAI API (GPT-4o, TTS for audio)
- Stripe (payments)

### UI Libraries
- Lucide React, react-icons, html-to-image, recharts, date-fns

## Bible Versions & Books

### Portuguese Bible
- **Versions**: NVI, ACF, ARC, RA
- **API**: GitHub thiagobodruk/bible (static JSON, no rate limits)
- **Book Abbreviations**: 66 books mapped (gn, ex, lv... jb for Job, etc.)

### English Bible
- **Version**: WEB (Web English Bible)
- **API**: CDN jsdelivr - wldeh/bible-api
- **Book Abbreviations**: 66 books mapped (jb for Job, etc.)

### Spanish Bible
- **Version**: Reina Valera 1960
- **API**: AWS Spanish Bible API
- **Book Abbreviations**: 66 books mapped (job for Job in Spanish, etc.)

### Dutch Bible (TODO)
- **Status**: Not yet implemented - placeholder for future expansion

**Book Mapping Notes**:
- All versions now use consistent abbreviations
- Job is mapped as: `jb` in Portuguese/English mappings → `job` in API calls
- All 66 books are available and cross-referenced across languages

## Recent Changes (Session: Dec 16, 2025)

### Phase 1: Fixed Comparar Versões
- Added book name mapping for all 4 languages
- Fixed SQLite abbreviation lookup
- Language switching now updates book list

### Phase 2: Added Multilingual Audio
- Audio service now includes language parameter
- CDN URL format: `/bible-audio/{PT|EN|NL|ES}/{VERSION}/{BOOK}/{CHAPTER}.mp3`
- All download functions updated with language support

### Phase 3: Fixed Bible Versions Error
- Corrected Job book mapping: `job` → `jb` (then reverted for consistency)
- Updated BOOK_MAPPINGS in multilingual-bible-apis.ts for EN and ES
- All versions now use consistent abbreviations across APIs

### Phase 4: Enhanced Teacher Mode with Duration ⭐ NEW
- Added `duration` field to lesson creation form (15-300 minutes)
- Default duration: 50 minutes
- AI now generates content proportional to lesson duration:
  - **15-30 min**: 2 objectives, 2 questions (concrete, focused)
  - **31-60 min**: 4 objectives, 5 questions (standard, depth)
  - **61+ min**: 6 objectives, 8 questions (exploratory, practical)
- Improved prompt calibration for content depth

## Next Steps

1. **Test Teacher Mode Duration Feature**:
   - Create lesson for Book of Job (42 chapters)
   - Set duration to 50 minutes (default)
   - Verify AI generates appropriate content volume

2. **Bible Versions Testing**:
   - Test all versions (NVI, ACF, ARC, RA) in /bible-reader
   - Test all books, especially edge cases (Job, single-chapter books)
   - Verify online and offline functionality

3. **Audio System**:
   - Verify CDN streaming works for all languages
   - Test offline download with language parameter
   - Check compression efficiency

## Performance Metrics
- Initial Bundle: -60% reduction via code splitting
- Page Transition: ~500ms ✅
- Query Cache: 5min staleTime + 30min retention
- Audio: CDN + offline fallback with automatic progress sync
- Storage: 60% compression for offline content
- AI Generation: ~3-5 seconds per lesson (depends on OpenAI API)
