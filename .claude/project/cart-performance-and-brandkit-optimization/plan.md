# Technical Implementation Plan: Bio Engine Block Extensions (Feature-Organized)

## Feature Summary

Extend the existing bio engine with four new block types (Markdown, Image, Two-Panel, Cart) to enable landing page creation capabilities while leveraging the established block editor infrastructure, rendering pipeline, and UI patterns from the bio MVP.

## Architecture Overview

### System Integration

The feature extends the existing bio engine architecture without requiring new infrastructure:

- **Block Registry**: Extend existing `BioBlockType` enum with new block types
- **Database Schema**: Add new block type variants to existing `bio_blocks` table
- **Editor Framework**: Reuse modal-based editing pattern from Links block
- **Rendering Pipeline**: Extend existing bio page renderer with new block components
- **API Layer**: Extend existing bio CRUD routes with new block validations
- **Component Library**: Leverage `@barely/ui` components and patterns

### Component Structure

```
packages/
├── validators/src/schemas/
│   └── bio-blocks.schema.ts      # Extended block type definitions
├── ui/src/components/bio-blocks/
│   ├── markdown-block.tsx        # New block component
│   ├── image-block.tsx          # New block component
│   ├── two-panel-block.tsx     # New block component
│   └── cart-block.tsx          # New block component
├── lib/src/trpc/routes/
│   └── bio-blocks.route.ts     # Extended CRUD operations
└── db/src/sql/
    └── bio-blocks.sql.ts       # Schema migrations

apps/bio/
├── src/components/blocks/
│   ├── markdown/
│   │   ├── editor.tsx          # Markdown editor modal
│   │   └── renderer.tsx        # Public render component
│   ├── image/
│   │   ├── editor.tsx          # Image picker modal
│   │   └── renderer.tsx        # Responsive image render
│   ├── two-panel/
│   │   ├── editor.tsx          # Layout configuration modal
│   │   └── renderer.tsx        # Responsive panel render
│   └── cart/
│       ├── editor.tsx          # Cart funnel selector
│       └── renderer.tsx        # Checkout button render
```

## Key Technical Decisions

1. **Block Type Extension Strategy**: Add new types to existing enum rather than creating separate landing page blocks table to maintain unified rendering pipeline and avoid data migration complexity.

2. **Markdown Editor Reuse**: Leverage existing markdown editor component from app rather than implementing new editor to ensure consistency and reduce bundle size.

3. **Asset Management Integration**: Use existing asset picker from Links block for image selection to maintain consistent UX and avoid duplicating asset management logic.

4. **Responsive Layout Approach**: Implement CSS Grid with container queries for Two-Panel block rather than JavaScript-based layout to improve performance and reduce layout shift.

5. **Cart Integration Pattern**: Direct link to cart checkout rather than embedded iframe to avoid PCI compliance complexity and maintain page performance.

6. **Block Data Storage**: Store block-specific data in JSONB column with zod validation rather than separate tables per block type to simplify queries and maintain flexibility.

7. **Editor Modal Reuse**: Extend existing modal component system rather than creating new editor UI to maintain consistency and reduce code duplication.

8. **Preview Update Strategy**: Use optimistic updates with rollback on error rather than blocking saves to improve perceived performance.

## Dependencies & Assumptions

### Internal Dependencies
- `@barely/ui` markdown editor component exists and is exportable
- `@barely/files` asset picker supports image selection
- Bio block editor framework supports extensible block types
- Cart funnel system exposes checkout URL generation
- Existing bio page ISR infrastructure handles new block types

### External Dependencies
- Next.js Image component for responsive image optimization
- Markdown parsing library (likely remark/rehype already in use)
- CSS container queries browser support (>95% coverage)

### Technical Assumptions
- Current `bio_blocks` schema uses JSONB for block data storage
- Block type enum can be extended without breaking existing blocks
- Modal editor pattern scales to handle new block configurations
- Asset CDN handles image optimization and delivery
- Cart funnel IDs are workspace-scoped and validated server-side

## Implementation Checklist (Organized by Feature)

### 🏗️ Prerequisites: Shared Infrastructure Setup

These foundational updates must be completed first as all block types depend on them:

**Database Foundation**
- [ ] Create comprehensive migration script for new block types in `bio-blocks.sql.ts`
- [ ] Add indexes for block type queries
- [ ] Implement block data validation triggers
- [ ] Create migration rollback procedures

**Core Block System Updates**
- [ ] Update block type selector UI to include new blocks
- [ ] Extend block reordering to handle new block types
- [ ] Add block type icons for visual identification
- [ ] Implement block duplication functionality
- [ ] Create block template system for common patterns

