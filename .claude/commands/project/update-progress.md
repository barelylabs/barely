---
description: Analyze recent work, update plan-organized.md with completed tasks, and create/update detailed checkpoint.md
allowed-tools:
  - Read
  - Write
  - Edit
  - MultiEdit
  - Grep
  - Glob
  - Bash
  - TodoWrite
  - mcp__time__get_current_time
---

# update-progress

Automatically update project documentation after completing work. This command analyzes what was done, updates task statuses in plan-organized.md, and creates/updates a detailed checkpoint with current state.

## Usage

```bash
/project:update-progress
```

## What This Command Does

I'll automatically:

1. Analyze recent git commits and file changes
2. Update task checkboxes in plan-organized.md
3. Create/update checkpoint.md with detailed status
4. Calculate project progress percentages
5. Document technical decisions and blockers
6. Generate next steps recommendations

## Implementation Process

### 1. Gather Session Context

First, I'll understand the current session's work and context:

!git log --oneline -20
!git diff --stat HEAD~5..HEAD 2>/dev/null || git diff --stat HEAD~1..HEAD
!git status --short

**Session Context Analysis:**

- What specific problems were solved today?
- What decisions were made and why?
- What unexpected issues were encountered?
- What patterns or approaches were established?
- What specific files need attention next?

**From Current Conversation:**
I'll incorporate context from our current conversation:

- Any specific issues you mentioned
- Solutions we discussed but haven't implemented
- Decisions we made together
- Next steps we identified
- Any "remember to..." or "don't forget..." items

### 2. Load Current Documentation

@.claude/project/plan-organized.md
@.claude/project/checkpoint.md

### 3. Review Current Todo List

Check if there's an active todo list from this session:

- Review TodoWrite items and their status
- Note any in-progress items that need continuation
- Capture any discovered tasks not in the original plan

### 4. Identify Completed Tasks

I'll scan for concrete evidence:

- New files created matching planned features
- Backend routes implemented
- Frontend components built
- Database migrations run
- Tests written
- Bug fixes applied
- Integration points verified

### 4. Update plan-organized.md

I'll update task checkboxes based on evidence:

- Mark completed items with `[x]`
- Add partial completion notes with 🟨
- Update progress summaries
- Add session notes with date stamps

### 5. Create/Update checkpoint.md

The checkpoint will include SESSION-SPECIFIC context:

#### Header Section

- Current date and time
- Branch name
- Days until deadline
- Overall progress percentage

#### Session Context (NEW)

- Specific problems tackled this session
- Key decisions and their rationale
- Unexpected discoveries or issues
- Patterns established for future work

#### Completed Implementation

- Detailed list of what's done THIS SESSION
- Technical decisions made and WHY
- Files created/modified with purpose
- Integration points tested and verified

#### Pending Implementation

- Remaining tasks by priority
- Blockers and dependencies discovered
- Time estimates based on session learnings

#### Granular Next Steps (CRITICAL)

Based on current session context:

- Exact file to work on next
- Specific function/component to implement
- Known gotchas to avoid (from this session)
- Unfinished work from current todo list
- Commands to run to continue
- Example: "Continue implementing the Stripe webhook handler in apps/invoice/src/app/api/webhooks/stripe/route.ts - the payment intent metadata needs invoiceId"

#### Session-Specific Technical Notes

- Workarounds discovered
- Integration patterns that worked
- Failed approaches to avoid
- Dependencies uncovered
- Performance considerations noted

#### Handoff Notes

If someone else (or future you) continues:

- Current mental model
- Assumptions being made
- Open questions needing answers
- Design decisions pending

### 6. Generate Summary Report

After updating, I'll provide:

- Tasks completed this session
- Overall project progress
- Critical path items
- Recommended next actions

## Update Patterns

### Task Status Markers

```markdown
- [ ] Not started
- [x] Completed
- [x] Completed ✅ (with emphasis)
- [ ] 🟨 Partial (in progress)
- [ ] ⏳ Pending (waiting on dependency)
- [ ] ❌ Blocked (with reason)
```

### Progress Tracking

