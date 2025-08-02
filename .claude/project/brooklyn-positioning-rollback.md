# Brooklyn Positioning Rollback Guide

## Overview
This document outlines how to rollback the Brooklyn positioning changes implemented in the barely-rebrand-2025 feature branch.

## Changes Made

### 1. Homepage Updates
- **File**: `apps/nyc/src/components/marketing/hero.tsx`
- **Change**: Added "Made in Brooklyn • For indie artists everywhere" badge
- **Rollback**: Remove lines 165-178 (the Brooklyn badge div)

### 2. Footer Component
- **File**: `apps/nyc/src/components/marketing/footer.tsx`
- **Change**: Created new footer component with Brooklyn positioning
- **Rollback**: Delete the entire file
- **File**: `apps/nyc/src/app/layout.tsx`
- **Change**: Added footer import and component
- **Rollback**: Remove footer import (line 13) and `<Footer />` component (line 65)

### 3. Metadata Updates
- **File**: `apps/nyc/src/app/layout.tsx`
- **Change**: Updated title and description with "Music Marketing Engineers" and Brooklyn positioning
- **Rollback**: Revert to original metadata (lines 28-31)

### 4. About Page
- **File**: `apps/nyc/src/app/about/page.tsx`
- **Changes**: 
  - Updated metadata (lines 10-14)
  - Changed header text (lines 25-30)
  - Added Brooklyn Base section (lines 128-145)
  - Updated Mission section to use "we" language (lines 153-162)
- **Rollback**: Revert all these sections to original copy

### 5. Service Pages
- **Files**: 
  - `apps/nyc/src/app/services/page.tsx`
  - `apps/nyc/src/app/services/bedroom/page.tsx`
  - `apps/nyc/src/app/services/rising/page.tsx`
  - `apps/nyc/src/app/services/breakout/page.tsx`
- **Changes**: Updated metadata and some copy to include Brooklyn/engineering positioning
- **Rollback**: Revert metadata in each file

### 6. SEO/Structured Data
- **File**: `apps/nyc/src/components/marketing/structured-data.tsx`
- **Change**: Created structured data component
- **Rollback**: Delete the entire file
- **File**: `apps/nyc/src/app/layout.tsx`
- **Change**: Added StructuredData import and component
- **Rollback**: Remove import (line 15) and `<StructuredData />` component (line 56)

## Quick Rollback Commands

To revert all changes at once:
```bash
# From the feature branch
git checkout main -- apps/nyc/src/components/marketing/hero.tsx
git checkout main -- apps/nyc/src/app/layout.tsx
git checkout main -- apps/nyc/src/app/about/page.tsx
git checkout main -- apps/nyc/src/app/services/page.tsx
git checkout main -- apps/nyc/src/app/services/bedroom/page.tsx
git checkout main -- apps/nyc/src/app/services/rising/page.tsx
git checkout main -- apps/nyc/src/app/services/breakout/page.tsx

# Remove new files
rm apps/nyc/src/components/marketing/footer.tsx
rm apps/nyc/src/components/marketing/structured-data.tsx
```

## Testing After Rollback

1. Run build to ensure no errors:
   ```bash
   pnpm run build --filter=@barely/nyc
   ```

2. Start dev server and check:
   ```bash
   pnpm run dev --filter=@barely/nyc
   ```

3. Verify:
   - Homepage shows original hero copy
   - No footer appears on pages
   - About page has original "PhD Who Left Science" narrative
   - Service pages have original metadata

## Notes
- All changes were copy/content only - no functional changes
- No database migrations or API changes were made
- No changes to email templates or other apps