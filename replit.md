# Bíblia+ v2.0

## Overview

Bíblia+ is a premium, personalized, and intelligent Bible study application designed to transform traditional scripture reading with modern AI-powered theological assistance. It offers customizable themes, integrated multimedia (podcasts, audio prayers), robust reading plans with gamification, and a community platform for shared learning. The core value proposition is to enhance Bible study through AI, personalized learning paths, multimedia integration, and community engagement, aiming for broad market appeal.

## Recent Changes

**November 20, 2025**:
*   **Página de Planos e Preços (Pricing)**: Criada página completa de planos e preços (`/pricing`) com design premium responsivo, 3 planos (Gratuito, Premium R$19,90/mês, Vitalício R$299), seção de garantia de 30 dias, 6 FAQs sobre planos, paleta de cores roxo #5711D9, e CTAs estratégicos. Integrada ao router para acesso autenticado e não-autenticado.
*   **Responsividade Mobile Aprimorada**: Tabela de alunos em Teacher Mode agora com dual-view: tabela desktop e cards empilháveis em mobile com badges coloridos, grid de 2 colunas para dados, e border-left visual indicator. Botão "Exportar Relatório" adaptado para full-width em mobile.
*   **Auditoria de Validação e Segurança**: Sistema de validação robusto implementado com schemas Zod fortalecidos (min/max, enums), ownership validation em todas rotas críticas, re-validação backend com safeParse(), proteção contra ownership escalation, transações atômicas para gamificação, e tratamento robusto de APIs externas com retry logic (3x), timeout (8s), e fallback automático.
*   **Versículo do Dia (Daily Verse)**: Implemented complete daily verse system with automatic rotation based on day of year (1-365), beautiful gradient card design with sharing capabilities (copy text, download image), multilingual support (PT, EN, NL, ES), and 30+ inspirational verses seeded. Featured prominently on home page for daily spiritual inspiration.
*   **Offline Mode**: Complete offline reading system with IndexedDB local storage, per-user backend sync via PostgreSQL, automatic fallback when offline, download/delete UI in BibleReader (cloud icon), dedicated `/offline` management page with storage stats, and intelligent toast throttling. Users can download chapters for offline access and the app automatically loads cached content when internet is unavailable.
*   **Verse Sharing System**: Implemented complete verse sharing functionality with text copy and image download using `html-to-image` library. Users can share verses via formatted text or beautiful visual cards.
*   **Prayer Journal Enhancement**: Added real audio recording using MediaRecorder API with base64 storage, time counter, mark-as-answered functionality, and delete capability. Full prayer lifecycle management implemented.
*   **Community Likes System**: Connected like/unlike mutations to community post cards, enabling social engagement within the platform.
*   **Architecture Cleanup**: Removed duplicate highlight routes, consolidated to `/api/bible/highlights` with proper color validation (6 colors: yellow, green, blue, purple, pink, orange).
*   **Donation System Foundation (INCOMPLETE)**: Created foundational structure for donations via Stripe including database schema, backend routes, UI page at `/donate`, and sidebar button. **REQUIRES COMPLETION**: Full Stripe integration needs (1) Configure STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY, (2) Implement Stripe Elements/Checkout on frontend with client-side confirmation, (3) Add webhook handler at `/api/stripe/webhook` to update donation status, (4) Implement recurring subscriptions flow, (5) Add comprehensive validation and error handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite.

**UI Component System**: Leverages shadcn/ui built on Radix UI primitives, styled with Tailwind CSS. It features a multi-font system, CSS variables for theming with light/dark mode and 5 predefined color schemes, and a mobile-first responsive design.

**State Management**: TanStack Query for server state, React Context for client-side theme and internationalization, and React Hook Form with Zod for form handling.

**Internationalization (i18n)**: Custom Context API supports Portuguese (native), English, Dutch, and Spanish, with translations centralized in `client/src/lib/i18n.ts` and language preference persisted in localStorage.

**Routing**: Wouter for lightweight client-side routing.

**Key Design Decisions**: Focus on accessibility (Radix UI), customizability (shadcn/ui), clear separation of UI and page components, and path aliases for clean imports.

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful endpoints organized by feature domain (e.g., `/api/auth/*`, `/api/reading-plans/*`).

**Authentication Strategy**: OpenID Connect (OIDC) via Replit Auth, utilizing Passport.js for session management stored in PostgreSQL with httpOnly cookies.

