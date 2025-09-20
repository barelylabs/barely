# Email Broadcast UX MVP Plan

## Objective
Improve the email broadcasting user experience by reducing friction and context-switching while maintaining the existing architecture.

## Current State
- **Email Templates**: `/[handle]/email-templates`
- **Template Groups**: `/[handle]/email-template-groups`
- **Email Broadcasts**: `/[handle]/email-broadcasts` (hidden from navigation)
- **Fans**: `/[handle]/fans`
- **Fan Groups**: `/[handle]/fan-groups`

## Pain Points to Address
1. **Hidden Feature**: Email broadcasts not visible in navigation
2. **Fragmented Workflow**: Must create template first, then navigate to broadcasts
3. **No Quick Compose**: Cannot create and send email in one flow

## MVP Implementation Plan

### 1. Route Restructuring
**Move all email-related pages under `/[handle]/email/` subdirectory:**
```
/[handle]/email/templates        (from /[handle]/email-templates)
/[handle]/email/template-groups  (from /[handle]/email-template-groups)
/[handle]/email/broadcasts       (from /[handle]/email-broadcasts)
```

**Implementation:**
- Use `git mv` to maintain history when moving directories
- Update all imports and route references
- Update navigation links in `dash-sidebar-nav.tsx`
- Keep fans and fan-groups at current locations (they're audience features, not just email)

### 2. Navigation Updates

#### 2.1 Update Sidebar Structure
Location: `apps/app/src/app/[handle]/_components/dash-sidebar-nav.tsx`

Current structure:
```typescript
const emailLinks = [
  { title: 'templates', icon: 'email', href: `/${handle}/email-templates` },
  { title: 'template groups', icon: 'emailTemplateGroup', href: `/${handle}/email-template-groups` },
  // broadcasts is missing
];
```

New structure:
```typescript
const emailLinks = [
  { title: 'broadcasts', icon: 'broadcast', href: `/${handle}/email/broadcasts` },
  { title: 'templates', icon: 'email', href: `/${handle}/email/templates` },
  { title: 'template groups', icon: 'emailTemplateGroup', href: `/${handle}/email/template-groups` },
];
```

### 3. Enhanced Broadcast Modal

Location: `apps/app/src/app/[handle]/email/broadcasts/_components/create-or-update-email-broadcast-modal.tsx`

#### 3.1 Add Tabbed Interface
- Use existing `Tabs` component from `@barely/ui/tabs`
- Two tabs: "Use Template" and "Create New"

#### 3.2 "Use Template" Tab (existing functionality)
- Keep current implementation
- Add recipient count display using `fanGroups.length` or query

#### 3.3 "Create New" Tab Structure
```typescript
// Fields to include:
- TextField: name (template name)
- SelectField: fromId (from address)
- TextField: subject
- TextField: previewText (optional)
- MDXEditor: body
- SelectField: fanGroupId
- DatetimeField: scheduledAt (optional)
- Switch: saveAsTemplate (default: true)
```

#### 3.4 Simplified Actions
Replace current dual-button pattern with:
```typescript
// Primary action changes based on state
const primaryAction = form.watch('scheduledAt') ? 'Schedule' : 'Send Now';
const primaryIcon = form.watch('scheduledAt') ? 'calendar' : 'send';

// Single secondary action
const secondaryAction = 'Save as Draft';
```

#### 3.5 Add SendTestEmail Component
- Import existing `SendTestEmail` component
- Place in modal header or footer area

### 4. Backend Implementation

#### 4.1 New tRPC Endpoint
Location: `packages/lib/src/trpc/routes/email-broadcast.route.ts`

```typescript
createWithTemplate: workspaceProcedure
  .input(
    z.object({
      // Template fields
      name: z.string(),
      fromId: z.string(),
      subject: z.string(),
      previewText: z.string().optional(),
      body: z.string(),
      type: z.enum(['marketing', 'transactional']).default('marketing'),
      saveAsTemplate: z.boolean().default(true),

      // Broadcast fields
      fanGroupId: z.string().nullable(),
      status: z.enum(['draft', 'scheduled', 'sending']),
      scheduledAt: z.date().nullable(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // 1. Create template if saveAsTemplate is true
    // 2. Create broadcast with template ID
    // 3. Trigger if status is 'scheduled'
  })
```

#### 4.2 Duplicate Broadcast Endpoint
```typescript
duplicate: workspaceProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // 1. Get existing broadcast
    // 2. Create new broadcast with status 'draft'
    // 3. Copy all fields except dates and stats
  })
```

### 5. Broadcast List Updates

#### 5.1 Existing Components to Verify
- `all-email-broadcasts.tsx` - Already uses new pattern ✓
- `email-broadcasts-context.tsx` - Already uses hook factories ✓
- `email-broadcast-filters.tsx` - Check if needs status filter

#### 5.2 Add Status Filter
Update filters to include:
```typescript
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sent', value: 'sent' },
];
```

#### 5.3 Add Duplicate Action
In `EmailBroadcastCard` component, add duplicate action to context menu

### 6. File Operations

#### 6.1 Move Directories (maintain git history)
```bash
# Create email parent directory
mkdir -p apps/app/src/app/[handle]/email

# Move directories with git mv
git mv apps/app/src/app/[handle]/email-templates apps/app/src/app/[handle]/email/templates
git mv apps/app/src/app/[handle]/email-template-groups apps/app/src/app/[handle]/email/template-groups
git mv apps/app/src/app/[handle]/email-broadcasts apps/app/src/app/[handle]/email/broadcasts
```

#### 6.2 Update Imports
Search and replace all imports:
- `[handle]/email-templates` → `[handle]/email/templates`
- `[handle]/email-template-groups` → `[handle]/email/template-groups`
- `[handle]/email-broadcasts` → `[handle]/email/broadcasts`

### 7. Implementation Checklist

#### Day 1: Route Restructuring & Navigation
- [ ] Move directories using git mv
- [ ] Update all import paths
- [ ] Update navigation in dash-sidebar-nav.tsx
- [ ] Test all email pages load correctly
- [ ] Add broadcasts to visible navigation

#### Day 2: Backend Enhancements
- [ ] Add `createWithTemplate` mutation to email-broadcast.route.ts
- [ ] Add `duplicate` mutation
- [ ] Update validators in email-broadcast.schema.ts
- [ ] Test new endpoints with API tools

#### Day 3: Modal Enhancement
- [ ] Add Tabs component to broadcast modal
- [ ] Implement "Use Template" tab (refactor existing)
- [ ] Implement "Create New" tab with all fields
- [ ] Add recipient count display
- [ ] Integrate SendTestEmail component
- [ ] Simplify action buttons

#### Day 4: Polish & Testing
- [ ] Add status filter to broadcasts list
- [ ] Add duplicate action to broadcast cards
- [ ] Test complete flow: create new → send
- [ ] Test complete flow: use template → send
- [ ] Test draft saving and editing
- [ ] Ensure consistent styling with rest of app

### 8. Validation Checklist
Before considering complete:
- [ ] Can create and send broadcast in single modal
- [ ] Broadcasts visible in navigation
- [ ] All routes use `/email/` structure
- [ ] Status filtering works
- [ ] Duplicate functionality works
- [ ] Test email sending works from modal
- [ ] Recipient count displays correctly
- [ ] Draft saving and scheduling work

## Success Metrics
- Steps to send broadcast: 15+ → 5-6 clicks
- Time to first broadcast: 10 min → 3 min
- All email features accessible from navigation
- Single modal can handle full broadcast creation

## Files to Modify
1. `apps/app/src/app/[handle]/_components/dash-sidebar-nav.tsx`
2. `apps/app/src/app/[handle]/email/broadcasts/_components/create-or-update-email-broadcast-modal.tsx`
3. `packages/lib/src/trpc/routes/email-broadcast.route.ts`
4. `packages/validators/src/schemas/email-broadcast.schema.ts`
5. All files with email route imports (find with grep)

## Out of Scope (See EMAIL-BROADCAST-POLISHING.md)
- Live email preview panel
- Advanced multi-step builder
- Analytics dashboard
- A/B testing
- Visual segment builder