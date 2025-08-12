# Dual-Sidebar Navigation Architecture

## Overview

This document outlines the new dual-sidebar navigation architecture for barely.ai, designed to support both the full application experience and focused app variants (barely.fm, barely.link, etc.).

## Architecture Components

### 1. Left Sidebar (Product Switcher)
- **Width**: 64px collapsed, 200px expanded
- **Purpose**: Switch between products and access meta features
- **Behavior**: Always visible, icons with tooltips

### 2. Second Sidebar (Contextual Navigation)  
- **Width**: 240px
- **Purpose**: Navigate within selected product
- **Behavior**: Content changes based on selected product

### 3. Main Content Area
- **Width**: Remaining space
- **Purpose**: Primary workspace

## Product Hierarchy

### Core Products (Standalone Apps)
These can exist as independent applications with their own pricing:

| Product | Icon | Key | Description | Standalone URL |
|---------|------|-----|-------------|----------------|
| FM | 📻 | `fm` | Playlist pitching & streaming tools | app.barely.fm |
| Links | 🔗 | `links` | URL shortener with analytics | app.barely.link |
| Pages | 📄 | `pages` | Bio & landing pages | app.barely.page |
| Press | 🎭 | `press` | Press kits & EPKs | app.barely.press |
| VIP | 🎫 | `vip` | Fan experiences & swaps | app.barely.vip |

### Meta Products (Enhancement Layers)
These features enhance core products and monetize through usage/percentage:

| Product | Icon | Key | Description | Monetization |
|---------|------|-----|-------------|--------------|
| Merch | 🛍️ | `merch` | Commerce layer | % of sales |
| Email | 📧 | `email` | Communication layer | Per send/subscriber |
| Flows | 🔄 | `flows` | Automation layer | Per automation |
| Fans | 👥 | `fans` | CRM layer | Included/tiered |
| Analytics | 📊 | `analytics` | Insights layer | Included |
| Media | 🎵 | `media` | Asset library | Storage limits |

## Navigation Structure

```
┌─────────────────┬─────────────────┬──────────────────┐
│  Left Sidebar   │ Second Sidebar  │   Main Content   │
│                 │                 │                  │
│ [Workspace ▼]   │ Product Nav     │                  │
│                 │                 │                  │
│ ● FM           │ > FM Pages      │                  │
│ ○ Links        │ > Analytics     │   [Content]      │
│ ○ Pages        │ > Settings      │                  │
│ ○ Press        │                 │                  │
│ ○ VIP          │                 │                  │
│ ─────────────  │                 │                  │
│ ○ Merch        │                 │                  │
│ ○ Email        │                 │                  │
│ ○ Flows        │                 │                  │
│ ○ Fans         │                 │                  │
│ ○ Analytics    │                 │                  │
│ ○ Media        │                 │                  │
│ ─────────────  │                 │                  │
│ ⚙ Settings     │                 │                  │
│ ? Help         │                 │                  │
└─────────────────┴─────────────────┴──────────────────┘
```

## Contextual Navigation Examples

### When FM is selected:
```
Second Sidebar:
├── FM Pages
│   ├── Active Campaigns
│   ├── Drafts
│   └── Archive
├── Playlists
│   ├── Submitted
│   ├── Approved
│   └── Rejected
├── Analytics
│   ├── Overview
│   ├── Playlist Stats
│   └── Geographic Data
└── Settings
    ├── Spotify Integration
    └── Auto-pitch Rules
```

### When Links is selected:
```
Second Sidebar:
├── My Links
│   ├── All Links
│   ├── Active
│   └── Archived
├── Domains
├── QR Codes
├── Analytics
│   ├── Overview
│   ├── Click Stats
│   └── UTM Performance
└── Settings
    ├── Default Domain
    └── Link Redirects
```

### When Merch is selected (Meta Product):
```
Second Sidebar:
├── Products
│   ├── All Products
│   ├── Physical
│   └── Digital
├── Orders
│   ├── Pending
│   ├── Processing
│   └── Completed
├── Carts
│   ├── Abandoned
│   └── Recovered
├── Analytics
│   ├── Sales
│   └── Product Performance
└── Settings
    ├── Payment Methods
    └── Shipping Zones
```

## App Variant Behavior

