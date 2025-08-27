# Bio Render Components: Migration from JavaScript Styles to CSS Classes

## Executive Summary
This document outlines the complete migration plan for converting the Bio render components from using inline JavaScript styles to Tailwind CSS classes. The system already has CSS variables set up for brandKit colors in oklch format, so we'll leverage these existing variables through Tailwind classes.

## Current System Architecture

### CSS Variables Setup
The BrandKitProvider (`packages/ui/src/bio/contexts/brand-kit-context.tsx`) already sets up CSS variables:
- `--brandKit-bg`: Background color
- `--brandKit-text`: Text color  
- `--brandKit-block`: Block/button color
- `--brandKit-block-text`: Block/button text color
- `--brandKit-banner`: Banner color
- `--brandKit-color-0/1/2`: Raw colors for flexibility

### Tailwind Configuration
The Tailwind config (`tooling/tailwind/index.ts`) already defines these as color utilities:
```javascript
brandKit: {
  bg: 'var(--brandKit-bg)',
  text: 'var(--brandKit-text)',
  block: 'var(--brandKit-block)',
  'block-text': 'var(--brandKit-block-text)',
  banner: 'var(--brandKit-banner)',
  'color-0': 'var(--brandKit-color-0)',
  'color-1': 'var(--brandKit-color-1)',
  'color-2': 'var(--brandKit-color-2)',
}
```

This means we can use classes like:
- `bg-brandKit-bg`, `text-brandKit-text`
- `bg-brandKit-block`, `text-brandKit-block-text`
- `border-brandKit-block`, etc.

## Migration Tasks

### 1. Update bio-bio-render.tsx
**File:** `/apps/bio/src/app/[handle]/bio-bio-render.tsx`

**Current Implementation (lines 123-163):**
```typescript
// Helper function to convert hex to oklch and reduce lightness
function hexToOklchDarker(hex: string, lightnessReduction = 0.2): string {
  return `oklch(from ${hex} calc(l - ${lightnessReduction}) c h)`;
}

// In component:
<div
  className={'min-h-screen'}
  style={{
    backgroundColor: hexToOklchDarker(bgColor, 0.3),
  }}
>
```

**New Implementation:**
```typescript
// Remove hexToOklchDarker function entirely

// In component:
<div className='min-h-screen bg-black/30 dark:bg-black/50'>
  <div className='mx-auto max-w-xl bg-brandKit-bg px-0 py-0 sm:px-4 sm:py-12'>
    {/* Inner content with normal brandKit background */}
  </div>
</div>

// OR use a CSS custom property with calc:
<div 
  className='min-h-screen'
  style={{
    backgroundColor: 'oklch(from var(--brandKit-bg) calc(l - 0.3) c h)'
  }}
>
```

### 2. Update BioContentAroundBlocks
**File:** `/packages/ui/src/bio/bio-content-around-blocks.tsx`

**Current Implementation (lines 20-35):**
```typescript
<div
  className={cn(
    'flex h-full flex-col justify-between gap-4 py-5',
    brandKit.blockStyle !== 'full-width' && 'px-6',
    !isPreview ?
      'min-h-screen sm:min-h-[calc(100vh-96px)] sm:rounded-2xl sm:shadow-2xl'
    : 'min-h-[700px]',
  )}
  style={{
    backgroundColor: brandKit.colorScheme.colors[brandKit.colorScheme.mapping.backgroundColor],
    fontFamily: computedStyles.fonts.bodyFont || "'Inter', sans-serif",
    color: computedStyles.colors.text,
  }}
>
```

**New Implementation:**
```typescript
<div
  className={cn(
    'flex h-full flex-col justify-between gap-4 py-5',
    'bg-brandKit-bg text-brandKit-text', // Add brandKit classes
    brandKit.blockStyle !== 'full-width' && 'px-6',
    !isPreview ?
      'min-h-screen sm:min-h-[calc(100vh-96px)] sm:rounded-2xl sm:shadow-2xl'
    : 'min-h-[700px]',
    getBrandKitFontClass(computedStyles.fonts.bodyFont, 'body'), // Helper function
  )}
>
```

