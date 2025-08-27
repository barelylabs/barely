# Color System Migration Status

## Overview
Migrating from a single colorScheme to separate bio/cart color mappings with OKLCH colors.

## Changes Completed

### 1. Database Schema (`packages/db/src/sql/brand-kit.sql.ts`)
- Added new columns:
  - `color1`, `color2`, `color3` - OKLCH color strings
  - `bioColorScheme` - Bio-specific color mappings
  - `cartColorScheme` - Cart-specific color mappings
- Kept legacy `colorScheme` for backwards compatibility

### 2. Validators (`packages/validators/src/schemas/brand-kit.schema.ts`)
- Created new schemas:
  - `bioColorSchemeSchema` - Bio color mapping validation
  - `cartColorSchemeSchema` - Cart color mapping validation
  - `oklchColorSchema` - OKLCH format validation
- Updated types: `BioColorScheme`, `CartColorScheme`
- Updated `defaultBrandKit` with OKLCH colors

### 3. BrandKitProvider (`packages/ui/src/bio/contexts/brand-kit-context.tsx`)
- Modified to inject CSS variables from colorScheme
- Uses `display: contents` to avoid layout issues
- Variables: `--brandKit-bg`, `--brandKit-text`, `--brandKit-block`, `--brandKit-block-text`, `--brandKit-banner`

### 4. Tailwind Config (`tooling/tailwind/index.ts`)
- Added brandKit color mappings:
  ```js
  brandKit: {
    bg: 'var(--brandKit-bg)',
    text: 'var(--brandKit-text)',
    block: 'var(--brandKit-block)',
    'block-text': 'var(--brandKit-block-text)',
    banner: 'var(--brandKit-banner)',
  }
  ```

### 5. Cart App Updates
- **layout.tsx**: Removed `extractHueFromColor` and hue-based system
- **checkout-form.tsx**: Updated to use brandKit color classes
  - Left panel: `bg-brandKit-bg text-brandKit-text`
  - Right panel: `bg-brandKit-block text-brandKit-block-text`
- **elements-provider.tsx**: Removed theme prop, uses CSS variables
- **checkout/page.tsx**: Removed BrandKit fetching and color extraction

### 6. Constants Updated (`packages/const/src/brand-kit.constants.ts`)
- Added new interfaces:
  - `BioColorMapping` - Bio-specific mapping structure
  - `CartColorMapping` - Cart-specific mapping structure
- Updated `BrandKitColorPreset` interface with new structure
- Color conversion complete (hex → OKLCH) for all presets

## Remaining Tasks

### 1. Update All Color Presets in `packages/const/src/brand-kit.constants.ts`
All 18 presets need the new structure. Example for 'emerald-sea':
```typescript
'emerald-sea': {
  name: 'Emerald Sea',
  type: 'neutral',
  colors: ['oklch(0.32 0.052 203)', 'oklch(0.78 0.112 189)', 'oklch(0.99 0.013 145)'],
  bioMapping: {
    bgColor: 2,      // Light background for bio
    textColor: 0,    // Dark text
    blockColor: 0,   // Dark blocks for impact
    blockTextColor: 2, // Light text on blocks
    bannerColor: 1,  // Medium accent banner
  },
  cartMapping: {
    bgColor: 2,      // Light background for cart
    textColor: 0,    // Dark text
    blockColor: 1,   // Accent color for CTAs
    blockTextColor: 2, // Light text on accents
  },
  // Legacy for backwards compatibility
  colorScheme: {
    colors: ['oklch(0.32 0.052 203)', 'oklch(0.78 0.112 189)', 'oklch(0.99 0.013 145)'],
    mapping: { /* original mapping */ },
  },
}
```

### 2. Update `apps/app/src/app/[handle]/bio/design/color-customizer.tsx`
- Update to handle new structure with separate bio/cart mappings
- Modify `handlePresetSelect` to use new preset structure
- Update `CustomColorPicker` to work with `color1`, `color2`, `color3`
- Update shuffle functionality for new mapping structure

### 3. Update `shuffleColorMapping` Utility
Location: `packages/utils/src/brand-kit.ts` (or similar)
- Needs to handle both `bioMapping` and `cartMapping`
- Should shuffle both mappings when called
- Maintain consistency between bio and cart where appropriate

### 4. Update `getComputedStyles` Function
Location: `packages/utils/src/brand-kit.ts`
- Currently uses legacy `colorScheme.mapping`
- Needs to detect context (bio vs cart) and use appropriate mapping
- For cart context, use `cartColorScheme`
- For bio context, use `bioColorScheme`

## Color Mapping Philosophy

### Bio Pages
- **Goal**: Bold, attention-grabbing, expressive
- **Approach**: Can use darker backgrounds, high contrast
- **Typical mapping**: Background can be any color, blocks can be bold

### Cart Pages  
- **Goal**: Professional, conversion-focused, trustworthy
- **Approach**: Light backgrounds, colors as accents
- **Typical mapping**: Light bg (index 0 or 2), accent for CTAs (index 1)

## Testing Checklist
- [ ] BrandKitProvider injects correct CSS variables
- [ ] Cart checkout uses correct colors from cartColorScheme
- [ ] Bio pages use correct colors from bioColorScheme
- [ ] Color customizer can update both mappings
- [ ] Shuffle works for both bio and cart contexts
- [ ] Legacy colorScheme still works for backwards compatibility