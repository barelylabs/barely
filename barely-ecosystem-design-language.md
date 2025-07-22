# Barely Ecosystem - Complete Design Language Guide

## Core Design Philosophy
**"Studio to Stage"** - The journey from creative chaos to polished performance, reflected in every interface.

---

## 1. Barely Sparrow Agency Website

### Visual Identity
**Mood**: Midnight studio session - creative energy meets technical precision
**Personality**: Bold, confident, slightly rebellious but professional

### Color Palette
```
Primary Background: #0A0A0A (Rich black)
Secondary Background: #111111 (Elevated surfaces)
Tertiary Background: #1A1A1A (Cards/sections)

Text Primary: #F5F5F5 (Soft white)
Text Secondary: #A0A0A0 (Muted gray)

Accent Purple: #A78BFA (Creative energy)
Accent Pink: #EC4899 (Passion/emotion)
Accent Green: #10B981 (Success/action - the "powered by barely" signature)

Gradient Primary: linear-gradient(135deg, #A78BFA 0%, #EC4899 100%)
Gradient Overlay: linear-gradient(180deg, rgba(167, 139, 250, 0.1) 0%, transparent 100%)
```

### Typography
```
Headlines: Inter Display, Bold, -0.02em tracking
Subheadlines: Inter Display, Medium, -0.01em tracking
Body: Inter, Regular, 0em tracking
Small/Meta: Inter, Regular, 0.01em tracking
```

### Layout Principles
- Full-bleed hero sections with gradient overlays
- Asymmetric grid breaking (60/40, 70/30 splits)
- Large typography (48-64px headlines on desktop)
- Generous whitespace despite dark theme
- Card-based case studies with hover transformations

### Animation & Interactions
- Scroll-triggered fade-ins with slight Y translation (20px)
- Hover states: Scale(1.02) with box-shadow glow
- Gradient shifts on interactive elements
- Stagger animations for list items (0.1s delays)
- Page transitions: 500ms crossfade with slight zoom

### Unique Elements
- Waveform decorative elements
- Particle effects on CTA hover (subtle)
- Client logos in grayscale, colorize on hover
- Testimonial cards with gradient borders
- Service pricing with "pulse" animation on featured tier

---

## 2. barely.io SaaS Marketing Website

### Visual Identity
**Mood**: Dawn breaking - transitioning from creative to productive
**Personality**: Professional, innovative, trustworthy, approachable

### Color Palette
```
Primary Background: #FFFFFF (Light) / #16213E (Dark default)
Secondary Background: #FAFAFA (Light) / #1A1A2E (Dark)
Tertiary Background: #F5F5F5 (Light) / #0F3460 (Dark)

Text Primary: #1A1A1A (Light) / #F5F5F5 (Dark)
Text Secondary: #6B7280 (Light) / #9CA3AF (Dark)

Accent Blue: #3B82F6 (Primary actions)
Accent Purple: #8B5CF6 (Creative features)
Accent Green: #10B981 (Success/pricing - carries over from agency)

Gradient Primary: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)
Gradient Subtle: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)
```

### Typography
```
Headlines: Inter Display, Semibold, -0.01em tracking
Subheadlines: Inter, Medium, 0em tracking
Body: Inter, Regular, 0em tracking
Code/Technical: JetBrains Mono, Regular, 0em tracking
```

### Layout Principles
- Clean, centered hero with breathing room
- Feature grid with 3-column layout
- Comparison tables with hover row highlights
- Documentation-style sidebars
- Z-pattern reading flow on landing sections

### Animation & Interactions
- Smooth scroll with 60fps target
- Feature cards: Subtle shadow lift on hover
- Pricing toggle: Spring animation
- Number counters for stats
- Accordion animations for FAQs

### Unique Elements
- Interactive product demo (simplified)
- Before/after sliders for comparisons
- Animated workflow diagrams
- Trust badges with subtle float animation
- Code snippets with syntax highlighting

---

## 3. barely.io App Interface

### Visual Identity
**Mood**: Adaptive workspace - business by day, creative by night
**Personality**: Powerful yet approachable, Arc browser-inspired delight

### Color Palette

#### Light Mode (Business Mode)
```
Background Primary: #FFFFFF
Background Secondary: #FAFAFA  
Background Tertiary: #F5F5F5
Surface: #FFFFFF with 0 1px 3px rgba(0,0,0,0.1)

Text Primary: #1A1A1A
Text Secondary: #6B7280
Text Tertiary: #9CA3AF

Accent Blue: #3B82F6 (Navigation/Primary)
Accent Purple: #8B5CF6 (Creative tools)
Accent Green: #059669 (Success - muted for light mode)
```

#### Dark Mode (Creative Mode)
```
Background Primary: #0A0A0A
Background Secondary: #111111
Background Tertiary: #1A1A1A
Surface: #1A1A1A with 0 1px 3px rgba(0,0,0,0.5)

Text Primary: #F5F5F5
Text Secondary: #A0A0A0
Text Tertiary: #6B7280

Accent Blue: #60A5FA (Navigation/Primary - brighter)
Accent Purple: #A78BFA (Creative tools - vibrant)
Accent Green: #10B981 (Success - full intensity)
```