### 3. Update BioBlocksRender
**File:** `/packages/ui/src/bio/bio-blocks-render.tsx`

**Current Implementation Examples:**

**Block titles (lines 52-74):**
```typescript
<Text
  variant='md/semibold'
  style={{
    color: computedStyles.colors.text,
    fontFamily: computedStyles.fonts.headingFont,
  }}
>
  {block.title}
</Text>
```

**New Implementation:**
```typescript
<Text
  variant='md/semibold'
  className={cn(
    'text-brandKit-text',
    getBrandKitFontClass(computedStyles.fonts.headingFont, 'heading')
  )}
>
  {block.title}
</Text>
```

**Link buttons (lines 107-176):**
```typescript
<Button
  className={cn(
    'h-fit min-h-[61px] text-sm leading-none',
    // ... other classes
  )}
  style={{
    backgroundColor: computedStyles.colors.block,
    color: computedStyles.colors.blockText,
    fontFamily: computedStyles.fonts.bodyFont,
    boxShadow: computedStyles.block.shadow,
    border: computedStyles.block.outline,
  }}
>
```

**New Implementation:**
```typescript
<Button
  className={cn(
    'h-fit min-h-[61px] text-sm leading-none',
    'bg-brandKit-block text-brandKit-block-text',
    getBrandKitFontClass(computedStyles.fonts.bodyFont, 'body'),
    getBrandKitShadowClass(computedStyles.block.shadow),
    getBrandKitOutlineClass(computedStyles.block.outline),
    // ... other classes
  )}
>
```

### 4. Update BioHeaderRender
**File:** `/packages/ui/src/bio/bio-header-render.tsx`

**Current Implementation (lines 38-54):**
```typescript
<button
  className={cn(
    'px-6 py-3',
    // ... radius classes
  )}
  style={{
    backgroundColor: computedStyles.colors.button,
    color: computedStyles.colors.buttonText,
    boxShadow: computedStyles.block.shadow,
    border: computedStyles.block.outline,
  }}
>
  Subscribe
</button>
```

**New Implementation:**
```typescript
<button
  className={cn(
    'px-6 py-3',
    'bg-brandKit-block text-brandKit-block-text',
    getBrandKitShadowClass(computedStyles.block.shadow),
    getBrandKitOutlineClass(computedStyles.block.outline),
    // ... radius classes
  )}
>
  Subscribe
</button>
```

### 5. Update BioProfileRender
**File:** `/packages/ui/src/bio/bio-profile-render.tsx`

**Current Implementation (lines 86-108):**
```typescript
<h1
  className={cn('text-3xl', (isHeroStyle || isCenteredStyle) && 'mb-2')}
  style={{
    color: computedStyles.colors.text,
    fontFamily: computedStyles.fonts.headingFont,
    fontWeight: 700,
  }}
>
  {bio.handle}
</h1>

<p
  className='text-sm'
  style={{
    color: computedStyles.colors.text,
    fontFamily: computedStyles.fonts.bodyFont,
    fontWeight: 400,
  }}
>
  {brandKit.shortBio}
</p>
```

**New Implementation:**
```typescript
<h1
  className={cn(
    'text-3xl font-bold text-brandKit-text',
    (isHeroStyle || isCenteredStyle) && 'mb-2',
    getBrandKitFontClass(computedStyles.fonts.headingFont, 'heading')
  )}
>
  {bio.handle}
</h1>

<p
  className={cn(
    'text-sm font-normal text-brandKit-text',
    getBrandKitFontClass(computedStyles.fonts.bodyFont, 'body')
  )}
>
  {brandKit.shortBio}
</p>
```

### 6. Update BioEmailCaptureRender
**File:** `/packages/ui/src/bio/bio-email-capture-render.tsx`

**Current Implementation Examples:**

**Success state (lines 76-107):**
```typescript
<div
  className='rounded-lg p-4 text-center'
  style={{
    backgroundColor: computedStyles.colors.block,
    border: `1px solid ${computedStyles.colors.buttonOutline}`,
  }}
>
  <div
    className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full'
    style={{ backgroundColor: computedStyles.colors.button }}
  >
    <svg
      style={{ color: computedStyles.colors.buttonText }}
    >
```

