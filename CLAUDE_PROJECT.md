# Project Context: Bio Link MVP (barely.bio)

## Current Development
Working on: Conversion-optimized link-in-bio solution that transforms bio visitors into email subscribers
Deadline: 2025-10-31 (3 months from project start)

## Key Files in This Worktree
- `.claude/project/PRD.md` - Full product requirements
- `.claude/project/plan-organized.md` - Implementation checklist by feature
- `.claude/project/JTBD.md` - Jobs to be done analysis
- `.claude/project/feature.md` - Feature overview and rationale
- `.claude/project/plan.md` - Technical implementation plan (aligned with NEW_APP_GUIDELINES)

## Current Focus
**Feature 1: MVP Foundation - Basic Bio Page Creation & Viewing**

This foundational feature enables artists to create a bio page and fans to view it. Must be completed first as all other features depend on it.

Key tasks:
- Create new Next.js app at `apps/bio` (Port 3011)
- Set up dual router architecture (admin + public)
- Implement bio CRUD operations with proper tRPC patterns
- Create validation schemas using drizzle-zod
- Configure all required monorepo settings

## Key Technical Decisions
1. **Static Generation with ISR**: Next.js ISR for sub-2s load times
2. **Email Capture as Native Component**: Built-in to minimize API calls
3. **Edge Analytics**: Tinybird for non-blocking analytics
4. **Port Assignment**: 3011 for the bio app
5. **Database Client Strategy**: dbHttp for single operations, dbPool for transactions
6. **Type-Safe tRPC**: All routes use `satisfies TRPCRouterRecord`
7. **Rate Limiting**: Upstash for public endpoint protection

## Success Criteria
- 50%+ of agency artists migrate from Linktree within 3 months
- 20%+ email capture rate from bio page visitors
- 10%+ increase in downstream conversions vs. Linktree users
- Sub-2-second page load time on 3G networks
- 99.9%+ uptime availability

## Quick Start
1. This worktree is focused on implementing the barely.bio MVP
2. All project artifacts are in .claude/project/
3. Start with Feature 1 in plan-organized.md
4. Original project docs: 0_Projects/bio-mvp/
5. Follow NEW_APP_GUIDELINES patterns (see plan.md for aligned version)