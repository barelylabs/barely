# Usage Protection & Monetization - Development

## For New Claude Code Instance

1. Open Claude Code in this directory
2. Claude will read CLAUDE_PROJECT.md for immediate context
3. Check `.claude/project/plan-organized.md` for implementation tasks
4. All project artifacts are available in `.claude/project/`

## Development Flow

- This branch is focused solely on usage-protection
- Use the organized plan to track progress
- Original project: `0_Projects/barely-usage-protection/`

## Key Commands After Starting Claude Code

- Review implementation plan: `Read .claude/project/plan-organized.md`
- Check requirements: `Read .claude/project/PRD.md`
- Understand user needs: `Read .claude/project/JTBD.md`

## Quick Reference: Stripe IDs

All production IDs are ready to configure:

```
Bedroom:     prod_Txeo2HSM6HnJx4
Rising:      prod_TxevMytIBe6fon
Breakout:    prod_TxeweGMPwBFeVm
Bedroom+:    prod_Txey7RdoUEQFHi
Rising+:     prod_TxezRHktqwlWKI
Breakout+:   prod_Txf0wBNF8ZpgfR
Invoice Pro: prod_Txf4YDcKhcTd0G
```

## First Task: Milestone 1 - Foundation

1. Update Stripe IDs in `packages/const/src/workspace-plans.constants.ts`
2. Remove deprecated plans (agency, pro)
3. Add schema fields in `packages/db/src/sql/workspace.sql.ts`
4. Create enforcement utility in `packages/lib/src/functions/usage.fns.ts`

## Why This Matters

- **Revenue**: Fixing Stripe IDs enables paid subscriptions immediately
- **Costs**: Enforcement protects against 4x database cost growth
- **Trust**: Transparent usage gives users confidence in the platform