**Security & Performance Foundation**
- [ ] Implement CSP headers for user-generated content
- [ ] Add rate limiting for block operations
- [ ] Create input sanitization utilities for all text fields
- [ ] Implement file type validation for uploads
- [ ] Add CSRF protection for block mutations
- [ ] Implement block-level caching strategy
- [ ] Create block lazy loading for initial page load
- [ ] Implement CSS containment for layout performance

**Analytics Foundation**
- [ ] Add block interaction tracking events infrastructure
- [ ] Create block render performance metrics system
- [ ] Implement error boundary for block failures
- [ ] Set up block usage analytics pipeline

### 📝 Feature 1: Markdown Block (Complete Implementation)

**Step 1: Data Layer**
- [ ] Add `MARKDOWN` to `BioBlockType` enum in validators package
- [ ] Define `markdownBlockSchema` with content field (max 5000 chars) using zod
- [ ] Create `insertMarkdownBlockSchema` and `updateMarkdownBlockSchema` validators
- [ ] Add markdown block type to database migration

**Step 2: Backend API**
- [ ] Extend `bio-blocks.route.ts` create method to handle markdown block type
- [ ] Add markdown content sanitization using DOMPurify or similar
- [ ] Implement markdown validation to prevent XSS attacks
- [ ] Add content length validation in tRPC route
- [ ] Create markdown preview generation for admin panel

**Step 3: UI Component Package**
- [ ] Create `markdown-block.tsx` in `@barely/ui` package
- [ ] Export markdown editor component for reuse
- [ ] Add markdown parsing utilities

**Step 4: Frontend Editor**
- [ ] Create `apps/bio/src/components/blocks/markdown/editor.tsx`
- [ ] Integrate with existing markdown editor from `@barely/ui`
- [ ] Add real-time preview in editor modal
- [ ] Implement auto-save on blur with debounce
- [ ] Add character count indicator
- [ ] Create mobile-optimized editor layout

**Step 5: Frontend Renderer**
- [ ] Create `apps/bio/src/components/blocks/markdown/renderer.tsx`
- [ ] Implement markdown rendering with remark/rehype pipeline
- [ ] Add proper styling for all markdown elements
- [ ] Ensure responsive typography

**Step 6: Integration**
- [ ] Register markdown block in block type registry
- [ ] Add markdown block to block selector UI
- [ ] Implement markdown block reordering support
- [ ] Wire up create/edit/delete operations

**Step 7: Testing**
- [ ] Write unit tests for markdown sanitization
- [ ] Create E2E test for markdown block CRUD operations
- [ ] Test markdown rendering consistency across devices
- [ ] Verify XSS protection

### 🖼️ Feature 2: Image Block (Complete Implementation)

**Step 1: Data Layer**
- [ ] Add `IMAGE` to `BioBlockType` enum
- [ ] Define `imageBlockSchema` with assetId, caption (optional, 200 chars), altText fields
- [ ] Create insert/update schemas with proper validation
- [ ] Add image block migration to database schema

**Step 2: Backend API**
- [ ] Extend bio-blocks route to handle image block creation
- [ ] Integrate with `@barely/files` for asset validation
- [ ] Implement image dimension validation (max 10MB)
- [ ] Add CDN URL generation for different sizes
- [ ] Create image metadata extraction for alt text suggestions

**Step 3: UI Component Package**
- [ ] Create `image-block.tsx` in `@barely/ui` package
- [ ] Export reusable image display component
- [ ] Add responsive image utilities

**Step 4: Frontend Editor**
- [ ] Create `apps/bio/src/components/blocks/image/editor.tsx`
- [ ] Integrate with asset picker from `@barely/files`
- [ ] Add caption editing with character limit
- [ ] Implement alt text field with accessibility hints
- [ ] Add drag-and-drop image upload support

**Step 5: Frontend Renderer**
- [ ] Create `apps/bio/src/components/blocks/image/renderer.tsx`
- [ ] Implement with Next.js Image component
- [ ] Create responsive image sizing with srcset
- [ ] Add lazy loading with blur placeholder
- [ ] Implement image zoom on click (lightbox)

**Step 6: Integration**
- [ ] Register image block in block registry
- [ ] Add image format validation (JPG, PNG, WebP)
- [ ] Wire up image upload flow
- [ ] Connect to CDN for image delivery

**Step 7: Testing**
- [ ] Write tests for image upload and validation
- [ ] Test responsive image loading performance
- [ ] Verify accessibility with screen readers
- [ ] Test drag-and-drop functionality

### 🎛️ Feature 3: Two-Panel Block (Complete Implementation)

