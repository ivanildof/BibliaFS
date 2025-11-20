# Bíblia+ v2.0

## Overview

Bíblia+ is a premium, personalized, and intelligent Bible study application that combines traditional scripture reading with modern AI-powered theological assistance. The platform features customizable themes, integrated podcasts, teacher mode for educational purposes, community sharing, and comprehensive reading plans with gamification elements.

**Core Value Proposition**: Transform Bible study through AI theological assistance, personalized learning paths, multimedia integration, and community engagement.

**Primary Features**:
- AI-powered theological study assistant
- Customizable color themes (5 presets + custom RGB)
- Integrated podcast player with subscriptions
- Teacher mode for creating and managing lessons
- Community platform for sharing insights
- Reading plans with progress tracking
- Prayer journal with audio recording
- Gamification system (levels, XP, streaks, achievements)

## Recent Changes (November 2025)

**FASE 1 COMPLETA** - Leitor de Bíblia com integração API ABíbliaDigital implementado:

✅ **Funcionalidades Implementadas:**
- Integração completa com ABíbliaDigital API (NVI, ACF, ARC, RA)
- Navegação por livros, capítulos e versículos
- Sistema de bookmarks/favoritos
- Configurações de leitura personalizadas
- Busca de versículos
- **Fallback offline**: Lista completa de 66 livros + Gênesis 1 (31 versículos) + Salmo 23 (6 versículos)

✅ **Correções de Segurança e Resiliência:**
- Validação userId em todos os DELETE endpoints (previne cross-user data tampering)
- Validação robusta de API externa em TODOS os endpoints
- Schema validation com Zod antes de inserir no banco
- Error handling com toast + retry + fallback UI
- Backend valida estrutura de dados (verses array) antes de retornar

**FASE 2 COMPLETA** - Sistema de Planos de Leitura e Gamificação implementado:

✅ **Funcionalidades Implementadas:**
- **Planos de Leitura Predefinidos**: 6 templates (7, 14, 21, 30, 90, 365 dias) com cronogramas automáticos
- **Sistema de Gamificação**:
  - Sistema de XP (10 XP por capítulo lido)
  - Níveis progressivos (100 XP por nível)
  - Streak diário com lógica UTC midnight (previne inflação)
  - 18 conquistas automáticas (categorias: milestone, reading, streak)
- **Dashboard de Progresso** (`/progress`):
  - Visualização de nível atual e XP
  - Contador de streak com ícone de fogo
  - Grid de conquistas organizadas por categoria
  - Progresso visual com barras de progresso
- **Página de Planos** (`/plans`):
  - Templates predefinidos com descrição e duração
  - Criação de planos a partir de templates
  - Visualização de progresso diário
  - Marcar dias como completos com recompensa de XP
- **Integração com Leitor de Bíblia**:
  - Botão "Marcar como Lido" no leitor
  - Notificação de XP ganho e conquistas desbloqueadas
  - Guard contra leituras duplicadas no mesmo dia

✅ **Correções Críticas de Lógica:**
- **Streak Calculation**: UTC midnight normalization em ambas rotas (mark-read, complete-day)
- **Duplicate Guard**: Rejeita leituras duplicadas no mesmo dia sem inflação de XP/streak
- **Achievement Logic**: Verifica conquistas já desbloqueadas antes de desbloquear novamente
- **Consecutive Day Detection**: Streak incrementa APENAS se daysSinceLastRead === 1

✅ **Arquivos Criados/Modificados:**
- `shared/schema.ts` - Tabelas reading_plan_templates, achievements, user_achievements
- `server/storage.ts` - CRUD para planos, templates, conquistas, stats
- `server/seed-reading-plans.ts` - Seed data com 6 planos predefinidos
- `server/seed-achievements.ts` - Seed data com 18 conquistas
- `server/routes.ts` - Rotas para templates, planos, conquistas, stats, mark-read
- `client/src/pages/reading-plans.tsx` - UI de planos com templates e progresso
- `client/src/pages/progress.tsx` - Dashboard de gamificação
- `client/src/pages/bible-reader.tsx` - Botão "Marcar como Lido" integrado

**Sistema de Internacionalização (i18n) COMPLETO**:

✅ **Funcionalidades Implementadas:**
- **Suporte Multi-idioma**: 4 idiomas completos (Português nativo, Inglês, Holandês, Espanhol)
- **Sistema i18n**:
  - Context API (LanguageContext) para gerenciamento de idioma
  - Arquivo central de traduções (`client/src/lib/i18n.ts`)
  - Persistência do idioma selecionado com localStorage
  - Componente LanguageSelector com dropdown no header
- **Traduções Completas**:
  - Navegação e menus
  - Páginas (Planos, Progresso, Bíblia, etc.)
  - Mensagens de estado (loading, error)
  - Labels e botões da interface
- **Integração**:
  - AppSidebar traduzido dinamicamente
  - App.tsx com mensagens de loading traduzidas
  - Mudança de idioma em tempo real sem reload

✅ **Arquivos Criados/Modificados:**
- `client/src/lib/i18n.ts` - Arquivo central de traduções para 4 idiomas
- `client/src/contexts/LanguageContext.tsx` - Context API para gerenciamento de idioma
- `client/src/components/LanguageSelector.tsx` - Seletor de idioma com dropdown
- `client/src/App.tsx` - Integração do LanguageProvider e traduções
- `client/src/components/app-sidebar.tsx` - Sidebar totalmente traduzida

