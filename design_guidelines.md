# Bíblia+ v2.0 Premium Design Guidelines

## Design Approach

**Premium Spiritual Experience**: Blend Calm's serene elegance + Apple Music's refined interface + YouVersion's reading clarity. Create a luxurious sanctuary for Bible study that feels both sacred and sophisticated, peaceful yet powerful.

## Color & Visual Treatment

**Core Palette**:
- Deep Purple: #5711D9 (primary actions, gradients)
- Gold: #FFD700 (accents, premium highlights)
- Pure White: #FFFFFF (text, cards)
- Rich gradients: Purple-to-gold (from-purple-700 to-amber-500), subtle 15-30° angles

**Visual Signature**:
- Glassmorphism: backdrop-blur-md to backdrop-blur-xl on overlays and floating elements
- Shadows: Deep, soft shadows (shadow-2xl) for card elevation, multiple layered shadows for depth
- Gradients: Subtle background gradients (opacity 10-20%) across sections, bold gradients for CTAs
- Borders: Generous rounding (rounded-2xl standard, rounded-3xl for hero cards)

## Typography

**Fonts** (Google Fonts CDN):
- Playfair Display (serif): Hero headlines, section headers - conveys elegance
- Inter (sans-serif): UI elements, body text - modern clarity
- Crimson Text (serif): Bible verses - optimized for reading

**Hierarchy**:
- Hero: text-6xl/text-7xl, font-bold (Playfair)
- Sections: text-4xl, font-semibold (Playfair)
- Subsections: text-2xl, font-medium (Inter)
- Body: text-lg (Inter)
- Bible: text-lg, leading-relaxed (Crimson)

## Layout & Spacing

**Spacing Primitives**: 4, 6, 8, 12, 16, 20, 24
- Generous padding: p-8, p-12 standard
- Section spacing: py-20, py-24, py-32
- Card padding: p-8 minimum
- Grid gaps: gap-8, gap-12

**Containers**: max-w-7xl general, max-w-4xl Bible reading, full-bleed for hero

## Component Specifications

### Navigation
**Top Bar**: Glassmorphism header (backdrop-blur-xl, bg-white/80), fixed, logo left, search center, profile right with gold ring indicator
**Sidebar**: 64-unit width, deep purple gradient background, white icons/text, collapsed on mobile

### Cards & Elevation
**Premium Cards**: rounded-2xl, shadow-2xl, white background with subtle purple gradient overlay (5% opacity)
**Bible Verse Cards**: rounded-xl, border-l-4 gold accent, shadow-lg, light background
**Podcast Cards**: Horizontal layout, album art with rounded-xl, glassmorphism player bar
**Elevated Panels**: Multiple shadow layers for floating effect, backdrop-blur for transparency

### Interactive Elements
**Primary Buttons**: Rounded-full, px-10 py-4, purple-to-gold gradient background, white text, shadow-xl
**Secondary Buttons**: Outlined, rounded-full, border-2 purple, transparent background
**Icon Buttons**: Square w-12 h-12, rounded-xl, hover with purple gradient
**FAB**: Bottom-right fixed, rounded-full, gold background, shadow-2xl, w-16 h-16

### Inputs & Forms
**Text Fields**: rounded-xl, px-6 py-4, border with purple focus ring-2, shadow-inner
**Search Bar**: Prominent with glassmorphism background, rounded-full, px-8 py-4
**Color Picker**: Visual swatches in grid, selected with gold ring-4

### Data Display
**Progress Rings**: Circular with gold/purple gradient stroke, shadow glow effect
**Stats**: Large numbers with gradient text effect, icon backgrounds with subtle glow
**Achievement Badges**: Hexagonal shapes, gold borders, shadow-2xl, grouped in decorative grid

## Page Layouts

### Landing Page (Hero-First)
**Hero Section**: Full-viewport with large background image (warm-lit Bible scene), purple-to-transparent gradient overlay, centered dual CTAs with backdrop-blur-lg backgrounds, no hover states on hero buttons
**Features**: 3-column grid, each card with icon in gold circle, shadow-2xl elevation
**Theme Preview**: 4 theme cards showing color variations, interactive hover lift
**Testimonials**: 2-column carousel, user photos with gold borders, glassmorphism cards
**Premium Table**: Feature comparison, alternating row backgrounds with subtle gradient
**Podcast Showcase**: Full-width player preview with glassmorphism controls
**CTA Section**: Centered, purple gradient background, white text, gold accent stats
**Footer**: 4-column layout, newsletter input with rounded-full styling, social icons in gold

### Dashboard
**Overview Cards**: 3-column row, each with gradient background, shadow-2xl, stats with large numbers
**Reading Widget**: Large card with current chapter, progress ring, shadow-2xl
**Quick Actions**: 4-icon grid with glassmorphism backgrounds, gold hover states
**Activity Feed**: Timeline with gradient connector lines, card entries
**Gamification**: Prominent badge display with glow effect, progress to next level

### Bible Reading
**Reading View**: Centered max-w-4xl, verse numbers in gold, generous line-height
**Floating Controls**: Top sticky bar with glassmorphism, rounded-full segments
**Highlight Palette**: Appears on selection, 6 colors in rounded-xl container, shadow-xl
**Side Panel**: Collapsible notes/references with backdrop-blur

### Teacher Mode
**Lesson Grid**: Cards with shadow-2xl, status badges in gold
**Builder**: Multi-step wizard with progress indicator, generous spacing between sections
**Progress Table**: Elevated container, alternating row gradients, export button with gold icon

### Podcast Player
**Browse**: Featured carousel with shadow-2xl cards, category grid with gradient overlays
**Player**: Large rounded-2xl album art, glassmorphism controls bar, progress with gold indicator
**Library**: List with download status, swipe actions reveal gradient backgrounds

### Community
**Post Cards**: User avatar with gold ring, verse highlight, glassmorphism background, shadow-lg
**Floating Composer**: Bottom-right FAB opens full composer with backdrop-blur modal

## Images

**Hero Image**: Professional photograph of opened Bible with warm, natural light (golden hour quality), soft depth of field, creates sacred atmosphere. Full-width, full-viewport, with purple gradient overlay (dark bottom fading up). Dual CTA buttons overlay with backdrop-blur-lg backgrounds.

**Feature Sections**: AI study (light rays + open book), Teacher mode (elegant teaching scene), Podcasts (premium headphones with glow), Community (warm discussion group)

**Podcast Art**: Square album covers with rounded-xl treatment, shadow-lg

**User Avatars**: Circular, consistent sizing (w-12 h-12 standard, w-20 h-20 profiles), gold ring-2 for active users

## Animations

Minimal, purposeful motion:
- Card hover: Lift with increased shadow (duration-300)
- Button press: Scale-95 with gradient shift
- Page transitions: Fade (duration-200)
- Progress fills: Smooth width animation with easing
- Glassmorphism: No animation on blur effects

## Accessibility

- WCAG AA contrast maintained across purple/gold palette
- Focus rings in gold (ring-2) on all interactive elements
- Keyboard navigation with visible focus states
- Screen reader labels for icon buttons
- Text resizing support without layout breaks
- Alt text for all images including hero