**Step 1: Data Layer**
- [ ] Add `TWO_PANEL` to `BioBlockType` enum
- [ ] Define `twoPanelBlockSchema` with image, title, text, ctaButton, layoutOptions
- [ ] Create layout options schema (imagePosition, mobileStack order)
- [ ] Add CTA validation for URL or Barely asset links
- [ ] Create database migration for two-panel blocks

**Step 2: Backend API**
- [ ] Extend bio-blocks route for two-panel block CRUD
- [ ] Implement asset validation for panel image
- [ ] Add CTA link validation and sanitization
- [ ] Create layout configuration validation
- [ ] Implement text content length limits (title: 100, text: 500)

**Step 3: UI Component Package**
- [ ] Create `two-panel-block.tsx` in `@barely/ui` package
- [ ] Export reusable two-panel layout component
- [ ] Add responsive layout utilities

**Step 4: Frontend Editor**
- [ ] Create `apps/bio/src/components/blocks/two-panel/editor.tsx`
- [ ] Add layout toggle controls (image position)
- [ ] Implement mobile stack order toggle
- [ ] Create CTA button with link picker (URL or asset)
- [ ] Add visual layout preview in editor

**Step 5: Frontend Renderer**
- [ ] Create `apps/bio/src/components/blocks/two-panel/renderer.tsx`
- [ ] Implement with CSS Grid layout
- [ ] Add responsive breakpoint handling
- [ ] Implement container queries for adaptive layouts
- [ ] Ensure proper mobile stacking

**Step 6: Integration**
- [ ] Register two-panel block in block registry
- [ ] Add layout preview icons in editor
- [ ] Implement responsive preview modes
- [ ] Wire up all layout configurations

**Step 7: Testing**
- [ ] Write tests for layout configurations
- [ ] Test responsive behavior across breakpoints
- [ ] Verify CTA link functionality
- [ ] Test image/text combinations

### 🛒 Feature 4: Cart Block (Complete Implementation)

**Step 1: Data Layer**
- [ ] Add `CART` to `BioBlockType` enum
- [ ] Define `cartBlockSchema` with cartFunnelId, title, subtitle fields
- [ ] Create cart funnel validation against workspace funnels
- [ ] Add text length limits (title: 100, subtitle: 200)
- [ ] Create database migration for cart blocks

**Step 2: Backend API**
- [ ] Extend bio-blocks route for cart block operations
- [ ] Implement cart funnel existence validation
- [ ] Add workspace-scoped funnel access control
- [ ] Create checkout URL generation logic
- [ ] Add cart funnel preview data fetching
- [ ] Implement cart availability checking

**Step 3: UI Component Package**
- [ ] Create `cart-block.tsx` in `@barely/ui` package
- [ ] Export reusable cart button component
- [ ] Add checkout flow utilities

**Step 4: Frontend Editor**
- [ ] Create `apps/bio/src/components/blocks/cart/editor.tsx`
- [ ] Implement funnel dropdown selector
- [ ] Add cart funnel preview in editor
- [ ] Create custom button text editing
- [ ] Show funnel details (price, availability)

**Step 5: Frontend Renderer**
- [ ] Create `apps/bio/src/components/blocks/cart/renderer.tsx`
- [ ] Implement checkout button with proper styling
- [ ] Add loading state for checkout redirect
- [ ] Implement sold out/unavailable state handling
- [ ] Create conversion tracking integration

**Step 6: Integration**
- [ ] Register cart block in block registry
- [ ] Integrate with existing cart funnel system
- [ ] Wire up checkout URL generation
- [ ] Connect conversion tracking

**Step 7: Testing**
- [ ] Write tests for cart funnel validation
- [ ] Test checkout flow integration
- [ ] Verify conversion tracking
- [ ] Test edge cases (sold out, invalid funnel)

### 🚀 Feature 5: Final Integration & Polish

**Performance Optimization**
- [ ] Add virtual scrolling for long landing pages
- [ ] Optimize image loading with priority hints
- [ ] Implement progressive enhancement

**Documentation**
- [ ] Create block type documentation for developers
- [ ] Write user guides for each block type
- [ ] Document API changes

**End-to-End Testing**
- [ ] Implement comprehensive E2E test suite
- [ ] Add visual regression tests for block rendering
- [ ] Create load testing for landing pages with many blocks
- [ ] Test complete user journey for each block type

**Analytics & Monitoring**
- [ ] Verify block interaction tracking
- [ ] Test block render performance metrics
- [ ] Validate error boundaries
- [ ] Confirm conversion funnel tracking per block type

**Launch Preparation**
- [ ] Feature flag setup for gradual rollout
- [ ] Migration guide for existing landing pages
- [ ] Performance benchmarking
- [ ] Security audit of all new endpoints