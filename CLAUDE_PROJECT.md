# Project Context: barely.fm Module - Focused Smart Link Experience

## Current Development
Working on: App modularization for focused user experiences, starting with barely.fm variant
Deadline: 2025-09-30 (7 weeks from project start)

## Key Files in This Worktree
- `.claude/project/PRD.md` - Comprehensive technical requirements and functional specifications
- `.claude/project/plan-organized.md` - Feature-based implementation roadmap with dependencies
- `.claude/project/JTBD.md` - User-focused jobs to be done analysis (6 jobs identified)
- `.claude/project/feature.md` - Detailed app modularization technical approach
- `.claude/project/plan.md` - Complete technical implementation checklist
- `.claude/project/integration-summary.md` - Technical enhancement integration details

## Current Focus
**Feature 1: Core App Variant Detection and Infrastructure**
- Foundation for all app variant functionality
- No dependencies - must be implemented first
- Environment variable validation for `NEXT_PUBLIC_CURRENT_APP`
- Create utility functions for variant detection

## Key Technical Decisions
- **Environment-based filtering** using `NEXT_PUBLIC_CURRENT_APP` over database flags
- **Conditional rendering** in existing components vs creating new components
- **Utility functions** for variant detection that scale to future variants
- **Backward compatibility** preserved when environment variable unset
- **Separate Stripe price IDs** for app variants with 20-40% lower pricing

## Success Criteria

### Technical Milestones
- Environment-based navigation filtering implemented using `NEXT_PUBLIC_CURRENT_APP`
- FM variant pricing structure with 20-40% lower price points than full platform
- Deployment infrastructure supporting app variants through GitHub Actions
- Task completion time reduction of 20% for FM-specific workflows

### Business Objectives
- Launch app.barely.fm with environment-based configuration by September 30
- Achieve 5%+ conversion of free tool users (Hypeddit/Toneden) to paid subscribers
- Enable 20% upgrade rate from FM to full barely.ai suite within 6 months
- Maintain sub-2-second page load times on 3G networks
- Reduce customer acquisition cost by 40% vs selling full suite

## Implementation Roadmap
1. **Core App Variant Detection** (Foundation - no dependencies)
2. **FM Navigation Experience** (Parallel development possible)
3. **App Variant Pricing** (Parallel development possible)  
4. **Deployment Infrastructure** (Requires 1-3 complete)

## Quick Start
1. This worktree is focused on implementing barely.fm module functionality
2. All project artifacts are in .claude/project/
3. Start with Feature 1 in plan-organized.md
4. Original project docs: 0_Projects/barely-fm-module/