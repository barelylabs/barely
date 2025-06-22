# Type and Lint Errors Checklist

## Type Errors

### @barely/link (Primary Type Errors)
- [x] ../../packages/lib/utils/filters.ts(23-42): Multiple ZodType compatibility errors - Type 'ZodOptional<ZodPipe<...>>' missing properties
- [x] ../../packages/lib/utils/middleware.ts(147,150,153,156,158): Property 'geo' does not exist on type 'NextRequest'  
- [x] ../../packages/lib/utils/middleware.ts(309,310): ZodObject missing properties from ZodType

## Lint Errors (Organized by Error Type)

### 1. Simple Fixes (Start Here)

#### Missing 'as const' assertions
- [ ] packages/lib/server/routes/flow/flow.ui.types.ts:162,163,164
- [ ] packages/lib/server/routes/workflow/workflow.fns.ts:153,158,161,166,168,170,172,174,179
- [x] packages/lib/server/routes/playlist-pitch-review/playlist-pitch-review-schema.ts:25

#### Missing return statements
- [x] packages/lib/server/routes/stripe-connect/stripe-connect.fns.ts:77,84,147,161
- [ ] packages/lib/server/routes/playlist/playlist.fns.ts:213
- [x] packages/lib/server/routes/event/event.fns.ts:1044

#### Unnecessary trailing commas
- [ ] packages/lib/server/api/trpc.ts:216

#### Defined but never used
- [ ] apps/app/src/app/[handle]/tracks/page.tsx:17 ('err')

### 2. Type Import Issues (@typescript-eslint/consistent-type-imports)
- [ ] Multiple files across packages need type imports to be fixed

### 3. Unnecessary Conditionals (@typescript-eslint/no-unnecessary-condition)
- [ ] packages/ui: Numerous files with unnecessary conditionals and optional chains
- [ ] packages/lib: Various files with unnecessary conditionals
- [ ] apps/app: Multiple instances in tracks/page.tsx

### 4. No Unused Expressions (@typescript-eslint/no-unused-expressions)
- [ ] packages/ui/elements/button.tsx:148,245 (invalid line numbers)
- [x] packages/ui/elements/multiselect.tsx:122,189
- [ ] packages/lib/hooks/use-upload.ts:120,183,188,267,388,438 (some invalid line numbers)
- [ ] packages/lib/hooks/use-files.ts:106
- [ ] packages/ui/forms/field-wrapper.tsx:36
- [ ] packages/ui/forms/field-context.tsx:33 (file doesn't exist)

### 5. Unsafe Operations (Complex Fixes)
- [ ] @typescript-eslint/no-unsafe-assignment: Multiple files
- [ ] @typescript-eslint/no-unsafe-call: Multiple files
- [ ] @typescript-eslint/no-unsafe-argument: Multiple files
- [ ] @typescript-eslint/no-unsafe-member-access: Multiple files
- [ ] @typescript-eslint/no-unsafe-return: Multiple files

### 6. Other Issues
- [x] Switch exhaustiveness checks in typography.tsx
- [x] Prefer nullish coalescing over logical operators (button.tsx)
- [ ] Async functions without await expressions
- [x] Empty interface issues (beacon.tsx, command.tsx)
- [x] Restricted import from 'zod' (link-dialog.tsx)
- [x] Unnecessary optional chains (workspace-social-links.tsx)

## Priority Order
1. ✅ Fix simple issues (as const, return statements, trailing commas)
2. Fix type imports
3. Fix unnecessary conditionals
4. Fix no-unused-expressions
5. Fix unsafe operations
6. Fix Zod type compatibility
7. Fix NextRequest geo property