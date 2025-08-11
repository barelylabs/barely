# barely.fm Module Development

## For New Claude Code Instance
1. Open Claude Code in this directory
2. Claude will read CLAUDE_PROJECT.md for immediate context
3. Check .claude/project/plan-organized.md for implementation tasks
4. All project artifacts are available in .claude/project/

## Development Flow
- This branch is focused solely on barely-fm-module
- Use organized plan to track progress through 4 features
- Original project: 0_Projects/barely-fm-module/

## Key Commands After Starting Claude Code
- Review implementation plan: Read .claude/project/plan-organized.md
- Check requirements: Read .claude/project/PRD.md
- Understand user needs: Read .claude/project/JTBD.md

## Project Goal
Launch barely.fm as a focused, affordable smart link platform targeting price-sensitive musicians, implementing modular architecture strategy to capture the $15-29/month market segment currently using free/limited tools.

## Technical Approach
- Environment-based configuration using `NEXT_PUBLIC_CURRENT_APP`
- Navigation filtering through conditional rendering
- Variant-specific pricing with separate Stripe IDs
- Shared codebase with environment-based feature flagging

## Ready to Start
✓ Dependencies installed
✓ Project artifacts copied
✓ Development environment ready
✓ Feature-based implementation plan available

Begin with Feature 1: Core App Variant Detection and Infrastructure