### Typography
```
UI Text: SF Pro Display or Inter, Regular/Medium
Data/Numbers: SF Mono or JetBrains Mono
Labels: Inter, Medium, 0.05em tracking, uppercase for tiny labels
```

### Layout Principles
- Left sidebar (240px) with collapsible sections
- Command bar at top (⌘K activation)
- Main content area with max-width constraints
- Card-based widgets for dashboard
- Split-view capability for power users

### Component Patterns
```
Buttons:
- Primary: Filled with accent color, 8px radius
- Secondary: Outlined, 8px radius  
- Ghost: No border, bg on hover
- Icon: 32x32px hit targets minimum

Inputs:
- 40px height standard
- 8px border radius
- Focus ring: 2px offset, accent color
- Inline validation messages

Cards:
- 12px border radius
- Subtle shadow in light mode
- 1px border in dark mode
- 16-24px padding

Data Viz:
- Spotify-inspired clean charts
- Accent colors for data series
- Smooth transitions on data updates
```

### Animation & Interactions
- Mode switch: 500ms crossfade with particle effect
- Sidebar: Slide + fade for menu items
- Command bar: Bounce entrance
- Loading: Custom music-themed spinner
- Micro-interactions: 200-300ms spring animations

### Unique Elements
- "Spaces" for different artists/campaigns (Arc-inspired)
- Command palette with fuzzy search
- Real-time collaboration indicators
- Contextual toolbars that appear on selection
- Music waveform visualizations in analytics

---

## 4. Destination Pages Framework

### Visual Identity
**Mood**: Showtime - artist personality within system constraints
**Personality**: Flexible but cohesive, fan-optimized

### Base Design System (All Destinations)

#### Grid & Spacing
```
Grid: 12-column responsive
Breakpoints: 
- Mobile: 320-768px (1 column)
- Tablet: 769-1024px (2 column)
- Desktop: 1025px+ (12 column)

Spacing Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
```

#### Theme Options

**1. Midnight Session** (Dark/Alternative)
```
Background: #0A0A0A
Surface: #1A1A1A
Text: #F5F5F5
Accent: Artist choice from palette
```

**2. Daylight** (Light/Clean)
```
Background: #FFFFFF
Surface: #F5F5F5
Text: #1A1A1A
Accent: Artist choice from palette
```

**3. Festival** (Vibrant/Energetic)
```
Background: Gradient possibilities
Surface: White with transparency
Text: Dynamic based on background
Accent: High saturation colors
```

**4. Intimate** (Warm/Minimal)
```
Background: #FAF9F7
Surface: #FFFFFF
Text: #2D2D2D
Accent: Muted, warm tones
```

**5. Industry** (Professional/Press)
```
Background: #F8F8F8
Surface: #FFFFFF
Text: #000000
Accent: Single brand color
```

### Page-Specific Patterns

#### Link-in-Bio
- Single column, mobile-first
- 48px minimum button height
- 16px gap between links
- Profile image: 96px circle
- Optional background blur effect

#### Smart Links (Streaming)
- Hero album art: 300x300px min
- Platform buttons: 48px height, full width mobile
- Pre-save form: Inline or modal
- Analytics overlay: Glass morphism effect

#### Landing Pages
- Modular sections with 80px spacing
- Hero: Full viewport height option
- Gallery: Masonry or grid layout
- Tour dates: Table or card format
- Email capture: Sticky or inline

#### Cart/Checkout
- Single column, 640px max width
- Progress indicator: 3 steps max
- Trust badges: Below CTA
- Form fields: 48px height, clear labels
- Real-time validation

#### EPK
- Sidebar navigation on desktop
- Stats bar: Sticky on scroll
- Image gallery: Lightbox enabled
- Downloads: Clear file type indicators
- Press quotes: Carousel with attribution

---

## Global Design Tokens

### Border Radius Scale
```
Tiny: 4px (badges, pills)
Small: 8px (buttons, inputs)
Medium: 12px (cards)
Large: 16px (modals)
XL: 24px (hero sections)
```

### Shadow Scale
```
XS: 0 1px 2px rgba(0,0,0,0.05)
SM: 0 1px 3px rgba(0,0,0,0.1)
MD: 0 4px 6px rgba(0,0,0,0.1)
LG: 0 10px 15px rgba(0,0,0,0.1)
XL: 0 20px 25px rgba(0,0,0,0.1)
```

### Animation Curves
```
Ease Default: cubic-bezier(0.4, 0, 0.2, 1)
Ease Bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
Ease Smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### Z-Index Scale
```
Base: 0
Dropdown: 10
Sticky: 20
Modal Backdrop: 30
Modal: 40
Notification: 50
```

---

## Implementation Notes

1. **CSS Variables**: Use CSS custom properties for all color values to enable easy theming
2. **Responsive**: Mobile-first approach, test at 320px minimum
3. **Accessibility**: Maintain WCAG AA contrast ratios, focus states on all interactive elements
4. **Performance**: Lazy load images, minimize animation on reduced-motion preference
5. **Browser Support**: Modern browsers, graceful degradation for older ones

## Success Metrics
- Page Load: <2s on 3G
- Animation: Consistent 60fps
- Accessibility: 100% keyboard navigable
- Theme Switch: <500ms transition