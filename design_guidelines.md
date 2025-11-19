# Bíblia+ v2.0 Design Guidelines

## Design Approach

**Hybrid Reference Strategy**: Draw inspiration from YouVersion's Bible-reading clarity + Calm's premium spiritual aesthetic + Notion's organizational power + Spotify's media integration. Create a design that feels sacred yet modern, powerful yet peaceful.

## Typography System

**Font Families** (via Google Fonts CDN):
- **Display/Headings**: Playfair Display (serif) - for elegance and spiritual gravitas
- **Body/Interface**: Inter (sans-serif) - for readability and modern clarity
- **Bible Text**: Crimson Text (serif) - optimized for long-form reading

**Hierarchy**:
- Hero Headlines: text-5xl to text-7xl, font-bold (Playfair Display)
- Section Headers: text-3xl to text-4xl, font-semibold (Playfair Display)
- Subsection Headers: text-xl to text-2xl, font-medium (Inter)
- Body Text: text-base to text-lg (Inter)
- Bible Verses: text-lg, leading-relaxed (Crimson Text)
- Captions/Meta: text-sm (Inter)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, p-6, gap-4
- Generous spacing: p-8, p-12, gap-8
- Section padding: py-16 to py-24
- Container max-width: max-w-7xl for most content, max-w-4xl for Bible reading

**Grid System**:
- Dashboard: 3-column grid on desktop (lg:grid-cols-3), 2-column on tablet, single on mobile
- Feature showcases: 2-3 columns (md:grid-cols-2 lg:grid-cols-3)
- Bible reading: Single column with max-w-4xl for optimal readability
- Sidebar layouts: 64-unit fixed sidebar + flex-1 main content

## Component Library

### Navigation
- **Top App Bar**: Fixed header with logo, search, theme switcher, profile avatar
- **Sidebar Navigation** (Dashboard): Icon + label format, collapsible on mobile, organized by sections (Estudo, Comunidade, Ensino, Configurações)
- **Bottom Tab Bar** (Mobile): 5 primary tabs with icons

### Cards & Containers
- **Premium Card**: Rounded corners (rounded-2xl), subtle shadows (shadow-lg), padding p-6
- **Bible Verse Card**: Minimal border (border-l-4), no shadow, light background
- **Podcast Episode Card**: Horizontal layout with thumbnail, title, duration, progress bar
- **Prayer Card**: Soft rounded (rounded-xl), includes audio player when applicable
- **Lesson Card** (Teacher Mode): Header with title, body with objectives, footer with action buttons

### Forms & Inputs
- **Text Input**: Rounded (rounded-lg), consistent padding (px-4 py-3), focus states with ring
- **Color Picker**: Visual swatch grid for preset themes + custom RGB selector
- **Bible Search**: Prominent search bar with autocomplete dropdown
- **Audio Recorder**: Circular record button with waveform visualization

### Data Display
- **Progress Indicators**: Circular progress for reading plans, linear bars for lesson completion
- **Statistics Dashboard**: Large numbers with icons, 3-4 column grid
- **Gamification Badges**: Icon-based with level titles, arranged in achievement grid
- **Podcast Player**: Full-width sticky player bar at bottom with album art, controls, progress

### Overlays
- **AI Study Assistant**: Side panel (drawer) or modal with chat interface
- **Theme Customizer**: Modal with live preview of color changes
- **Lesson Creator**: Full-screen modal with multi-step form
- **Verse Highlight Menu**: Contextual popup with color options and note button

### Buttons
- **Primary CTA**: Large (px-8 py-4), rounded (rounded-full), bold text
- **Secondary**: Outlined style with transparent background
- **Icon Buttons**: Square (w-10 h-10), rounded-lg
- **Floating Action Button**: Fixed bottom-right, circular, shadow-xl (for quick prayer/note)

## Page-Specific Layouts

### Landing Page (Marketing)
- **Hero Section**: Full-viewport (h-screen) with gradient overlay, centered headline + subtitle + dual CTAs ("Começar Grátis" + "Ver Recursos"), background image of opened Bible with soft lighting
- **Features Grid**: 3-column showcase of AI Study, Teacher Mode, Podcasts with icons
- **Theme Showcase**: Interactive preview showing 4 theme variations side-by-side
- **Social Proof**: Testimonial cards in 2-column layout with user photos
- **Premium Comparison Table**: Feature comparison vs YouVersion, 2-column layout
- **Podcast Integration Preview**: Embedded mini-player with sample episodes
- **CTA Section**: Centered with community stats (users, verses read, prayers shared)
- **Footer**: Multi-column with links, newsletter signup, social icons

### Dashboard (Authenticated)
- **Overview Section**: 3-card row showing reading streak, prayer count, community activity
- **Today's Reading**: Large card with current plan chapter + progress indicator
- **Quick Actions**: 4-icon button grid (New Prayer, Ask AI, Start Podcast, Join Discussion)
- **Recent Activity Feed**: Timeline-style list with icons for different activity types
- **Gamification Widget**: Current level badge with progress to next level

### Bible Reading Interface
- **Clean Reading View**: Centered column (max-w-4xl), generous line-height, verse numbers in margin
- **Floating Toolbar**: Sticky top bar with chapter navigation, font size controls, highlight tool
- **Quick Reference Panel**: Collapsible sidebar with cross-references and study notes
- **Highlight Colors**: Palette appears on text selection with 6 preset colors

### Teacher Mode
- **Lesson Dashboard**: Card grid of created lessons with status indicators
- **Lesson Builder**: Multi-step form (Details → Scripture → Questions → Schedule)
- **Student Progress**: Table view with filterable columns and export button
- **Class Schedule**: Calendar view with upcoming lessons highlighted

### Podcast Section
- **Browse View**: Featured podcast carousel + category grid
- **Player Interface**: Large album art, title, playback controls, sleep timer, bookmark button
- **My Library**: List view with download status indicators, swipe actions for delete

### Community Feed
- **Post Cards**: User avatar + name, shared verse (highlighted), personal note, like/comment actions
- **AI Suggestions**: "Connect with others studying..." cards between posts
- **Create Post**: Floating action button opens verse selector + note input

## Animations
Use sparingly for purpose, not decoration:
- **Page Transitions**: Simple fade (duration-200)
- **Card Hover**: Subtle lift with shadow increase
- **Bible Verse Highlight**: Smooth background color transition
- **AI Response**: Typing indicator dots animation
- **Progress Bars**: Animated width change with easing

## Images

### Hero Image
Large, high-quality photograph for landing page hero:
- **Subject**: Open Bible with soft, warm natural light streaming across pages, shallow depth of field
- **Treatment**: Subtle gradient overlay (dark bottom to transparent top) for text readability
- **Placement**: Full-width, full-viewport height background
- **Buttons on Image**: Dual CTAs with frosted glass background (backdrop-blur-md)

### Feature Section Images
- AI Study illustration: Abstract representation of light bulb + book
- Teacher Mode: Person with tablet teaching small group
- Podcast: Headphones with sound wave visualization
- Community: Diverse group in discussion circle

### Podcast Thumbnails
Square album art for each podcast series, loaded from RSS feeds

### User Avatars
Circular, consistent sizing across all components (w-10 h-10 for standard, w-16 h-16 for profiles)

## Accessibility Standards
- Maintain WCAG AA contrast ratios (automatically validated against user-selected themes)
- Focus indicators on all interactive elements (ring-2 with theme-appropriate color)
- Screen reader labels for all icon-only buttons
- Keyboard navigation support throughout
- Text resizing without breaking layout
- Alt text for all decorative and informative images