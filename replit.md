# Bíblia+ v2.0

## Overview
Bíblia+ is a premium, personalized, and intelligent Bible study application that enhances traditional scripture reading with modern AI-powered theological assistance. It offers customizable themes, integrated multimedia (podcasts, audio prayers), robust reading plans with gamification, and a community platform for shared learning. The project aims to provide broad market appeal by focusing on AI-enhanced personalization, multimedia integration, and community engagement to transform Bible study.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
*   **Framework**: React with TypeScript using Vite.
*   **UI Component System**: shadcn/ui built on Radix UI primitives, styled with Tailwind CSS. Features a multi-font system, CSS variables for theming with light/dark mode and 5 predefined color schemes, and mobile-first responsive design.
*   **State Management**: TanStack Query for server state, React Context for client-side theme and internationalization, and React Hook Form with Zod for form handling.
*   **Internationalization (i18n)**: Custom Context API supports Portuguese, English, Dutch, and Spanish, with language preference persisted in localStorage.
*   **Routing**: Wouter for lightweight client-side routing.
*   **Key Design Decisions**: Focus on accessibility, customizability, clear separation of UI and page components, and path aliases.

### Backend Architecture
*   **Framework**: Express.js with TypeScript running on Node.js.
*   **API Design**: RESTful endpoints organized by feature domain.
*   **Authentication Strategy**: OpenID Connect (OIDC) via Replit Auth, utilizing Passport.js for session management stored in PostgreSQL with httpOnly cookies.
*   **Database Access Layer**: Drizzle ORM for type-safe queries, following a schema-first approach with Zod validation. A centralized storage interface (`server/storage.ts`) abstracts database operations.
*   **Key Design Decisions**: Middleware-based logging, clear separation of concerns (routes → storage → database), and support for webhook verification.

### Data Storage
*   **Database**: PostgreSQL via Neon serverless.
*   **Schema Design**: Defined in `shared/schema.ts`, including core tables like `users` and `sessions`, and feature-specific tables for `reading_plans`, `prayers`, `notes`, `highlights`, `podcasts`, `lessons`, and `community_posts`. Uses JSONB for flexible data, composite indexes for optimization, and timestamps.

### System Design Choices & Feature Specifications
*   **AI-powered Theological Assistant**: GPT-4o integration via OpenAI API for theological queries, providing balanced responses across Christian traditions. Requires user's `OPENAI_API_KEY`. Also generates Bible audio narration using OpenAI TTS API.
*   **Customizable Themes**: 5 presets and custom RGB options.
*   **Integrated Podcast Player**: Functionality to subscribe and play podcasts.
*   **Teacher Mode**: Tools for creating and managing educational lessons.
*   **Community Platform**: Full-featured community system with verse-based posts, likes, trending topics, and social engagement metrics.
*   **Versículo do Dia (Daily Verse)**: Automated daily verse rotation with themed inspirational verses, gradient card UI, sharing capabilities (text copy & image download), and multilingual support.
*   **Reading Plans & Gamification**: Predefined plans (7 to 365 days) with automatic scheduling, XP, progressive levels, daily streaks, and 18 automatic achievements.
*   **Prayer Journal**: Complete prayer management with audio recording (MediaRecorder API), time counter, mark-as-answered, delete capability, and audio playback.
*   **Verse Sharing**: Integrated sharing system allowing users to copy formatted verse text or download verse cards as images using `html-to-image`.
*   **Bible Reader Redesign**: Mobile-first, minimalist layout with superscript verse numbering and floating navigation controls. Supports multi-version reading (NVI, ACF, ARC, RA), offline fallback for key passages, and OpenAI-powered audio narration (TTS).
*   **Highlights, Notes, & Bookmarks**: Allows colored verse highlighting (6 colors) and note-taking. A `/favorites` page organizes bookmarks, highlights, and notes.
*   **Mobile Navigation**: Implemented a bottom navigation bar with 5 main tabs for mobile devices.
*   **Offline Mode**: Complete offline reading experience with IndexedDB browser storage, PostgreSQL backend tracking, API routes for sync, automatic online/offline detection, intelligent fallback loading, download/delete controls, and a dedicated `/offline` page.
*   **Security & Resilience**: Robust validation (userId, external API, Zod schema), comprehensive error handling, retry mechanisms, and fallback UI.
*   **Production Database Setup**: User must manually execute `server/production-schema.sql` in their production PostgreSQL database.

## External Dependencies

### Authentication & Identity
*   Replit OIDC
*   OpenID Client library

### Database
*   Neon PostgreSQL
*   Drizzle ORM
*   Drizzle Kit

### AI Integration
*   OpenAI API (GPT-4o, TTS) - Requires user's `OPENAI_API_KEY`

### Frontend Libraries
*   Radix UI
*   TanStack Query
*   React Hook Form
*   Zod
*   date-fns
*   Wouter
*   Lucide React
*   html-to-image

### Development Tools
*   Vite
*   TypeScript
*   Tailwind CSS
*   PostCSS with Autoprefixer

### Media Integration
*   MediaRecorder API
*   Native HTML5 Audio

### Deployment Platform
*   Replit