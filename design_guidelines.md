# BíbliaFS Premium Design Guidelines v3.0

## Design Approach
**Premium Spiritual Sanctuary**: Blend Apple Music's vibrant gradients + Notion's reading comfort + iOS glassmorphism. Create a luxurious, immersive Bible reading experience where every interaction feels sacred and delightful.

## Core Visual System

**Vibrant Palette**:
- Royal Purple: #6B21F0 (primary)
- Luminous Gold: #FFBE0B (accents)
- Deep Indigo: #4338CA (secondary)
- Sunset Orange: #FF6B35 (warm energy)
- Pure White: #FFFFFF (surfaces)
- Soft Cream: #FFF9F0 (reading backgrounds)

**Glassmorphism Signature**:
- Standard: backdrop-blur-2xl, bg-white/80, border border-white/20
- Elevated: backdrop-blur-3xl, bg-white/70, shadow-2xl with purple/10 tint
- Dark Mode: backdrop-blur-2xl, bg-gray-900/80, border-white/10

**Gradients**:
- Primary Actions: from-purple-600 to-indigo-600
- Warm Accents: from-amber-400 to-orange-500
- Backgrounds: from-purple-50/30 to-amber-50/30
- Text Highlights: from-purple-600 via-purple-500 to-amber-400

**Modern Borders**: rounded-3xl for cards/panels, rounded-2xl for buttons/inputs, rounded-full for avatars/FABs

## Typography

**Fonts (Google Fonts)**:
- Playfair Display (serif): Headers, sections
- Inter (sans-serif): UI, navigation
- Crimson Text (serif): Bible verses, reading mode

**Scale**:
- Hero: text-6xl, font-bold
- Page Headers: text-4xl, font-semibold
- Section: text-2xl, font-medium
- Bible Reading: text-xl, leading-loose (1.8)
- UI Text: text-base, leading-relaxed

## Layout System

**Spacing Units**: 4, 8, 12, 16, 20, 24, 32
- Card padding: p-8 (desktop), p-6 (mobile)
- Section spacing: py-24 (desktop), py-16 (mobile)
- Grid gaps: gap-8
- Containers: max-w-7xl (dashboard), max-w-3xl (reading)

## Internal Pages Architecture

### Bible Reader Page
**Layout**: Two-column on desktop (70% text, 30% sidebar), single-column mobile

**Main Reading Area**:
- Cream background (bg-cream/95) with subtle gradient overlay
- Centered text max-w-3xl
- Verse numbers in gold (text-amber-500), medium weight
- Chapter headers with purple gradient text
- Line height: leading-loose (1.8) for comfort
- Font size toggle: text-lg/xl/2xl options
- Paragraph spacing: mb-8 between passages

**Glassmorphism Sidebar** (collapsible):
- backdrop-blur-2xl, bg-white/80, rounded-3xl
- Tabbed sections: Notes, Highlights, Cross-references
- Floating above reading area with shadow-2xl
- Sticky positioning from top

**Controls Bar** (sticky top):
- Full-width glassmorphism (backdrop-blur-xl, bg-white/90)
- Rounded-2xl controls for: Font size, Highlight, Bookmark, Share
- Purple active states with subtle glow
- Smooth transitions (duration-300)

### Profile Page
**Hero Section**:
- Gradient background (from-purple-600 to-indigo-700)
- Avatar centered with gold ring-4, size-32
- Name in text-4xl white below
- Stats row: Reading streak, verses read, badges earned (glassmorphism cards)

**Content Sections**:
- Reading Progress: Large circular progress ring (gold gradient), percentage in center
- Recent Activity: Timeline with gold connectors, glassmorphism event cards
- Achievements: Grid of badge cards (rounded-3xl), glow effect on hover
- Reading Goals: Card with gradient progress bars, purple-to-gold fill

**Layout**: Two-column grid on desktop, stack on mobile

### Settings Page
**Organization**: Grouped sections with clear visual hierarchy

