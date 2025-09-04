# Feature: Bio Engine Block Extensions for Landing Pages

## Context & Background

### Related Work
- **Builds On**: [[0_Projects/bio-mvp]] - Leverages existing bio engine architecture and UX patterns
- **Replaces**: MDX-based landing page editor - Current solution is too complex and brittle for clients
- **Competes With**: Beacons.ai landing page builder - Market expectation for basic page building

### Historical Context
- **Current State**: 10+ landing pages built with MDX editor, but clients can't self-serve edits
- **Pain Points**: MDX editor deletion bugs, non-intuitive interface, requires deep Lexical knowledge
- **Opportunity**: Bio MVP has established clean block patterns and intuitive UX

## Problem Statement

Agency clients need to create and edit sales-focused landing pages but the current MDX editor is too difficult to use, forcing manual intervention for every edit and preventing self-service SaaS scaling.

### Evidence of Need
- 10 existing clients couldn't use MDX editor independently
- Competitors (Beacons.ai) offer landing page builders as standard
- Immediate revenue opportunity: Major agency client ready to launch merch campaign
- Current editor blocks productization of landing page feature

## Target Users

Agency clients and independent artists (1K-100K monthly listeners) who need sales-focused landing pages for:
- Merch/CD campaigns
- Tour announcements
- Album launches
- Fan acquisition funnels

### Differentiation from Bio Links
- Bio links: Quick navigation to multiple destinations
- Landing pages: Narrative sales pages with conversion focus
- Both use same rendering engine but different content blocks

## Current State & Pain Points

### How Users Handle This Today
- Request manual edits from agency team (not scalable)
- Use external tools like Carrd or Beacons.ai
- Attempt MDX editor and give up due to complexity

### Validated Pain Points
- MDX deletion bug: Must add space, delete block, delete space
- Asset links don't update (stored as markdown text)
- No visual preview of complex blocks
- Requires technical knowledge of MDX/Lexical

## Recommended Solution

Extend the bio engine with 4 additional block types that enable full landing page creation while maintaining the intuitive UX patterns already established in the bio MVP.

### Why This Approach
- Leverages existing bio MVP patterns (1-2 days vs weeks)
- Unified rendering engine for both bio links and landing pages
- Avoids deep Lexical/MDX refactoring
- Immediately enables client self-service

## Success Criteria

### Near-term (1 week)
- Major agency client launches merch campaign using bio engine
- Zero manual edits required after initial setup
- Page renders existing landing page content correctly

### Medium-term (1 month)
- 5+ clients migrate from MDX editor to bio engine
- 90% reduction in support requests for landing page edits
- Landing pages achieve same conversion rates as MDX versions

## Core Functionality (MVP)

### Must Have - 4 New Block Types

1. **Markdown Block**
   - Rich text editing (headings, bold/italic/underline, lists)
   - Uses existing app markdown editor component
   - Renders with existing markdown rendering pattern

2. **Image Block**
   - Single image with optional caption
   - Uses same asset picker as link blocks
   - Responsive sizing for mobile/desktop

3. **Two-Panel Block**
   - Image on one side, content on other
   - Title, text, and CTA button (URL or Barely asset)
   - Mobile/desktop layout toggles (image position)

4. **Cart Block**
   - Select cartFunnel from workspace
   - Title and subtitle (like BioLink buttons)
   - Direct link to checkout page

### Consistent Pattern
- All blocks use same edit modal pattern as Links block
- Click-to-edit in bio preview
- Same save/cancel flow

## Out of Scope for MVP

### Not Needed Initially
- Video blocks (no current client use case)
- Form blocks beyond cart (email capture exists)
- Custom HTML/embed blocks
- Multi-column layouts beyond 2-panel
- Animation or transition effects

### Available Through Existing Blocks
- Email capture (already in bio MVP)
- Social links (Links block)
- Basic CTAs (Links block with URLs)

## Integration Points

### With Bio MVP
- Extends existing block registry
- Uses same editor modal patterns
- Shares rendering pipeline
- Same preview system

### Technical Integration
- Extends: `@barely/ui` components
- Reuses: Bio block editor framework
- Database: Extends `BioBlocks` schema
- No new infrastructure required

## Complexity Assessment

**Overall Complexity**: Simple

**Reduced Complexity Through:**
- Reusing bio MVP patterns
- No MDX/Lexical deep dive required
- Established component library
- Existing asset management system

**Remaining Complexity:**
- Two-panel responsive layout logic
- Cart block integration with cartFunnel system

## Human Review Required

- [ ] Validate 1-2 day timeline is realistic
- [ ] Confirm these 4 blocks cover 90% of landing page needs
- [ ] Check if cart block needs any special checkout handling

## Technical Considerations

- Fits within bio app architecture
- Extends existing block types enum
- Uses same tRPC patterns for CRUD
- Database migration for new block types

## Migration Path

### From MDX Editor
- Export existing content as markdown
- Manual recreation in bio engine (one-time)
- Deprecate MDX editor after migration

### Future State
- Bio links and landing pages in same system
- Unified analytics and performance monitoring
- Single codebase to maintain

## Future Possibilities

### Natural Extensions
- A/B testing different block arrangements
- Template library for common landing page types
- Advanced analytics per block type
- AI-assisted copy generation for blocks

### Scope Control
- Resist adding complex layout systems
- Keep blocks atomic and composable
- Don't recreate full page builders (Webflow, etc.)