### Full App (app.barely.ai)
- All products visible and accessible
- User can switch freely between products
- Full navigation within each product

### FM Variant (app.barely.fm)
```
Left Sidebar:
┌─────────────┐
│ [Workspace] │
├─────────────┤
│ ● FM       │ ← Primary (active)
├─────────────┤
│ 🔒 Links    │ ← Locked (upgrade prompt)
│ 🔒 Pages    │ ← Locked
│ 🔒 Press    │ ← Locked
│ 🔒 VIP      │ ← Locked
├─────────────┤
│ ○ Merch    │ ← Available (add-on)
│ ○ Email    │ ← Available (add-on)
│ ○ Flows    │ ← Limited (FM flows only)
│ ○ Fans     │ ← Limited (FM fans only)
│ ○ Analytics│ ← Limited (FM stats only)
│ ○ Media    │ ← Available
├─────────────┤
│ ⚙ Settings │
└─────────────┘
```

## Visual Design Specifications

### Left Sidebar
- **Background**: `bg-accent` (same as current)
- **Active Product**: Solid background pill with spring animation
- **Hover State**: Subtle background on hover
- **Icons**: 20x20px, consistent style
- **Tooltips**: Animated on hover with 200ms delay

### State Indicators
| State | Visual Treatment |
|-------|-----------------|
| Active | Background pill, filled icon |
| Available | Normal opacity, outline icon |
| Locked | 50% opacity, lock badge |
| Hover | 10% background, cursor pointer |

### Responsive Behavior
| Breakpoint | Left Sidebar | Second Sidebar | Behavior |
|------------|--------------|----------------|----------|
| Desktop (>1280px) | Expanded (200px) | Visible (240px) | Full experience |
| Tablet (768-1280px) | Collapsed (64px) | Visible (200px) | Icons only in left |
| Mobile (<768px) | Hidden | Hidden | Hamburger menu |

## Implementation Phases

### Phase 1: Core Structure
1. Create `ProductSidebar` component (left)
2. Create `ContextSidebar` component (second)
3. Update layout to accommodate dual sidebars
4. Move workspace switcher to top of left sidebar

### Phase 2: Product Integration
1. Define product configurations
2. Implement product switching logic
3. Create contextual navigation for each product
4. Add route handling for product switches

### Phase 3: App Variant Support
1. Integrate with existing app variant detection
2. Implement product locking/unlocking
3. Add upgrade prompts for locked products
4. Filter contextual navigation based on features

### Phase 4: Polish
1. Add animations and transitions
2. Implement keyboard navigation
3. Add tooltips and help text
4. Optimize for mobile

## Migration Path

### From Current Navigation
1. Map existing routes to new product structure
2. Preserve all existing functionality
3. Add redirects for old URLs
4. Maintain backward compatibility

### Data Structure
```typescript
interface Product {
  id: string;
  name: string;
  icon: string;
  type: 'core' | 'meta';
  requiredFeatures?: AppFeature[];
  routes: Route[];
  defaultRoute: string;
}

interface Route {
  path: string;
  label: string;
  icon?: string;
  children?: Route[];
  requiredFeature?: AppFeature;
}

interface NavigationState {
  activeProduct: string;
  expandedSections: string[];
  leftSidebarCollapsed: boolean;
}
```

## Benefits

1. **Clarity**: Clear separation between products
2. **Scalability**: Easy to add new products
3. **Focus**: Reduces cognitive load
4. **Monetization**: Natural upgrade paths
5. **Consistency**: Unified experience across variants

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| User confusion during migration | Onboarding tour, gradual rollout |
| Lost functionality | Complete feature mapping before launch |
| Mobile complexity | Progressive disclosure, tested patterns |
| Performance impact | Lazy load product modules |

## Success Metrics

- Navigation clicks per session (should decrease)
- Time to first meaningful action (should decrease)
- Upgrade conversion from locked products
- User satisfaction scores
- Support tickets about navigation

## Open Questions

1. Should meta products have their own URLs (e.g., merch.barely.ai)?
2. How do we handle deep linking within products?
3. Should keyboard shortcuts be global or product-specific?
4. What's the upgrade flow when clicking locked products?

---

*Created: 2025-01-09*
*Status: Draft*
*Version: 1.0*