**Database Access Layer**: Drizzle ORM for type-safe queries, following a schema-first approach with Zod validation. A centralized storage interface (`server/storage.ts`) abstracts database operations.

**Key Design Decisions**: Middleware-based logging, clear separation of concerns (routes → storage → database), and support for webhook verification.

### Data Storage

**Database**: PostgreSQL via Neon serverless.

**Schema Design**: Defined in `shared/schema.ts`, including core tables like `users` and `sessions`, and feature-specific tables for `reading_plans`, `prayers`, `notes`, `highlights`, `podcasts`, `lessons`, and `community_posts`. Data modeling uses JSONB for flexible data, composite indexes for optimization, and timestamps for all user-generated content.

### System Design Choices & Feature Specifications

*   **AI-powered Theological Assistant**: Planned integration for advanced theological queries and content generation.
*   **Customizable Themes**: 5 presets and custom RGB options for a personalized user interface.
*   **Integrated Podcast Player**: Functionality to subscribe and play podcasts.
*   **Teacher Mode**: Tools for creating and managing educational lessons.
*   **Community Platform**: Full-featured community system with verse-based posts, likes system (POST/DELETE mutations), trending topics sidebar, and social engagement metrics. Users can share biblical insights with verse references.
*   **Versículo do Dia**: Automated daily verse rotation system (1-365 day cycle) with themed inspirational verses, gradient card UI design, sharing capabilities (text copy & image download), and multilingual support. Featured on home page for daily spiritual encouragement.
*   **Reading Plans & Gamification**: Predefined plans (7 to 365 days) with automatic scheduling. Gamification includes XP, progressive levels, daily streaks (UTC midnight logic), and 18 automatic achievements across various categories. A dedicated `/progress` dashboard visualizes user advancement.
*   **Prayer Journal**: Complete prayer management with MediaRecorder API for real audio recording (base64 storage), recording time counter, mark-as-answered functionality, delete capability, and audio playback. Categories include Thanksgiving, Supplication, Intercession, and Confession.
*   **Verse Sharing**: Integrated sharing system allowing users to copy formatted verse text or download verse cards as images using `html-to-image` library. Shareable cards include verse text, reference, and app branding.
*   **Bible Reader Redesign**: Mobile-first, minimalist layout inspired by YouVersion, with clear visual hierarchy, superscript verse numbering, and floating navigation controls. Supports multi-version reading (NVI, ACF, ARC, RA) and offline fallback for key passages.
*   **Highlights, Notes, & Bookmarks**: Allows colored verse highlighting (6 colors) and note-taking directly within the Bible reader via an integrated popover. A `/favorites` page organizes bookmarks, highlights, and notes with filtering and display options.
*   **Mobile Navigation**: Implemented a bottom navigation bar with 5 main tabs (Home, Bible, Plans, Progress, Profile) visible only on mobile, replacing the desktop sidebar.
*   **Offline Mode**: Complete offline reading experience with IndexedDB browser storage (no user scoping needed client-side), PostgreSQL backend tracking per authenticated user, API routes at `/api/offline/content` for sync, automatic online/offline detection with `navigator.onLine`, intelligent fallback loading cached chapters when API fails, download/delete controls in BibleReader navigation, and dedicated `/offline` page showing storage stats (chapters saved, space used, books downloaded) with clear-all functionality.
*   **Security & Resilience**: Robust validation (userId, external API, Zod schema), comprehensive error handling with toast notifications, retry mechanisms, and fallback UI.

## External Dependencies

**Authentication & Identity**:
*   Replit OIDC
*   OpenID Client library

**Database**:
*   Neon PostgreSQL
*   Drizzle ORM
*   Drizzle Kit

**AI Integration**:
*   OpenAI API (GPT-4) - *Planned*

**Frontend Libraries**:
*   Radix UI
*   TanStack Query
*   React Hook Form
*   Zod
*   date-fns
*   Wouter
*   Lucide React
*   html-to-image (for verse card generation)

**Development Tools**:
*   Vite
*   TypeScript
*   Tailwind CSS
*   PostCSS with Autoprefixer

**Media Integration**:
*   MediaRecorder API (for prayer audio recording)
*   Native HTML5 Audio (for prayer playback)
*   Podcast RSS feed parsers - *Planned*

**Deployment Platform**:
*   Replit