# Bio Landing Page Blocks - Implementation Plan (Updated 2025-08-29 - Phase 3 Complete)

## Current Status

The bio-landing-page-blocks feature branch has completed the foundational database schema and CRUD operations. The next phase focuses on building the UI components for block editors and renderers.

## Completed Work

### ✅ Database Schema Foundation

- Added `BIO_BLOCK_TYPES` constant with 6 block types
- Extended BioBlocks table with block-specific fields
- Implemented multi-purpose reference columns (linkId, bioId, fmId, cartFunnelId)
- Added two-panel layout configuration fields

### ✅ Validation Schemas

- Created block-specific Zod schemas with proper validation
- Implemented two-panel CTA validation rules
- Added refinements for mutually exclusive CTA targets

### ✅ CRUD Routes Enhancement

- Implemented discriminated union for type-safe block creation
- Added foreign key validation for all references
- Created input field mapping to avoid naming conflicts

## Architecture Decisions

1. **Multi-Purpose Columns**: Same columns serve different purposes across block types for flexibility
2. **Discriminated Union CRUD**: TypeScript knows exactly which fields are required per block type
3. **Input Field Renaming**: Clear separation between parent bioId and CTA target references
4. **Modal Pattern**: Follow Links block pattern for editors
5. **Asset Management**: Reuse existing asset picker from Links block
6. **Responsive Design**: Mobile-first with CSS Grid and container queries

## Dependencies & Requirements

**UI Dependencies:**

- `@barely/ui` for form components and asset pickers
- `@barely/hooks` for useZodForm
- shadcn/ui Select and Command components
- React Hook Form for form state
- remark/rehype for markdown parsing

**Existing Patterns to Follow:**

- Links block modal editor pattern
- Asset picker from Files module
- Form validation with Zod schemas
- Optimistic updates with rollback

## Implementation Phases

### Phase 1: UI Component Infrastructure ✅

#### 1.1 Asset Selector Component (Critical for Two-Panel Block) ✅

**Location**: `packages/ui/src/components/asset-selector.tsx`

**Implementation Tasks:**

- [x] Create base AssetSelector component with type dropdown
- [x] Implement URL input with validation
- [x] Add Bio searchable dropdown (fetch workspace bios)
- [x] Add FM searchable dropdown (placeholder - table not available)
- [x] Add Cart funnel dropdown
- [x] Add Link dropdown for short links
- [x] Implement field clearing when switching types
- [x] Add loading states and error handling
- [x] Create preview of selected asset

---

### Phase 2: Block Editor Components ✅

#### 2.1 Markdown Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-markdown-page.tsx`

**Implementation Tasks:**

- [x] Create modal wrapper using Sheet from shadcn/ui
- [x] Integrate markdown editor from @barely/ui
- [x] Add character count (max 5000)
- [x] Implement real-time preview
- [x] Add auto-save with debounce
- [x] Handle form submission with optimistic updates

#### 2.2 Image Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-image-page.tsx`

**Implementation Tasks:**

- [x] Integrate asset picker from @barely/files
- [x] Add caption field (max 200 chars)
- [x] Add alt text field with hints
- [x] Show image preview with dimensions
- [x] Support drag-and-drop upload
- [x] Implement image optimization settings

#### 2.3 Two-Panel Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-two-panel-page.tsx`

**Implementation Tasks:**

- [x] Create form with title and markdown fields
- [x] Integrate image picker (required)
- [x] Add layout controls (desktop/mobile sides)
- [x] Integrate AssetSelector for CTA
- [x] Validate CTA text requires target
- [x] Create visual preview of layout
- [x] Handle responsive preview modes

---

#### 2.4 Cart Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-cart-page.tsx`

**Implementation Tasks:**

- [x] Create cart funnel selector dropdown
- [x] Add optional title/subtitle overrides
- [x] Show preview of funnel products
- [x] Implement funnel validation
- [x] Add product count display

### Phase 3: Block Renderer Components ✅

These are used in @barely/ui/src/bio/bio-blocks-render.tsx and are split into their own files in @barely/ui/src/bio/blocks.

#### 3.1 Markdown Renderer ✅

**Location**: `packages/ui/src/bio/blocks/markdown-block.tsx`

**Completed Tasks:**

