# Bio Landing Page Blocks - Implementation Checkpoint

## Date: 2025-08-29 (Updated - Phase 3 Completed)

## What's Been Completed

### 1. Database Schema Foundation ✅

#### Block Type Constants

- Added `BIO_BLOCK_TYPES` constant in `packages/const/src/bio.constants.ts`
- Includes 6 types: `'links', 'contactForm', 'cart', 'markdown', 'image', 'twoPanel'`

#### BioBlocks Table Structure

Located in `packages/db/src/sql/bio.sql.ts`, the BioBlocks table now includes:

**Core Fields:**

- Standard fields: `id`, `workspaceId`, `type`, `enabled`, `name`, `title`, `subtitle`

**Block-Specific Fields:**

- `markdown` (text) - Content for markdown and twoPanel blocks
- `imageFileId` - References Files table for image/twoPanel blocks
- `imageCaption` (varchar 200) - Optional image caption
- `imageAltText` (varchar 255) - Optional alt text

**Two-Panel Specific:**

- `imageMobileSide` (enum: 'top', 'bottom')
- `imageDesktopSide` (enum: 'left', 'right')
- `ctaText` (varchar 100) - Button text
- `ctaUrl` (varchar 500) - Direct URL option

**Multi-Purpose Asset References:**

- `linkId` - References Links table (for short links)
- `bioId` - References another Bio page
- `fmId` - References FM page (table not imported yet)
- `cartFunnelId` - References CartFunnels table

**Important Design Decision:** These reference fields are multi-purpose. For twoPanel blocks, they serve as CTA targets (only one should be set). For cart blocks, `cartFunnelId` is the main reference. Future blocks can reuse these fields contextually.

### 2. Validation Schemas ✅

Located in `packages/validators/src/schemas/bio.schema.ts`:

#### Block-Specific Schemas

```typescript
markdownBlockDataSchema - max 5000 chars
imageBlockDataSchema - requires imageFileId, optional caption/alt
twoPanelBlockDataSchema - includes refinements for CTA validation
cartBlockDataSchema - requires cartFunnelId
```

#### Two-Panel CTA Validation Rules

- If `ctaText` is provided, at least one target must be set
- Only one CTA target can be set at a time
- Validates URL format when using `ctaUrl`

### 3. CRUD Routes Enhancement ✅

Located in `packages/lib/src/trpc/routes/bio.route.ts`:

#### createBlock Mutation

- Uses discriminated union for type-safe input validation
- Each block type has its own input schema with required/optional fields
- **Input naming strategy**: Uses `targetBioId` and `targetCartFunnelId` in input to avoid conflicts with parent `bioId`
- Maps CTA fields to generic database columns based on block type
- Validates all foreign key references belong to workspace

#### updateBlock Mutation

- Validates foreign key references when updating
- Checks workspace ownership for all referenced entities

#### Key Validation Logic

- Image files must exist and belong to workspace
- Target bios must exist and belong to workspace
- Cart funnels must exist and belong to workspace
- Links must exist and belong to workspace

### 4. Asset Selector Component ✅

Located in `packages/ui/src/components/asset-selector.tsx`:

#### Features Implemented

- **Type-safe asset selection** with discriminated union value type
- **Dynamic input fields** based on selected asset type
- **Searchable dropdowns** using Command component for:
  - Bio pages (handle/key display)
  - Cart funnels (name display)
  - Short links (key/url display)
- **URL input** with proper validation for direct URLs
- **FM placeholder** for future implementation
- **Field clearing** when switching between asset types
- **Loading states** with spinner indicators
- **Asset preview** showing selected item details
- **Full TypeScript support** with proper generics for form integration

#### Integration Points

- Uses `useTRPC` for data fetching
- Compatible with React Hook Form via Controller
- Follows existing UI patterns from `@barely/ui/forms`
- Exports through `packages/ui/src/components/index.ts`

### 5. Block Editor Components ✅

All block editor components have been successfully implemented:

#### Markdown Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-markdown-page.tsx`

**Implemented Features:**
- MDXEditor integration from `@barely/ui`
- Auto-save with 1.5 second debounce
- Character count with 5000 max limit
- Visual saving indicator
- Settings tab for title/subtitle
- Follows Links block pattern

#### Image Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-image-page.tsx`

**Implemented Features:**
- Upload dropzone with drag-and-drop
- Media library selector
- Caption field (max 200 chars)
- Alt text field (max 255 chars) with accessibility hints
- Image preview with actual dimensions
- Replace image functionality
- Auto-save on image selection

#### Two-Panel Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-two-panel-page.tsx`

**Implemented Features:**
- Required title field
- Markdown content field (max 1000 chars)
- Image upload/selection (required)
- Layout controls:
  - Desktop: Image Left/Right toggle
  - Mobile: Image Top/Bottom toggle
- CTA configuration:
  - CTA text field (optional)
  - Asset selector integration (required when CTA text present)
- Visual layout preview for desktop and mobile
- Form validation for CTA completeness

#### Cart Block Editor ✅

**Location**: `apps/app/src/app/[handle]/bio/_components/bio-cart-page.tsx`

**Implemented Features:**
- Searchable cart funnel dropdown using Command component
- Preview of selected funnel with product list
- Optional title/subtitle overrides
- Product count and pricing display
- Warning for empty funnels
- Settings tab placeholder for future options

### 3. Block Renderer Components ✅

#### Markdown Renderer ✅

**Location**: `packages/ui/src/bio/blocks/markdown-block.tsx`

