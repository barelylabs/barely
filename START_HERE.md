# Barely Invoice MVP Development

## For New Claude Code Instance
1. Open Claude Code in this directory
2. Claude will read CLAUDE_PROJECT.md for immediate context
3. Check .claude/project/plan-organized.md for implementation tasks
4. All project artifacts are available in .claude/project/

## Development Flow
- This branch is focused solely on barely-invoice-mvp
- Use organized plan to track progress
- Original project: 0_Projects/barely-invoice-mvp/

## Key Commands After Starting Claude Code
- Review implementation plan: Read .claude/project/plan-organized.md
- Check requirements: Read .claude/project/PRD.md
- Understand user needs: Read .claude/project/JTBD.md

## First Implementation Task
**Feature 0: Core App Infrastructure & Database Foundation**

Start by:
1. Creating `apps/invoice/` directory structure
2. Setting up database tables for invoices and clients
3. Configuring the app variant

## Project Goals
- Enable invoice creation in <60 seconds
- Stripe payment collection
- Workspace-scoped multi-tenancy
- MVP deadline: 2025-08-31

## Technical Stack
- Next.js app variant (like fm/vip)
- tRPC for API
- Stripe Connect for payments
- SendGrid for emails
- Workspace-scoped database tables