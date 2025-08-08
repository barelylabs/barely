# TYPE_ERRORS_CHECKLIST.md

## Lint Errors by Package

### @barely/vip (2 errors) - EASY
- [ ] `src/components/vip-layout.tsx:7:8` - Cannot find module '@tanstack/react-query' (missing dependency)
- [ ] `src/trpc/server.tsx:2:21` - Unused type parameter 'TAliasType'

### @barely/email (3 errors) - EASY
- [ ] `src/templates/vip/vip-download.tsx:9:2` - 'Img' is defined but never used
- [ ] `src/templates/vip/vip-download.tsx:51:22` - Prefer nullish coalescing operator (`??`) instead of logical or (`||`)
- [ ] `src/templates/vip/vip-download.tsx:60:20` - Prefer nullish coalescing operator (`??`) instead of logical or (`||`)

### @barely/app (5 errors) - EASY/MEDIUM
- [ ] `src/app/[handle]/fans/_components/fans-actions-dropdown.tsx:35:7` - Floating promise (missing await)
- [ ] `src/app/[handle]/fans/_components/import-fans-modal.tsx:17:10` - 'Button' is defined but never used
- [ ] `src/app/[handle]/tracks/stats/page.tsx:6:10` - 'Card' is defined but never used
- [ ] `src/app/[handle]/tracks/stats/page.tsx:13:10` - 'TrackSelector' is defined but never used
- [ ] `src/app/[handle]/vip/swaps/_components/create-or-update-vip-swap-modal.tsx:168:13` - Unnecessary conditional

### @barely/lib (59 errors) - COMPLEX
#### src/utils/fan-export.ts (53 errors) - Most are unsafe any operations
- [ ] Lines 106-204: Multiple unsafe member access, assignment, and return of `any` values
- [ ] Line 208: Control character in regex
- [ ] Line 238: Unnecessary conditional

#### src/trpc/routes/vip-swap.route.ts (6 errors)
- [ ] Lines 52-54: Unsafe member access of `any` values

## Priority Order (Easiest First)

1. **Remove unused imports** - @barely/vip, @barely/email, @barely/app (5 errors)
2. **Fix nullish coalescing** - @barely/email (2 errors)  
3. **Fix floating promise** - @barely/app (1 error)
4. **Fix unnecessary conditional** - @barely/app (1 error)
5. **Add missing dependency** - @barely/vip (1 error)
6. **Fix regex control character** - @barely/lib (1 error)
7. **Fix unsafe any operations** - @barely/lib (58 errors)

Total: 69 errors to fix