**Implemented Features:**
- MDXClient integration for markdown parsing
- Custom typography components with brand kit styles
- Support for headings, paragraphs, lists, blockquotes
- Code blocks with syntax highlighting
- Links with external target
- HTML sanitization built into MDX

#### Image Renderer ✅

**Location**: `packages/ui/src/bio/blocks/image-block.tsx`

**Implemented Features:**
- Next.js Image component with responsive sizing
- Lazy loading with blur placeholder
- Click-to-expand lightbox modal
- Hover animation effects
- Caption display
- Alt text support for accessibility

#### Two-Panel Renderer ✅

**Location**: `packages/ui/src/bio/blocks/two-panel-block.tsx`

**Implemented Features:**
- CSS Grid layout for desktop (2-column)
- Stack layout for mobile
- Responsive breakpoint at 768px
- All CTA target types handled:
  - Direct URL with external target
  - Bio page linking
  - FM placeholder (not implemented yet)
  - Cart funnel checkout
  - Short link redirect
- Image side configuration (left/right desktop, top/bottom mobile)
- MDX content rendering with brand kit styles

#### Cart Renderer ✅

**Location**: `packages/ui/src/bio/blocks/cart-block.tsx`

**Implemented Features:**
- Product cards with images and descriptions
- Price calculations with discounts
- Main, bump, and upsell product display
- Total value calculation
- Checkout button with dynamic text
- Special offer badges
- Responsive product layouts

#### Integration with Main Renderer ✅

**Location**: `packages/ui/src/bio/bio-blocks-render.tsx`

**Updates:**
- Added imports for all new block components
- Switch statement to render different block types
- Type assertions for proper TypeScript narrowing
- Preserved existing links block rendering

## Next Steps

### Phase 4: Integration & Testing

## Technical Decisions & Rationale

### Why Multi-Purpose Columns Instead of Separate CTA Fields?

- **Flexibility**: Same columns can be reused for different purposes across block types
- **Simplicity**: Avoids proliferation of nullable columns
- **Future-proof**: New block types can reuse existing references
- **Clean**: One bio reference column serves both CTA and future bio-to-bio blocks

### Why Discriminated Union in CRUD Routes?

- **Type Safety**: TypeScript knows exactly which fields are required for each block type
- **Validation**: Zod can enforce block-specific rules at compile time
- **Clear Intent**: Input shape clearly indicates the block type being created

### Why Rename Input Fields (targetBioId vs bioId)?

- **Avoid Conflicts**: Parent bioId (which bio owns this block) vs targetBioId (CTA destination)
- **Clarity**: Makes the intent explicit in the API
- **Mapping Layer**: Clean separation between API contract and database schema

## Current File State

### Modified Files

1. `packages/const/src/bio.constants.ts` - Added BIO_BLOCK_TYPES
2. `packages/db/src/sql/bio.sql.ts` - Extended BioBlocks table
3. `packages/validators/src/schemas/bio.schema.ts` - Added block schemas
4. `packages/lib/src/trpc/routes/bio.route.ts` - Enhanced CRUD operations with support for all block types
5. `packages/ui/src/components/asset-selector.tsx` - New component for CTA target selection
6. `packages/ui/src/components/index.ts` - Exported AssetSelector
7. `packages/ui/src/bio/bio-blocks-render.tsx` - Integrated all new block renderers
8. `apps/app/src/app/[handle]/bio/_components/bio-blocks-page.tsx` - Temporary type fix for block creation

### New Files (Phase 3)

9. `packages/ui/src/bio/blocks/markdown-block.tsx` - Markdown block renderer
10. `packages/ui/src/bio/blocks/image-block.tsx` - Image block renderer with lightbox
11. `packages/ui/src/bio/blocks/two-panel-block.tsx` - Two-panel block renderer with responsive layouts
12. `packages/ui/src/bio/blocks/cart-block.tsx` - Cart block renderer with product cards

## Testing Checklist

### Database & CRUD (Phase 1-2) ✅
- [x] Database migration completes successfully
- [x] Can create markdown block with content
- [x] Can create image block with file reference
- [x] Can create two-panel block with all layout options
- [x] Can create cart block with funnel reference
- [x] CTA validation rejects multiple targets
- [x] CTA validation requires target when text provided
- [x] All foreign key validations work correctly
- [x] Update operations maintain data integrity

### Rendering (Phase 3) - To Test
- [ ] Markdown blocks render with proper styling
- [ ] Images display with lazy loading and blur
- [ ] Lightbox opens on image click
- [ ] Two-panel layout switches between desktop/mobile
- [ ] CTA buttons navigate to correct targets
- [ ] Cart products display with pricing
- [ ] All blocks respect brand kit styles
- [ ] Blocks render in correct order

## Known Issues & TODOs

1. **Performance**: Consider adding composite indexes for common queries

## Commands for Next Session

```bash
# Continue where we left off
cd /Users/barely/hub/.repos/barely/worktrees/feature/bio-landing-page-blocks

# Push database changes
pnpm db:push

# Type check
pnpm typecheck

# Start development
pnpm dev
```

## Architecture Decisions for UI Implementation

### Modal Pattern (from Links block)

- Use sheet/dialog from shadcn/ui
- Form state managed by useZodForm
- Optimistic updates with rollback on error
- Loading states during save

### Asset Management Pattern

- Reuse existing asset picker from Links block
- Integrate with workspace file management
- Support drag-and-drop where applicable

### Responsive Design Strategy

- Mobile-first approach
- CSS Grid with container queries for Two-Panel
- Consistent breakpoint at 768px
- Touch-friendly controls on mobile

This checkpoint captures the current state and provides clear direction for continuing the implementation.