**New Implementation:**
```typescript
<div
  className={cn(
    'rounded-lg p-4 text-center',
    'bg-brandKit-block border border-brandKit-text/20'
  )}
>
  <div
    className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brandKit-block'
  >
    <svg
      className='h-5 w-5 text-brandKit-block-text'
    >
```

**Form container (lines 116-127):**
```typescript
<div
  className='rounded-lg p-4'
  style={{
    backgroundColor: computedStyles.colors.block,
    border: `1px solid ${computedStyles.colors.buttonOutline}`,
  }}
>
  <p
    className='mb-3 text-sm font-medium'
    style={{ color: computedStyles.colors.blockText }}
  >
```

**New Implementation:**
```typescript
<div
  className='rounded-lg p-4 bg-brandKit-block border border-brandKit-text/20'
>
  <p
    className='mb-3 text-sm font-medium text-brandKit-block-text'
  >
```

## Helper Functions to Add

**File:** `/packages/utils/src/brand-kit.ts`

Add these new utility functions:

```typescript
/**
 * Get Tailwind classes for brandKit font families
 */
export function getBrandKitFontClass(
  fontFamily: string | undefined,
  type: 'heading' | 'body' = 'body'
): string {
  if (!fontFamily) return '';
  
  // Map common font families to Tailwind classes
  const fontMap: Record<string, string> = {
    'Inter': 'font-sans',
    'Roboto': 'font-sans',
    'Poppins': 'font-sans',
    'Playfair Display': 'font-serif',
    'Merriweather': 'font-serif',
    'Lora': 'font-serif',
    'Roboto Mono': 'font-mono',
    'Fira Code': 'font-mono',
    // Add more mappings as needed
  };
  
  // Extract primary font from font stack
  const primaryFont = fontFamily.split(',')[0]?.replace(/['"]/g, '').trim();
  
  return fontMap[primaryFont || ''] || 'font-sans';
}

/**
 * Get Tailwind classes for block shadow
 */
export function getBrandKitShadowClass(shadow: string | undefined): string {
  if (!shadow || shadow === 'none') return '';
  
  // Check if it's the standard shadow pattern
  if (shadow.includes('0px 5px 0px 0px')) {
    return 'shadow-[0px_5px_0px_0px_color-mix(in_oklch,var(--brandKit-block)_50%,transparent)]';
  }
  
  return '';
}

/**
 * Get Tailwind classes for block outline
 */
export function getBrandKitOutlineClass(outline: string | undefined): string {
  if (!outline || outline === 'none') return '';
  
  // Check for 2px solid pattern
  if (outline.includes('2px solid')) {
    return 'border-2 border-brandKit-text';
  }
  
  return '';
}

/**
 * Get Tailwind classes for block radius
 */
export function getBrandKitRadiusClass(radius: string): string {
  const radiusMap: Record<string, string> = {
    '0px': 'rounded-none',
    '12px': 'rounded-xl',
    '9999px': 'rounded-full',
  };
  
  return radiusMap[radius] || 'rounded-xl';
}
```

## Color System Notes

### Current Color Flow:
1. Colors are stored in database as oklch strings (e.g., `"oklch(96% 0.005 260)"`)
2. BrandKitProvider sets these as CSS variables
3. Tailwind config maps CSS variables to utility classes
4. Components use Tailwind classes instead of inline styles

### Why This Migration:
1. **Performance**: CSS classes are more performant than inline styles
2. **Consistency**: All styling through Tailwind's utility system
3. **Maintainability**: Easier to understand and modify
4. **Simplification**: Removes unnecessary color conversion functions
5. **Native oklch**: Uses oklch colors directly without conversion

## Testing Checklist

After implementation, verify:

- [ ] **Colors render correctly**
  - [ ] Background colors match brandKit settings
  - [ ] Text colors are readable and correct
  - [ ] Block/button colors apply properly
  
