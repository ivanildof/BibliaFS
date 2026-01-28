# BíbliaFS v2.0 (v1.0.6)

## Overview
BíbliaFS is a premium, personalized, and intelligent Bible study application designed to enhance traditional scripture reading with modern AI-powered theological assistance. It aims to provide a comprehensive platform for individual and group study, integrating features like AI-assisted learning, audio playback, version comparison, and community engagement.

## User Preferences
- **Communication Style**: Clear and concise answers.
- **Problem Solving**: Provide direct solutions or steps to resolve issues.
- **Feature Location**: Guide on where to find specific features within the UI or by route.
- **Status Updates**: Explicitly state the status of features (e.g., "✅ 100% Funcional").
- **Technical Details**: Include relevant technical details when explaining functionalities (e.g., API endpoints, database tables, caching mechanisms).
- **Explanation of New Features**: Describe what new features do and how they work.
- **Workflow**: Prefer to see a breakdown of a process or a feature's flow.
- **Interaction**: Ask before making major changes.
- **Detailed Explanations**: Provide details about the how and why certain solutions or features were implemented.
- **AI Context**: Ensure AI analysis considers the broader context (e.g., entire chapter) for theological accuracy.
- **Timeliness**: Keep information updated, especially regarding fixes and new implementations.

## System Architecture

### Frontend
- **Framework**: React + TypeScript + Vite
- **UI Kit**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query v5 + React Context
- **Internationalization**: Portuguese, English, Dutch, Spanish
- **Routing**: Wouter
- **Audio System**: Supabase Storage streaming + IndexedDB for offline capabilities
- **UI/UX**: Reading themes (Sepia, Aged Paper, Night Mode) with localStorage persistence; mobile-responsive design for components like study group buttons and sidebar.

### Backend
- **Server**: Express.js + TypeScript
- **Authentication**: OpenID Connect (Replit Auth) + Passport.js; Supabase native OTP for email verification.
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM

### Key Features
- **Study Groups**: Create/manage public/private groups, real-time chat, member management with roles (Leader/Moderator/Member), invitation system via email/phone/codes. Group leaders can edit/delete groups directly from card grid via three-dots menu. Data stored in Supabase (`groups`, `group_members`, `group_messages`, `group_invites`).
- **Recent Activity Feed**: User-isolated activity feed on home page displaying prayers, community posts, and reading plan progress via `/api/activity/recent` endpoint.
- **Bible Audio System**: Integrates OpenAI TTS API for high-quality audio generation, with server-side caching in PostgreSQL (`audio_cache` table) for instant playback on subsequent requests. Supports long chapters by chunking text. Frontend streams from Supabase Storage, tracks progress, and allows offline caching to IndexedDB.
- **Version Comparison**: Side-by-side comparison of up to 3 Bible versions, with multilingual support and dynamic book name translation.
- **Teacher Mode**: AI-powered lesson creation, generating structured outlines with pedagogical assistance based on specified duration, with PDF export.
- **Daily Verse**: Displays a daily verse on the home page, with timezone-aware functionality.
- **AI Semantic Search**: Intelligent verse search by theme/context using GPT-4o-mini, returning relevant verses with AI-generated summaries. Includes a quota system with limited requests for free users and proportional limits for premium plans.
- **Gamification**: Displays XP, streak, and achievements via a banner on the Home page.
- **Offline Mode**: Visual indicators for downloaded chapters, allowing download of individual chapters or entire books to IndexedDB.
- **Bible Navigation Persistence**: User's selected Bible version, book, and chapter persist across sessions using localStorage.

### Data Storage
- **User Data**: Supabase PostgreSQL
- **Bible Audio Cache**: PostgreSQL `audio_cache` table
- **Offline Bible Text**: IndexedDB (`biblia-plus-offline`)
- **Audio Progress**: Supabase `audio_progress` table
- **Groups & Messages**: Supabase `groups`, `group_members`, `group_messages` tables
- **Invites**: Supabase `group_invites` table

## External Dependencies

### Core Technologies
- Replit OIDC
- Supabase PostgreSQL
- Express.js
- Node.js
- TypeScript
- Vite
- React
- Wouter
- TanStack Query
- shadcn/ui
- Tailwind CSS
- Zod
- React Hook Form

### AI & Media Services
- OpenAI API (GPT-4o for lesson content, GPT-4o-mini for semantic search, TTS for audio generation)
- Stripe (payments and subscriptions)
- Bible Audio Sources: eBible.org (English WEB), Bible.com endpoint or alternative (Portuguese ARC).

### UI Libraries
- Lucide React
- react-icons
- html-to-image
- recharts
- date-fns