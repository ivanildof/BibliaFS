# BíbliaFS v2.0

## Overview
BíbliaFS is a premium, personalized, and intelligent Bible study application that enhances traditional scripture reading with modern AI-powered theological assistance. It offers customizable themes, integrated multimedia (podcasts, audio prayers), robust reading plans with gamification, and a community platform for shared learning. The project aims to provide broad market appeal by focusing on AI-enhanced personalization, multimedia integration, and community engagement to transform Bible study.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

**December 16, 2025 - FINAL USABILITY FIX SESSION:**
*   **✅ R1 - Bible Reader Layout**: Fixed layout to not overlap sidebar with `overflow-x-hidden`, `max-w-6xl`, and proper header constraints
*   **✅ R2 - Version/Chapter/Verse Selection**: Added functional version selector (NVI, ACF, ARC, RA) to bible.tsx with working Select components
*   **✅ R3 - Prayer Saving**: Verified permanent database persistence via `/api/prayers` endpoint with proper mutations and cache invalidation
*   **✅ R4 - AI Study Responsiveness**: Enhanced with `md:` breakpoints, responsive padding (`p-4 md:p-6`), adjusted card heights (`h-[500px] md:h-[600px]`)
*   **✅ R5 - Podcasts Functionality**: Added episode list display with play buttons, mock episodes with duration, and proper mapping
*   **✅ R6 - Reading Plans Loading**: Fixed loading state logic, plans and templates load correctly from API
*   **✅ R7 - Dark Mode Legal Pages**: Applied `bg-white dark:bg-slate-950` to Privacy, Terms, Security, Help pages
*   **✅ R8 - Theme Persistence**: ThemeContext saves to localStorage on every change, persists across page reloads
*   **✅ R9 - Upgrade Button**: Confirmed pricing.tsx has fully functional `handleSubscribe()` and Stripe integration
*   **LSP Type Fixes**: Fixed TypeScript diagnostics in bible-reader.tsx and podcasts.tsx headers

## System Architecture

### Frontend Architecture
*   **Framework**: React with TypeScript using Vite.
*   **UI Component System**: shadcn/ui built on Radix UI primitives, styled with Tailwind CSS. Features multi-font system, CSS variables for theming with light/dark mode and 5 predefined color schemes.
*   **State Management**: TanStack Query for server state, React Context for theme/i18n, React Hook Form with Zod for forms.
*   **Internationalization (i18n)**: Custom Context API supports Portuguese, English, Dutch, Spanish with localStorage persistence.
*   **Routing**: Wouter for lightweight client-side routing.
*   **Responsive Design**: Mobile-first with `md:`, `lg:` breakpoints. All pages respect dark mode with explicit light/dark variants.

### Backend Architecture
*   **Framework**: Express.js with TypeScript on Node.js.
*   **API Design**: RESTful endpoints organized by feature domain.
*   **Authentication**: OpenID Connect (OIDC) via Replit Auth, Passport.js for sessions in PostgreSQL with httpOnly cookies.
*   **Database Layer**: Drizzle ORM for type-safe queries, schema-first approach with Zod validation, centralized storage interface.

### Data Storage
*   **Database**: PostgreSQL via Neon serverless.
*   **Schema**: 30+ tables in `shared/schema.ts` including users, prayers, highlights, notes, reading_plans, community_posts, achievements.

### Key Features
*   **AI-powered Commentary**: GPT-4o via OpenAI for theological questions with full chapter context
*   **Multi-Version Bible**: NVI, ACF, ARC, RA support with version selection
*   **Prayer Journal**: Audio recording, mark-as-answered, permanent database storage
*   **Reading Plans**: Templates with automatic scheduling, XP, levels, daily streaks, 18 achievements
*   **Customizable Themes**: 5 presets + custom RGB with localStorage sync
*   **Podcasts**: Integrated player with episode management and playback
*   **Community**: Verse-based posts, likes, trending topics
*   **Dark Mode**: Full dark/light support with localStorage persistence across all pages
*   **Offline Mode**: IndexedDB browser storage with automatic sync
*   **Verse Sharing**: Copy text or download as image via html-to-image
*   **Highlights & Notes**: 6 colors + personal annotations, organized in /favorites

## External Dependencies

### Core
*   Replit OIDC, OpenID Client
*   Neon PostgreSQL, Drizzle ORM
*   Express.js, Node.js, TypeScript, Vite
*   React, Wouter, TanStack Query
*   shadcn/ui, Radix UI, Tailwind CSS
*   Zod, React Hook Form

### AI & Media
*   OpenAI API (GPT-4o, TTS)
*   MediaRecorder API (audio recording)
*   Stripe (payments/donations)

### UI Libraries
*   Lucide React, react-icons, html-to-image
*   date-fns, recharts, embla-carousel
