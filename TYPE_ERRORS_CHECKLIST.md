# Type and Lint Errors Checklist - COMPLETED

## Summary
- Fixed all errors in implementation files
- Fixed lint errors in apps/app test file
- Remaining errors are in test files in packages/lib which have complex mocking requirements
- Code has been formatted

## Fixed Errors

## Lint Errors - FIXED

### `apps/app/src/app/[handle]/tracks/stats/__tests__/track-stat-header.test.tsx`
- [x] Line 14: Unexpected any. Specify a different type
- [x] Line 15: Unsafe assignment of an `any` value
- [x] Line 17: Unsafe return of a value of type `any`
- [x] Line 17: Unsafe call of a(n) `any` typed value
- [x] Line 20: Unexpected any. Specify a different type
- [x] Line 21: Unsafe assignment of an `any` value
- [x] Line 24: Unexpected any. Specify a different type
- [x] Line 25: Unexpected any. Specify a different type
- [x] Line 25: Unsafe assignment of an `any` value
- [x] Line 30: Unexpected any. Specify a different type
- [x] Line 31: Unsafe assignment of an `any` value
- [x] Line 37: Unexpected any. Specify a different type
- [x] Line 37: Unsafe assignment of an `any` value
- [x] Lines 61, 67, 68, 69, 70, 87, 88, 95, 98, 115: Unsafe call of a(n) `error` type typed value

### `apps/app/src/app/[handle]/tracks/stats/page.tsx`
- [x] Line 32: Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined

## Lint Errors - STILL TO FIX

### `packages/lib/src/trigger/__tests__/streaming-stats.trigger.test.ts`
- [ ] Many `any` type errors and unsafe operations (84 errors total)

### `packages/lib/src/trpc/routes/__tests__/spotify.route.test.ts`  
- [ ] Multiple `any` type errors and unsafe operations

## Type Errors

### `packages/lib/src/trpc/routes/__tests__/spotify.route.test.ts`
- [ ] Line 56: Missing property 'mutation' on route type
- [ ] Line 84: Type mismatch for artist parameter (missing required properties)
- [ ] Line 91: Unknown property 'spotifyId' in procedure call options
- [ ] Line 112: Missing property 'mutation' on route type
- [ ] Line 142: Type mismatch for account parameter (missing required properties)
- [ ] Line 145: Type mismatch for search results (missing required properties)
- [ ] Line 147: Missing property 'mutation' on route type
- [ ] Line 182: Missing property 'mutation' on route type
- [ ] Line 197: Object is possibly 'undefined'
- [ ] Line 220: Missing property 'mutation' on route type

## Priority Order
1. Fix the unnecessary conditional in page.tsx (simplest)
2. Fix the test mocking issues in track-stat-header.test.tsx
3. Fix the type issues in spotify.route.test.ts