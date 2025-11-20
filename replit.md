# Bíblia+ v2.0

## Overview

Bíblia+ is a premium, personalized, and intelligent Bible study application designed to transform traditional scripture reading with modern AI-powered theological assistance. It offers customizable themes, integrated multimedia (podcasts, audio prayers), robust reading plans with gamification, and a community platform for shared learning. The core value proposition is to enhance Bible study through AI, personalized learning paths, multimedia integration, and community engagement, aiming for broad market appeal.

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
*   **Community Platform**: Features for sharing insights, posts, likes, and comments.
*   **Reading Plans & Gamification**: Predefined plans (7 to 365 days) with automatic scheduling. Gamification includes XP, progressive levels, daily streaks (UTC midnight logic), and 18 automatic achievements across various categories. A dedicated `/progress` dashboard visualizes user advancement.
*   **Prayer Journal**: Includes audio recording capabilities.
*   **Bible Reader Redesign**: Mobile-first, minimalist layout inspired by YouVersion, with clear visual hierarchy, superscript verse numbering, and floating navigation controls. Supports multi-version reading (NVI, ACF, ARC, RA) and offline fallback for key passages.
*   **Highlights, Notes, & Bookmarks**: Allows colored verse highlighting (6 colors) and note-taking directly within the Bible reader via an integrated popover. A `/favorites` page organizes bookmarks, highlights, and notes with filtering and display options.
*   **Mobile Navigation**: Implemented a bottom navigation bar with 5 main tabs (Home, Bible, Plans, Progress, Profile) visible only on mobile, replacing the desktop sidebar.
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

**Development Tools**:
*   Vite
*   TypeScript
*   Tailwind CSS
*   PostCSS with Autoprefixer

**Media Integration**:
*   Podcast RSS feed parsers - *Planned*
*   Audio player library - *Planned*

**Deployment Platform**:
*   Replit