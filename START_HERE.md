# Cart Checkout TTFP Optimization - Development

## For New Claude Code Instance

1. Open Claude Code in this directory
2. Claude will read CLAUDE_PROJECT.md for immediate context
3. Check `.claude/project/plan-organized.md` for implementation tasks
4. All project artifacts are available in `.claude/project/`

## Development Flow

- This branch is focused solely on cart-checkout-ttfp
- Use organized plan to track progress through milestones
- Original project: `0_Projects/cart-checkout-ttfp/` (in vault root)

## Implementation Milestones

| Milestone | Description |
|-----------|-------------|
| M0 | Performance Baseline (measure current TTFP) |
| M1 | Remove Shipping from Cart Creation |
| M2 | Create Shipping Calculation Mutation |
| M3 | Handle Null Shipping in UI |
| M4 | Client-Side Shipping Trigger |
| M5 | Error Handling |
| M6 | Integration Testing |

## Key Commands After Starting Claude Code

- Review implementation plan: `Read .claude/project/plan-organized.md`
- Check requirements: `Read .claude/project/PRD.md`
- Understand user needs: `Read .claude/project/JTBD.md`

## Quick Reference

**Target:** TTFP < 2 seconds (from 5s)

**Core Change:** Remove shipping calculation from cart creation, trigger it client-side after page renders

**Key File:** `packages/lib/src/functions/cart.fns.ts` lines 334-373
