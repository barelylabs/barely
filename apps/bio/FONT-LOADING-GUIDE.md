# Font Loading Strategy for Bio App

## Overview

The bio app loads all custom fonts upfront using Next.js font optimization with `font-display: swap`. This approach prevents layout shift and ensures a smooth user experience, even on slow connections.

## How It Works

### 1. Font Initialization (`src/lib/fonts.ts`)

All fonts are initialized at module scope with `preload: true` and `display: 'swap'`:

```typescript
const poppins = Poppins({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap', // Shows fallback immediately, swaps when loaded
	variable: '--font-poppins',
	preload: true, // Loads font upfront to prevent layout shift
});
```

### 2. Font Mapping

Each brand kit font preset is mapped to its corresponding heading and body fonts:

```typescript
const fontPresetMap: Record<BrandKitFontPresetKey, { heading?: any; body?: any }> = {
	'modern.cal': {
		heading: calSans, // Local font
		body: poppins, // Google font
	},
	'classic.playfairDisplay': {
		heading: playfairDisplay,
		body: inter,
	},
	// ... other presets
};
```

### 3. Loading All Fonts in Root Layout

In the root layout (`app/layout.tsx`), all font CSS variables are loaded upfront:

```typescript
import { getAllFontClassNames, inter } from '../lib/fonts';

// Get all font CSS variables - loaded upfront to prevent layout shift
const allFontClasses = getAllFontClassNames();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={cn(inter.className, inter.variable, allFontClasses)}>
        {children}
      </body>
    </html>
  );
}
```

### 4. CSS Variable Application

The font classes add CSS variables that are referenced in the computed styles:

```css
.font-class {
	--font-poppins: 'Poppins', sans-serif;
	--font-playfair-display: 'Playfair Display', serif;
}
```

These variables are then used in the brand kit's computed styles:

```typescript
// In brand-kit.constants.ts
'modern.cal': {
  headingFont: "var(--font-heading, 'Cal Sans'), 'Inter', sans-serif",
  bodyFont: "var(--font-poppins, 'Poppins'), sans-serif",
}
```

## Performance Benefits

1. **No Layout Shift**: `font-display: swap` ensures text is visible immediately with fallback fonts
2. **Browser Caching**: Once loaded, fonts are cached for all bio pages
3. **Next.js Optimization**: Automatic font subsetting and preloading
4. **Better UX**: No flash of unstyled text (FOUT) or layout shifts
5. **ISR Compatible**: Works perfectly with Next.js Incremental Static Regeneration

## Adding New Fonts

To add a new font preset:

1. Import the font from `next/font/google` in `src/lib/fonts.ts`
2. Initialize it with `preload: false`
3. Add it to the `fontPresetMap` with the corresponding preset key
4. Update the `BrandKitFontPresetKey` type

## Testing

Test font loading by:

1. Visiting different bio pages with different font presets
2. Checking Network tab to verify only required fonts are loaded
3. Using Chrome DevTools Coverage tab to check unused CSS

## Why This Approach?

After testing, we chose to load all fonts upfront because:

1. **Users browse multiple bios**: Font files are cached after first load
2. **Prevents layout shift**: Critical for Core Web Vitals and user experience
3. **Simpler implementation**: No complex lazy loading logic
4. **Industry standard**: Similar to Linktree and Beacons.ai approach
5. **Modern optimization**: Next.js + WOFF2 makes the bundle size manageable

The trade-off of slightly larger initial download is worth the improved user experience and elimination of layout shift.
