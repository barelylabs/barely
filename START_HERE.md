# Barely Fulfillment Partner Development

## For New Claude Code Instance
1. Open Claude Code in this directory
2. Claude will read CLAUDE_PROJECT.md for immediate context
3. Check `.claude/project/plan-organized.md` for implementation tasks
4. All project artifacts are available in `.claude/project/`

## Development Flow
- This branch is focused solely on implementing the Barely Fulfillment Partner feature
- Use the organized plan to track progress through 4 milestones
- Original project: `0_Projects/barely-fulfillment-partner/`

## Key Commands After Starting Claude Code
- Review implementation plan: `Read .claude/project/plan-organized.md`
- Check requirements: `Read .claude/project/PRD.md`
- Understand user needs: `Read .claude/project/JTBD.md`

## Business Context
- Beta client: The Now (UK artist) - products already stocked in Brooklyn
- 3 additional US clients contingent on this feature
- Revenue opportunity: ~$150k+ via fulfillment fees
- Supports $1M GMV target for 2026

## Quick Reference - Implementation Order

### Milestone 1: Foundation (No user-facing changes)
1. Add env vars for Barely address
2. Modify workspace schema (4 new fields)
3. Modify cart schema (2 new fields)
4. Create fulfillment utility functions

### Milestone 2: Checkout Integration
1. Modify shipping calculation to accept dynamic origin
2. Integrate fulfillment logic into cart creation
3. Add fulfillment fee to Stripe application_fee_amount

### Milestone 3: Artist Settings UI
1. Create fulfillment settings page
2. Add to settings navigation (when eligible)

### Milestone 4: Order Management
1. Add fulfillment filter to orders query
2. Add filter dropdown to orders UI
3. Show fulfillment info on order detail

## Testing Strategy
- Each milestone has its own test checklist in plan-organized.md
- Manual verification steps included for checkout flow
