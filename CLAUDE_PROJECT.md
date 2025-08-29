# Project Context: Bio Landing Page Blocks

## Current Development
Working on: Extending bio platform with 4 new block types for landing page creation
Deadline: 2025-09-15 (aligns with agency client campaign launch)

## Key Files in This Worktree
- `.claude/project/PRD.md` - Full product requirements
- `.claude/project/plan.md` - Implementation checklist by feature
- `.claude/project/JTBD.md` - Jobs to be done analysis
- `.claude/project/feature.md` - Feature overview and rationale

## Current Focus
Start with Phase 1: Infrastructure Setup
- Database migration for new block types
- Update block registry and type definitions
- Security headers and validation utilities
- Performance foundation (caching, lazy loading)

Then implement blocks in order:
1. Markdown Block (3-4 hours)
2. Image Block (2-3 hours)
3. Two-Panel Block (3-4 hours)
4. Cart Block (2-3 hours)

## Key Technical Decisions
- Extend existing `BioBlockType` enum (not separate system)
- Reuse modal editor patterns from Links block
- Leverage existing markdown editor from `@barely/ui`
- Store block data in JSONB with zod validation
- Use CSS Grid with container queries for Two-Panel block
- Direct cart checkout links (no embedded iframe)

## Success Criteria
- 80% of landing page users migrate from MDX editor within 30 days
- 0 support tickets for basic landing page edits
- <30 minutes from start to published landing page
- Major agency client successfully launches merch campaign
- Maintain <2s page load on 3G networks
- All blocks render consistently across devices

## Quick Start
1. This worktree is focused on implementing bio landing page blocks
2. All project artifacts are in .claude/project/
3. Start with the organized plan in plan.md
4. Original project docs: 0_Projects/bio-landing-page-blocks/

## Implementation Notes
- Building on completed bio-mvp platform (now in production)
- 10+ agency clients struggling with current MDX editor
- Major agency client ready to launch merch campaign (immediate need)
- Estimated implementation: 1-2 days total
- Reuse everything: patterns, components, infrastructure from bio platform