# Project Context: Cart Performance Optimization

## Current Development
Working on: Critical performance fix to reduce cart load time from 9.3s to under 2.5s
Deadline: 2025-09-21

## Key Files in This Worktree
- `.claude/project/PRD.md` - Full product requirements
- `.claude/project/plan-organized.md` - Implementation checklist by feature
- `.claude/project/JTBD.md` - Jobs to be done analysis
- `.claude/project/feature.md` - Feature overview and rationale

## Current Focus
**Feature 0: Core Infrastructure Setup** - Prerequisites that enable all other features
- Extract workspace query from getFunnelByParams
- Create cart-specific BrandKit API route
- Add BrandKit data validation
- Write unit tests for cache functions

Then proceed to **Feature 1: Eliminate Render-Blocking Query** (the critical fix)

## Key Technical Decisions
1. Use React's `cache()` function for request deduplication
2. Split data fetching: BrandKit (cacheable) vs cart data (real-time)
3. Implement at layout level in layout.tsx
4. Reuse BrandKitProvider from UI package
5. Progressive enhancement with Suspense boundaries
6. Edge caching: BrandKit 5-min TTL, products 1-min TTL

## Success Criteria
**Performance Metrics:**
- Lighthouse Score: >70 (from 37)
- Largest Contentful Paint: <2.5s (from 9.3s)
- Total Blocking Time: <200ms (from 3,700ms)
- Speed Index: <3s (from 6.2s)

**Business Metrics:**
- Cart abandonment: Reduce by 30%+
- Conversion rate: Increase by 20%+
- Mobile conversion: Increase by 40%+

## Quick Start
1. This worktree is focused on implementing cart performance optimization
2. All project artifacts are in .claude/project/
3. Start with the organized plan in plan-organized.md
4. Original project docs: 0_Projects/cart-performance-optimization/

## Critical Issue
The entire cart page render is blocked waiting for a workspace query to fetch a single brand color. This synchronous blocking query is causing catastrophic performance issues (9.3s load time, 37 Lighthouse score).