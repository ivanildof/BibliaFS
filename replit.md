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

✅ **Arquivos Criados/Modificados:**
- `client/src/pages/bible-reader.tsx` - Página de leitura da Bíblia
- `server/routes.ts` - Endpoints Bible API com fallback
- `server/bible-books-fallback.ts` - Lista offline dos 66 livros
- `server/bible-chapters-fallback.ts` - Capítulos offline (Gênesis 1, Salmo 23)
- `shared/schema.ts` - Tabelas bookmarks e bible_settings
- `server/storage.ts` - CRUD operations para bookmarks/settings

**Limitações Conhecidas:**
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
- **Client State**: React Context for theme management
- **Form Handling**: React Hook Form with Zod validation

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