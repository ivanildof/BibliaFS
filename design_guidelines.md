# Bíblia+ v2.0 Premium Design Guidelines - Vibrant Edition

## Design Approach

**Premium Spiritual Experience**: Blend Calm's serene elegance + Apple Music's vibrant interface + YouVersion's reading clarity. Create a luxurious, spiritually uplifting sanctuary with rich, alive colors that energize while maintaining sacred sophistication.

## Color & Visual Treatment

**Vibrant Core Palette**:
- **Royal Purple**: #6B21F0 (primary actions, vivid and rich)
- **Luminous Gold**: #FFBE0B (accents, premium highlights, warm glow)
- **Deep Indigo**: #4338CA (secondary actions, depth)
- **Sunset Orange**: #FF6B35 (warm accents, energy)
- **Pure White**: #FFFFFF (text, cards)
- **Soft Cream**: #FFF9F0 (warm backgrounds)

**Dynamic Gradients**:
- Hero/Primary: from-purple-600 via-purple-500 to-amber-400 (45° angle)
- Secondary: from-indigo-600 to-purple-600
- Warm Accents: from-orange-500 to-amber-400
- Backgrounds: from-purple-50 to-amber-50 (very light, 20% opacity)

**Visual Signature**:
- Glassmorphism: backdrop-blur-xl on overlays with saturated tint (bg-purple-500/10)
- Vivid Shadows: Deep colored shadows (shadow-2xl with purple/amber hues)
- Glow Effects: box-shadow with purple/gold glow on interactive elements
- Borders: rounded-2xl standard, rounded-3xl for hero elements, 2px borders in vivid colors

## Typography

**Fonts** (Google Fonts CDN):
- **Playfair Display** (serif): Headlines, section headers
- **Inter** (sans-serif): UI, body text
- **Crimson Text** (serif): Bible verses

**Hierarchy**:
- Hero: text-6xl/text-7xl, font-bold, gradient text effect
- Sections: text-4xl, font-semibold
- Subsections: text-2xl, font-medium
- Body: text-lg, leading-relaxed
- Bible: text-lg, leading-loose

## Layout & Spacing

**Primitives**: 4, 6, 8, 12, 16, 20, 24
- Card padding: p-8 to p-12
- Section spacing: py-20 to py-32
- Grid gaps: gap-8, gap-12
- Containers: max-w-7xl general, max-w-4xl reading

## Component Specifications

### Navigation
**Top Bar**: Fixed glassmorphism (backdrop-blur-xl, bg-white/90), vivid purple logo, search with purple focus ring-2, profile avatar with gold ring-3 indicator
**Sidebar**: w-64, vibrant purple-to-indigo gradient (from-purple-600 to-indigo-700), white icons with gold hover states, active item with gold background

### Cards & Elevation
**Premium Cards**: rounded-2xl, shadow-2xl with purple tint, white background, gold accent borders (border-l-4)
**Feature Cards**: Gradient backgrounds (purple-to-indigo), white text, glow effect shadows
**Bible Cards**: Cream background, gold left border (border-l-4), vivid purple verse numbers
**Podcast Cards**: Album art rounded-xl, glassmorphism player with purple/gold controls

### Interactive Elements
**Primary Buttons**: rounded-full, px-10 py-4, vibrant gradient (purple-to-amber), white text, gold glow shadow, scale on hover
**Secondary Buttons**: rounded-full, border-2 purple, transparent, purple text, hover fills with gradient
**Icon Buttons**: w-12 h-12, rounded-xl, purple-100 background, purple-600 icon, gold hover
**FAB**: Fixed bottom-right, rounded-full, w-16 h-16, gold gradient, white icon, large glow shadow

### Inputs & Forms
**Text Fields**: rounded-xl, px-6 py-4, border-2 purple-300, focus ring-2 purple-500
**Search Bar**: Prominent rounded-full, px-8 py-4, purple gradient background (10% opacity), white input
**Toggles**: Purple-to-gold gradient when active, smooth transition

### Data Display
**Progress Rings**: Thick stroke, purple-to-gold gradient, gold glow
**Stats Cards**: Large gradient numbers, icon with colored background (purple-100), shadow-xl
**Badges**: Hexagonal, gold borders, gradient backgrounds, grouped with glow effects

## Page Layouts

### Landing Page
**Hero**: Full-viewport warm-lit Bible image, purple-to-transparent gradient overlay (60% opacity), centered headline with gradient text, dual CTAs with backdrop-blur-lg + purple/gold gradient backgrounds
**Features**: 3-column grid, gradient background cards, white icons in gold circles, shadow-2xl
**Theme Preview**: 4 vivid theme cards, interactive hover with glow
**Testimonials**: 2-column, user photos with gold ring-3, glassmorphism cards with purple tint
**Premium Table**: Alternating gradient rows, gold checkmarks, vivid headers
**Podcast Showcase**: Full-width with gradient background, glassmorphism player
**CTA Section**: Purple-to-indigo gradient, white text, gold stats
**Footer**: 4-column, purple-50 background, gold social icons, rounded-full newsletter input

### Dashboard
**Overview**: 3-column stat cards with gradient backgrounds, large white numbers, glow shadows
**Reading Widget**: Large card, gold progress ring, purple accent, current verse in cream box
**Quick Actions**: 4-icon grid, gradient backgrounds, gold icons, glow on hover
**Activity Feed**: Timeline with gold connector, gradient card entries
**Gamification**: Badge showcase with animated glow, progress bar with gradient fill

### Bible Reading
**View**: Centered max-w-4xl, cream background, gold verse numbers, purple chapter headers
**Controls**: Sticky glassmorphism bar, rounded-full segments, purple/gold buttons
**Highlight Palette**: Selection reveals 6 vibrant colors in rounded-xl container, shadow-xl
**Side Panel**: Collapsible notes, backdrop-blur with purple tint

### Teacher Mode
**Lesson Grid**: Gradient status badges, shadow-2xl cards, gold action buttons
**Builder**: Multi-step with gold progress dots, generous spacing, purple section dividers
**Progress Table**: Gradient headers, gold export button with icon

### Podcast Player
**Browse**: Featured carousel with shadow-2xl, gradient category cards
**Player**: Large album art rounded-2xl, glassmorphism controls, gold progress indicator
**Library**: List with gradient download status, swipe reveals gold action

### Community
**Post Cards**: Avatar with gold ring-3, gradient quote backgrounds, glassmorphism, shadow-lg
**Composer**: Bottom FAB opens full modal with backdrop-blur, purple gradient header

## Images

**Hero Image**: Professional photograph of opened Bible in warm golden-hour light, soft focus background. Full-viewport with purple gradient overlay. Dual CTAs with backdrop-blur-lg + gradient backgrounds positioned center.

**Feature Images**: AI study (light rays + book), Teacher mode (elegant teaching), Podcasts (premium headphones with glow), Community (warm group discussion)

**Icons**: Vibrant filled icons from Heroicons, purple/gold color scheme

## Animations

Purposeful motion only:
- Card hover: Lift + glow shadow increase (duration-300)
- Button: Scale-95 + gradient shift
- Progress: Smooth width with gradient flow
- Page transitions: Fade (duration-200)

## Accessibility

- WCAG AA contrast maintained with vivid palette
- Focus rings in gold (ring-2) on all interactive elements
- Keyboard navigation with visible states
- Screen reader labels for all icons
- Alt text for hero and feature images