**Limitações Conhecidas (FASE 1):**
- Leitura de capítulos requer internet (exceto Gênesis 1 e Salmo 23 em cache)
- Expansão de cache offline pode ser implementada em fases futuras
- API ABíbliaDigital ocasionalmente indisponível (código trata graciosamente)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**:
- **Design System**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Typography**: Multi-font system (Playfair Display for headings, Inter for UI, Crimson Text for Bible reading)
- **Theme Strategy**: CSS variables with light/dark mode support, plus 5 predefined color schemes (Clássico, Noite Sagrada, Luz do Dia, Terra Santa, Custom RGB)
- **Responsive Design**: Mobile-first approach with sidebar navigation on desktop, bottom tab bar on mobile

**State Management**:
- **Server State**: TanStack Query (React Query) for all API data fetching and caching
- **Client State**: React Context for theme management and language selection (i18n)
- **Form Handling**: React Hook Form with Zod validation

**Internationalization (i18n)**:
- **Framework**: Custom Context API implementation
- **Supported Languages**: Portuguese (native), English, Dutch, Spanish
- **Translation Storage**: Centralized in `client/src/lib/i18n.ts` with type-safe interfaces
- **Persistence**: localStorage for language preference
- **Coverage**: All UI strings, navigation, messages, and labels

**Routing**: Wouter (lightweight client-side routing)

**Key Design Decisions**:
- Component library chosen for accessibility (Radix UI) and customizability (shadcn/ui)
- Separate concerns between UI components (`client/src/components/ui/`) and page components (`client/src/pages/`)
- Path aliases configured for clean imports (`@/` for client, `@shared/` for shared types)

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful endpoints organized by feature domain
- `/api/auth/*` - Authentication and user management
- `/api/reading-plans/*` - Reading plan CRUD operations
- `/api/prayers/*` - Prayer journal management
- `/api/podcasts/*` - Podcast browsing and subscriptions
- `/api/teacher/lessons/*` - Lesson creation and management (teacher mode)
- `/api/community/posts/*` - Community posts and interactions
- `/api/ai/study` - AI theological assistant endpoint
- `/api/stats/dashboard` - Aggregated user statistics

**Authentication Strategy**:
- OpenID Connect (OIDC) integration via Replit Auth
- Passport.js for session management
- Session storage in PostgreSQL using connect-pg-simple
- Session-based authentication with httpOnly cookies

**Database Access Layer**:
- Drizzle ORM for type-safe database queries
- Schema-first approach with Zod validation schemas generated from Drizzle schema
- Centralized storage interface pattern (`server/storage.ts`) abstracting database operations

**Key Design Decisions**:
- Middleware-based logging for all API requests
- Separation of concerns: routes → storage layer → database
- Raw body capture for webhook verification support
- Session TTL set to 7 days for user convenience

### Data Storage

**Database**: PostgreSQL (via Neon serverless)

**Schema Design** (`shared/schema.ts`):

**Core Tables**:
- `users` - User profiles with theme preferences, gamification stats (level, XP, streak), teacher mode flag
- `sessions` - Authentication session storage (required for Replit Auth)

**Feature Tables**:
- `reading_plans` - Custom reading plans with progress tracking
- `prayers` - Prayer journal entries with optional audio URL
- `notes` - Bible study notes linked to specific verses
- `highlights` - Verse highlights with color categorization
- `podcasts` - Podcast episodes metadata
- `podcast_subscriptions` - User podcast subscriptions
- `lessons` - Teacher mode lesson plans with objectives and questions (JSONB)
- `lesson_progress` - Student progress tracking for lessons
- `community_posts` - User-shared Bible insights with verse references
- `post_likes` - Like tracking for community posts
- `post_comments` - Comments on community posts

**Data Modeling Decisions**:
- JSONB fields for flexible data (theme settings, lesson objectives/questions)
- Composite indexes on foreign keys for query optimization
- Soft deletion approach considered for user content
- Timestamps on all user-generated content for sorting and analytics

### External Dependencies

**Authentication & Identity**:
- Replit OIDC - Primary authentication provider
- OpenID Client library - OIDC protocol implementation

**Database**:
- Neon PostgreSQL - Serverless Postgres database
- Drizzle ORM - Type-safe database toolkit
- Drizzle Kit - Database migration management

**AI Integration** (Planned):
- OpenAI API (GPT-4) - Theological question answering, doctrine comparison, content generation
- Fine-tuned on theological texts (Matthew Henry commentaries, Strong's concordance, denominational doctrines)

**Frontend Libraries**:
- Radix UI - Accessible component primitives
- TanStack Query - Server state management
- React Hook Form - Form validation
- Zod - Runtime type validation
- date-fns - Date formatting and manipulation
- Wouter - Client-side routing
- Lucide React - Icon system

**Development Tools**:
- Vite - Build tool with HMR
- TypeScript - Type safety
- Tailwind CSS - Utility-first styling
- PostCSS with Autoprefixer - CSS processing

**Media Integration** (Planned):
- Podcast RSS feed parsers - For integrating external Christian podcasts
- Audio player library - For prayer recordings and podcast playback

**Deployment Platform**:
- Replit - Hosting and deployment environment
- Replit-specific plugins for development experience (cartographer, dev-banner, runtime-error-modal)