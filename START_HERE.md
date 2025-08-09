# Bio Link MVP (barely.bio) Development

## For New Claude Code Instance
1. Open Claude Code in this directory
2. Claude will read CLAUDE_PROJECT.md for immediate context
3. Check .claude/project/plan-organized.md for implementation tasks
4. All project artifacts are available in .claude/project/

## Development Flow
- This branch is focused solely on bio-mvp implementation
- Use organized plan to track progress
- Original project: 0_Projects/bio-mvp/
- Follow NEW_APP_GUIDELINES patterns (already aligned in plan.md)

## Key Commands After Starting Claude Code
- Review implementation plan: Read .claude/project/plan-organized.md
- Check requirements: Read .claude/project/PRD.md
- Understand user needs: Read .claude/project/JTBD.md
- See technical specs: Read .claude/project/plan.md (aligned with guidelines)

## Implementation Order
1. **Feature 1 (MVP Foundation)** - Basic bio page creation & viewing ← START HERE
2. **Feature 2 (Link Management)** - Link CRUD and customization
3. **Feature 6 (Mobile Optimization)** - Performance for 90% of users
4. **Feature 3 (Email Capture)** - Fan relationship building
5. **Feature 4 (Analytics)** - Behavior tracking and insights
6. **Feature 5 (Themes)** - Visual customization
7. **Feature 7 (Admin Tools)** - Management and operations

## Key Technical Specs
- **Port**: 3011
- **App Name**: @barely/bio
- **Public Router**: bio-render
- **Admin Router**: bio
- **Database**: Use existing Bios and BioButtons schemas
- **Validation**: drizzle-zod for auto-generation
- **Rate Limiting**: Upstash for public endpoints