```markdown
### Feature Name ✓ COMPLETED

### Feature Name 🟨 IN PROGRESS (60%)

### Feature Name ⏳ PENDING
```

### Session Notes

```markdown
### ✅ Completed (2025-08-15 Session)

- Specific accomplishment
- Technical detail
- Integration verified
```

## Smart Detection Rules

### Backend Completion

- Route file exists in `packages/lib/src/trpc/routes/`
- Handler exists in `packages/api/src/app/sub/`
- Added to app.route.ts
- Validators defined

### Frontend Completion

- Page component exists
- Form validation implemented
- tRPC integration working
- UI components styled

### Database Completion

- SQL file created
- Schema exported
- Validators defined
- Migration run (check for table existence)

## Error Handling

### Missing Files

- Create checkpoint.md if it doesn't exist
- Use template structure for new checkpoint
- Preserve existing content when updating

### Conflicts

- If manual edits detected, merge carefully
- Preserve user additions
- Flag conflicts for review

### Large Files

- For very long plans, use targeted edits
- Update only changed sections
- Maintain file structure

## Command Options

While this command runs automatically, you can guide it:

- "Focus on Feature X" - Update specific feature status
- "Include git history" - Add commit messages to checkpoint
- "Calculate metrics" - Add completion percentages
- "Generate PR description" - Create summary for pull request

## Integration with Other Commands

Works well with:

- `/project:cook` - Run before to see current state
- `/git:create-pr` - Run before to ensure docs are current
- `/meta:reflection` - Run after for deeper analysis

## Template Structure

The checkpoint.md follows this structure:

````markdown
# Project Name - Implementation Checkpoint

**Date**: YYYY-MM-DD HH:MM (Updated)
**Branch**: feature/branch-name
**Deadline**: YYYY-MM-DD (X days remaining)
**Session Duration**: X hours
**Focus Area**: What was worked on this session

## 🎯 Project Overview

Brief description of what we're building

## 🧭 Current Session Context

### Problems Solved

- Specific issue and solution
- Why this approach was chosen

### Key Decisions Made

- Decision: Rationale
- Trade-offs considered

### Discoveries & Gotchas

- Unexpected finding
- Workaround implemented

## ✅ Completed Implementation

### This Session

- Specific file: What was done and why
- Integration verified between X and Y

### Previously Completed

- Earlier work (collapsed or summarized)

## 🚧 Pending Implementation

### Immediate Next Steps (Granular)

1. **File**: `apps/invoice/src/specific/file.tsx`

   - Add function `handlePayment()`
   - Connect to existing `processStripe()` in lib/
   - Watch for: Stripe webhook signature validation

2. **Continue**: Unfinished from todo #3
   - Was implementing X, got to line 145
   - Next: Add error handling for Y case

### Remaining Features

- Higher level tasks from plan

## 🔧 Session Technical Notes

### What Worked

- Pattern/approach that succeeded
- Can reuse for similar features

### What Didn't Work

- Failed approach and why
- Don't try X because Y

### Dependencies Discovered

- Need to install package X
- Requires env var Y

## 📝 Environment Setup Required

Current working state requirements

## 🚀 To Continue From Here

```bash
# Exact commands to run
cd apps/invoice
pnpm dev
# Open: http://localhost:3011/invoices/new
# Test: Create invoice with tax calculation
```
````

### Current Todo List Status

- [x] Completed: Task description
- [🔄] In Progress: Task at 60% - next step is X
- [ ] Pending: Not started yet

### Mental Model & Context

Current understanding of how the system works:

- Component A talks to B via...
- Data flows from...
- Assumption: X works like Y

## 🔍 Key Files Modified This Session

- `path/to/file` - Why it was changed
- `another/file` - What was added

## 💡 Handoff Notes

If someone else continues (or you come back later):

- I was in the middle of...
- The tricky part is...
- Don't forget to...
- Open question: How should X handle Y?

## 🎉 Today's Achievements

Specific wins from this session

## 🐛 Known Issues/TODOs

- Issue found: Details and impact
- TODO discovered: Why it matters

```

This command ensures project documentation stays current and provides clear handoff points for continued development!
```