- [ ] **Block styles work correctly**
  - [ ] Rounded style (12px radius)
  - [ ] Oval style (full radius)
  - [ ] Square style (no radius)
  - [ ] Full-width style
  
- [ ] **Interactive elements**
  - [ ] Shadow effects on blocks (if enabled)
  - [ ] Outline/border styles (if enabled)
  - [ ] Hover states maintain proper colors
  
- [ ] **Typography**
  - [ ] Font families apply correctly
  - [ ] Font weights are preserved
  - [ ] Text sizes remain consistent
  
- [ ] **Email capture form**
  - [ ] Form styling matches brandKit
  - [ ] Success state displays correctly
  - [ ] Error states are visible
  
- [ ] **Responsive design**
  - [ ] Mobile view maintains styling
  - [ ] Desktop margins work correctly
  - [ ] SM breakpoint rounded corners
  
- [ ] **Preview mode**
  - [ ] Preview styling differences preserved
  - [ ] Editor interactions still work

## Implementation Order

1. **Phase 1: Setup**
   - Add helper functions to `brand-kit.ts`
   - Export new functions from utils package

2. **Phase 2: Core Components**
   - Update BioContentAroundBlocks (main container)
   - Update BioBlocksRender (main content blocks)

3. **Phase 3: Supporting Components**
   - Update BioHeaderRender
   - Update BioProfileRender
   - Update BioEmailCaptureRender

4. **Phase 4: App Level**
   - Update bio-bio-render.tsx
   - Remove hexToOklchDarker function

5. **Phase 5: Testing**
   - Test all block style variations
   - Verify preview mode
   - Check responsive design
   - Test with different brandKit configurations

## Common Patterns

### Replacing inline color styles:
```typescript
// Before:
style={{ color: computedStyles.colors.text }}

// After:
className="text-brandKit-text"
```

### Replacing background colors:
```typescript
// Before:
style={{ backgroundColor: computedStyles.colors.block }}

// After:
className="bg-brandKit-block"
```

### Handling conditional styles:
```typescript
// Before:
style={{
  boxShadow: computedStyles.block.shadow,
  border: computedStyles.block.outline,
}}

// After:
className={cn(
  getBrandKitShadowClass(computedStyles.block.shadow),
  getBrandKitOutlineClass(computedStyles.block.outline),
)}
```

### Font family handling:
```typescript
// Before:
style={{ fontFamily: computedStyles.fonts.bodyFont }}

// After:
className={getBrandKitFontClass(computedStyles.fonts.bodyFont, 'body')}
```

## Files Summary

Files that need modification:
1. `/apps/bio/src/app/[handle]/bio-bio-render.tsx` - Remove hex conversion, update container
2. `/packages/ui/src/bio/bio-content-around-blocks.tsx` - Replace inline styles with classes
3. `/packages/ui/src/bio/bio-blocks-render.tsx` - Update all block and link styles
4. `/packages/ui/src/bio/bio-header-render.tsx` - Update button styles
5. `/packages/ui/src/bio/bio-profile-render.tsx` - Update text styles
6. `/packages/ui/src/bio/bio-email-capture-render.tsx` - Update form and success styles
7. `/packages/utils/src/brand-kit.ts` - Add helper functions
8. `/packages/utils/src/index.ts` - Export new helper functions

## Notes for Implementation

- The BrandKitProvider already sets up all necessary CSS variables
- Tailwind config already has brandKit color utilities configured
- All colors are already in oklch format in the CSS variables
- Focus on replacing inline styles with Tailwind classes
- Use helper functions for complex conditional styles
- Maintain all existing functionality and interactions
- Preserve responsive design breakpoints
- Keep preview mode distinctions intact

## Potential Issues to Watch

1. **Font family mapping**: May need to expand the font mapping in helper functions
2. **Custom shadows**: Complex shadows might need arbitrary value classes
3. **Border opacity**: May need to use `/20` opacity modifiers for borders
4. **Dark mode**: Consider if dark mode variants are needed
5. **Animation classes**: Ensure animation classes still work with new structure

This migration will result in cleaner, more maintainable code that leverages Tailwind's utility-first approach while maintaining full brandKit customization capabilities.