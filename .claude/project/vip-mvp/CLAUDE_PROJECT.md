# Project Context: VIP MVP (barely.vip)

## Current Development
Working on: High-conversion email capture platform that exchanges exclusive audio content for fan emails
Deadline: 2025-08-09 (8 days remaining)

## Key Files in This Worktree
- `.claude/project/PRD.md` - Full product requirements
- `.claude/project/plan-organized.md` - Implementation checklist by feature
- `.claude/project/JTBD.md` - Jobs to be done analysis
- `.claude/project/feature.md` - Feature overview and rationale

## Current Focus
Feature 1 (Core Infrastructure) - Foundation needed before any other features can be built:
- Database schema (vipReleases, vipAccessLogs tables)
- File storage setup with S3
- New Next.js app at `apps/vip`
- Testing infrastructure

## Key Technical Decisions
1. **Separate App**: New `apps/vip` rather than extending press app
2. **Download Method**: S3 presigned URLs with 24-hour expiration
3. **Email Validation**: Client-side validation with server verification
4. **Analytics**: Extend existing Tinybird events
5. **URL Structure**: Subdomain routing (barely.vip)

## Success Criteria
- 30%+ email capture rate from paid ad traffic (vs. 10% industry standard)
- 5%+ email-to-purchase conversion within 30 days
- 2x merchandise revenue for participating artists
- Sub-3-second page load on 3G networks
- 99%+ successful download delivery rate

## Architecture Overview
- New Next.js app at `apps/vip` following existing monorepo patterns
- Reuses audio player component from barely.press
- PostgreSQL tables: `vipReleases`, `vipAccessLogs`
- S3 storage with presigned URLs for secure downloads
- Integrates with barely.email for automated nurture sequences
- Uses existing Tinybird analytics pipeline

## Quick Start
1. This worktree is focused on implementing VIP MVP
2. All project artifacts are in .claude/project/
3. Start with Feature 1 implementation tasks in plan-organized.md
4. Original project docs: 0_Projects/vip-mvp/