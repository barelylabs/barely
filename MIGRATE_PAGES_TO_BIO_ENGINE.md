# Migrate Pages to Bio Engine

## Overview

This document outlines the plan to migrate `barely.page` from MDX-based pages to the unified block-based architecture used by `barely.bio`. This will provide a more intuitive building experience while maintaining the distinct mental models of each product.

## Motivation

### Current Issues with MDX Pages

- Data stored in markdown files doesn't cascade update when database records change
- MDX editing is not intuitive for non-technical users
- Brittle system with potential for stale content
- No visual builder interface

### Benefits of Block-Based Architecture

- All content synced to database with proper relationships
- Drag-and-drop visual builder (already built for bio)
- Type-safe with Zod schemas
- Automatic cascade updates when referenced data changes
- Consistent rendering engine across products (less code to maintain)

## Product Differentiation

### barely.bio - "The Hub"

- **Purpose**: Home page for artists/creators/brands
- **Mental Model**: "Here's everything about me/us"
- **Visitor Context**: Coming from various organic sources, exploring options
- **Focus**: Multiple touchpoints, social links, variety of actions

### barely.page - "The Funnel"

- **Purpose**: Landing pages with singular focus
- **Mental Model**: "Do this one specific thing" (e.g. "Buy my album", "Book a call", "Join my newsletter")
- **Visitor Context**: Arriving with intent (ads, email campaigns)
- **Focus**: Single conversion goal, tight messaging

## New Block Types Required

### Core Content Blocks

- [ ] **Embed Block**: YouTube, Spotify, other embeds
- [ ] **Markdown Block**: Basic rich text (headings, lists, bold, italic, links)
- [ ] **Image Block**: Single image with alt text and optional caption
- [ ] **Cart Block**: Button that sends user to cart checkout
- [ ] **Column Block**: Container for other blocks (no nesting, you can't have a column or two-pane block inside a column block)
- [ ] **Two-Pane Block**: Image top, column block bottom (can choose to have image on left or right for desktop, and top or bottom for mobile)

### Future Enhancement Blocks

- [ ] **Form Block**: Triggers form modal (with barely.forms)
- [ ] **CTA Block**: Specialized call-to-action with analytics
- [ ] **Gallery Block**: Multiple images with layout options
- [ ] **Spacer Block**: Precise vertical spacing
- [ ] **Testimonial Block**: Social proof elements
- [ ] **Countdown Block**: Urgency/scarcity for campaigns
- [ ] **Hero Block**: Full-width hero sections

## Technical Implementation

### Phase 1: Extend Block System

1. Create new block types in database schema
2. Add block components to `packages/ui/src/blocks/`
3. Extend bio render engine to handle new blocks
4. Update block editor UI to support new types

### Phase 2: Page Builder Interface

1. Use same builder interface as bio (builders can choose which blocks are available)
2. Customize available blocks per product
3. Add page-specific templates
4. Implement funnel-focused analytics

### Phase 3: Migration Tools

1. Build MDX → blocks converter
2. Create migration script for existing pages
3. Test with subset of pages
4. Run full migration

### Phase 4: Deprecation

1. Maintain MDX support temporarily
2. Monitor adoption of new builder
3. Migrate remaining MDX pages
4. Remove MDX infrastructure

## Database Schema Changes

```typescript
// New block types to add
enum BlockType {
  // Existing bio blocks
  BIO_LINK
  EMAIL_CAPTURE

  // New shared blocks
  MARKDOWN
  IMAGE
  CART
  COLUMN
  TWO_PANE
  EMBED
  GALLERY
  CTA
  SPACER
  TESTIMONIAL
  COUNTDOWN
  HERO
}

// Block availability per product
interface ProductBlockConfig {
  productType: 'bio' | 'page'
  availableBlocks: BlockType[]
  defaultBlocks: BlockType[]
}
```

## Migration Strategy

### Step 1: Parallel Systems (Month 1)

- Keep MDX system running
- Build new blocks in parallel
- Test with internal pages

### Step 2: Soft Launch (Month 2)

- Enable for new pages only
- Gather user feedback
- Iterate on builder UX

### Step 3: Migration Tools (Month 3)

- Build automated MDX converter
- Manual review process
- Migrate high-traffic pages first

### Step 4: Full Migration (Month 4)

- Convert all remaining pages
- Deprecate MDX system
- Remove old code

## UI/UX Considerations

### Builder Differentiation

- Bio builder emphasizes variety and exploration
- Page builder emphasizes focus and conversion
- Different default templates
- Different block recommendations

### Analytics Integration

- Bio: Track engagement across multiple CTAs
- Page: Track funnel metrics and conversion

## Risks & Mitigations

### Risk: Feature Parity

**Mitigation**: Audit all MDX features before migration, ensure blocks cover all use cases

### Risk: Performance Impact

**Mitigation**: Optimize render engine, implement proper caching

### Risk: User Adoption

**Mitigation**: Provide migration assistance, maintain MDX temporarily

### Risk: SEO Impact

**Mitigation**: Ensure proper meta tags, maintain URL structure

## Success Metrics

- [ ] All MDX pages successfully migrated
- [ ] Page load performance maintained or improved
- [ ] User satisfaction with builder interface
- [ ] Reduction in support tickets about page editing
- [ ] Increased page creation velocity

## Timeline Estimate

- **Month 1**: Block system extension
- **Month 2**: Builder interface and soft launch
- **Month 3**: Migration tools and testing
- **Month 4**: Full migration and cleanup
- **Total**: 4 months

## Dependencies

- Bio engine must be stable and well-tested
- Database schema must support new block types
- Rendering engine must handle all block combinations
- Analytics infrastructure must differentiate products

## Next Steps

1. Review and approve this plan
2. Create detailed technical specs for new blocks
3. Set up feature flag for gradual rollout
4. Begin Phase 1 implementation

---

_Note: This migration should be done in a separate feature branch after the bio MVP is complete and stable._