- [x] Parse markdown with MDXClient (next-mdx-remote-client)
- [x] Apply typography styles from brand kit
- [x] Sanitize HTML for security (built into MDX)
- [x] Handle markdown elements (headings, lists, quotes, code)
- [x] Support for links with external target

#### 3.2 Image Renderer ✅

**Location**: `packages/ui/src/bio/blocks/image-block.tsx`

**Completed Tasks:**

- [x] Use Next.js Image component
- [x] Implement responsive sizing with sizes prop
- [x] Add lazy loading with blur placeholder
- [x] Optional lightbox on click with fade animation
- [x] Handle missing images gracefully (early return)
- [x] Hover effects with scale animation

---

#### 3.3 Two-Panel Renderer ✅

**Location**: `packages/ui/src/bio/blocks/two-panel-block.tsx`

**Completed Tasks:**

- [x] Create CSS Grid layout for desktop (2 columns)
- [x] Handle responsive breakpoint at 768px
- [x] Implement all CTA target types:
  - Direct URL navigation
  - Bio page linking
  - FM page linking (placeholder)
  - Cart funnel checkout
  - Short link tracking
- [x] Desktop/mobile layout configuration
- [x] Handle missing images/content

#### 3.4 Cart Renderer ✅

**Location**: `packages/ui/src/bio/blocks/cart-block.tsx`

**Completed Tasks:**

- [x] Display cart products from funnel
- [x] Product cards with images and descriptions
- [x] Show pricing with discounts
- [x] Add direct checkout button
- [x] Total value calculation
- [x] Special offer badges

### Phase 4: Integration & Testing

These should be patterned after @apps/app/src/app/[handle]/bio/\_components/bio-links-page.tsx. The main difference is that we will be using the new block types and the new block editor components. The root block management page already exists in @apps/app/src/app/[handle]/bio/\_components/bio-blocks-page.tsx. Those 2 pages should give enough context to implement the new block management UI.

#### 4.1 Block Management UI

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-blocks-page.tsx`

**Implementation Tasks:**

- [ ] Update to handle new block types
- [ ] Add block type icons and descriptions
- [ ] Implement block preview cards
- [ ] Add drag-and-drop reordering
- [ ] Create block duplication feature
- [ ] Add bulk enable/disable actions

---

#### 4.2 Database Migration

**Migration Tasks:**

- [ ] Add composite indexes for queries

#### 4.3 End-to-End Testing

**Test Coverage:**

- [ ] Test creating each block type
- [ ] Test editing block properties
- [ ] Test CTA validation rules
- [ ] Test foreign key validations
- [ ] Test responsive layouts
- [ ] Test accessibility standards

### Phase 5: Performance Optimization

**Optimization Tasks:**

- [ ] Lazy load block editors
- [ ] Code-split renderer components
- [ ] Optimize image loading
- [ ] Implement virtual scrolling for long bio pages
- [ ] Add prefetching for likely navigations
- [ ] Cache rendered markdown

---

## Known Issues & TODOs

1. **FM Table Integration**: `fmId` field exists but FM table not imported yet
2. **Migration Pending**: Need to handle ctaLinkId → linkId rename in existing data
3. **Performance**: Consider adding composite indexes for common queries
4. **Contact Form Block**: Schema exists but implementation deferred
5. **Links Block**: Integration needed with existing links system

---

## Implementation Priority

1. **Critical Path** (Phase 1-2):

   - Asset Selector component (blocks Two-Panel CTA)
   - Markdown and Image editors (most common blocks)
   - Basic renderers for content display

2. **Enhanced Features** (Phase 3-4):

   - Two-Panel and Cart blocks
   - Advanced editing features
   - Testing and migration

3. **Polish** (Phase 5):
   - Performance optimizations
   - Advanced UI features
   - Analytics integration

---

## Next Session Commands

```bash
# Continue development
cd /Users/barely/hub/.repos/barely/worktrees/feature/bio-landing-page-blocks

# Push database changes if needed
pnpm db:push

# Run type checking
pnpm typecheck

# Start development
pnpm dev
```

## Success Metrics

- All 6 block types fully functional
- Clean TypeScript with no type assertions
- Responsive design working on all devices
- CTA validation preventing invalid states
- Smooth editing experience with optimistic updates
- Fast page loads with lazy-loaded blocks
