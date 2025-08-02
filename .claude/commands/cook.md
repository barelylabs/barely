---
description: Load project context, analyze progress, and start implementing the next tasks
allowed-tools:
  - Read
  - Grep
  - LS
  - TodoWrite
  - mcp__time__get_current_time
---

# cook

Get up to speed on the current project and start implementing. This command loads project context, analyzes task progress, and begins work on the next uncompleted items.

## Usage

```bash
/cook
```

## What This Command Does

I'll automatically:
1. Load project context from CLAUDE_PROJECT.md and plan files
2. Analyze which tasks are completed vs pending
3. Present a clear progress summary with deadline awareness
4. Begin implementing the next uncompleted tasks after confirmation

## Implementation Process

### 1. Load Project Context

First, I'll check for and read the following files:
- `CLAUDE_PROJECT.md` - Primary project context
- `START_HERE.md` - Workflow guidance (if exists)
- `.claude/project/plan-organized.md` - Implementation plan with tasks

!pwd

!test -f CLAUDE_PROJECT.md && echo "✓ Found CLAUDE_PROJECT.md" || echo "✗ CLAUDE_PROJECT.md not found"
!test -f START_HERE.md && echo "✓ Found START_HERE.md" || echo "✗ START_HERE.md not found"
!test -f .claude/project/plan-organized.md && echo "✓ Found plan-organized.md" || echo "✗ plan-organized.md not found"

### 2. Read Project Files

@CLAUDE_PROJECT.md

@.claude/project/plan-organized.md

### 3. Analyze Progress

I'll parse the implementation plan to:
- Count completed (✓) vs pending tasks per feature
- Calculate overall project progress
- Identify the current feature being worked on
- Extract the next 3-5 uncompleted tasks

### 4. Check Recent Activity

!git log --oneline -10

### 5. Present Status Summary

Based on my analysis, I'll show:
- Project name and deadline (with days remaining)
- Progress overview for each feature
- Current focus area
- Next tasks to implement
- Request confirmation before proceeding

### 6. Begin Implementation

If you confirm, I'll:
- Create a todo list with TodoWrite for the next tasks
- Mark the first task as in_progress
- Start implementing following existing patterns
- Run tests and linting after changes
- Provide clear progress updates

## Error Handling

- **Missing project files**: I'll inform you which files are missing and suggest running from a project worktree with proper setup
- **No plan-organized.md**: I'll check for alternative planning documents in `.claude/project/`
- **All tasks complete**: I'll suggest next steps like running full test suite, creating PR, or updating documentation
- **Parse errors**: If the plan format is unexpected, I'll show what I found and ask for guidance

## Command Benefits

This command provides:
- **Instant context loading** - No need to explain the project
- **Accurate progress tracking** - Always know what's done and what's next
- **Deadline awareness** - Stay on track with time-boxed projects
- **Consistent workflow** - Same process every time you return to work

Just run `/cook` and I'll immediately understand where we left off and continue the implementation!