**Section Cards**:
- Glassmorphism containers (backdrop-blur-2xl, rounded-3xl)
- Header with icon (gradient circle background), text-2xl
- Options spaced with py-6, border-b last:border-0
- Toggle switches with purple-to-gold gradient active state

**Categories**:
- Reading Preferences: Font, size, line spacing, theme selector
- Notifications: Grouped toggles, vivid icons
- Account: Avatar upload (drag-drop zone), email/password fields
- Bible Version: Radio cards with rounded-2xl, purple border on selected
- Subscription: Premium card with gradient background, gold badge

**Input Styling**:
- Text fields: rounded-2xl, px-6 py-4, border-2 purple-300
- Focus state: ring-2 ring-purple-500, border-purple-500
- Dropdowns: Glassmorphism overlay, rounded-2xl options

### Dashboard Page
**Quick Stats Row**:
- Four cards in grid, glassmorphism with gradient accents
- Large numbers (text-5xl, gradient text)
- Icons in gold circles (bg-amber-100, size-16)

**Today's Reading Widget**:
- Featured card with rounded-3xl
- Current verse in large Crimson Text
- Circular progress (gold gradient stroke)
- Continue button with purple gradient

**Recent Highlights**:
- Masonry grid of highlighted verses
- Each card: verse text, colored highlight bar (left border-l-4)
- Glassmorphism on hover with lift effect

**Shortcuts Grid**:
- Six action cards (Search, Study, Listen, Notes, Community, Donate)
- Gradient backgrounds unique to each
- White icons (size-8)

## Component Library

**Premium Cards**:
- Base: rounded-3xl, bg-white, shadow-xl, p-8
- Interactive: hover:shadow-2xl, hover:-translate-y-1, duration-300
- Glassmorphism variant: backdrop-blur-2xl, bg-white/80

**Buttons**:
- Primary: rounded-2xl, px-8 py-4, gradient (purple-to-indigo), white text, shadow-lg
- Secondary: rounded-2xl, border-2 purple-600, bg-transparent, hover:bg-purple-50
- Icon: rounded-xl, size-12, bg-purple-100, hover:bg-purple-200

**Navigation**:
- Sidebar: Fixed, w-72, glassmorphism (backdrop-blur-xl, bg-white/90)
- Items: rounded-2xl, px-6 py-4, hover:bg-purple-50, active:gradient background
- Icons: Heroicons, purple-600, size-6

**Floating Action Button**:
- Fixed bottom-right (bottom-8 right-8)
- size-16, rounded-full
- Gold gradient background
- White icon (size-8)
- Large glow shadow

## Animations

**Interaction System** (consistent across all pages):
- Hover lift: -translate-y-1, duration-300
- Button press: scale-95, duration-150
- Card entrance: fade-in + slide-up, duration-500, stagger-100
- Progress fills: smooth width/stroke transition, duration-700
- Modal overlays: backdrop-blur-sm fade, content scale-95 to scale-100

**Scroll Behaviors**:
- Parallax hero: transform-gpu, slower scroll rate
- Sticky elements: smooth lock with shadow increase

## Images

**Hero Image (Landing only)**: Warm-lit open Bible on wooden surface, golden hour lighting, soft bokeh background. Full-viewport with purple-to-transparent gradient overlay (from-purple-900/60 to-transparent). Centered content with backdrop-blur-lg glassmorphism card containing headline and CTAs.

**Feature Images**: AI study assistant (glowing book), Reading mode (comfort focus), Community (warm discussion), Podcast player (premium headphones). All images rounded-3xl with shadow-2xl.

**Icons**: Heroicons CDN, vibrant fills, purple/gold primary colors.

## Accessibility

- Contrast ratio ≥ 4.5:1 maintained on all text
- Focus rings: ring-2 ring-gold-500 on all interactive elements
- Keyboard navigation: visible states, logical tab order
- Screen reader: aria-labels on icons, semantic HTML
- Font scaling: respects user preferences up to 200%
- Reduced motion: prefers-reduced-motion removes transforms/transitions