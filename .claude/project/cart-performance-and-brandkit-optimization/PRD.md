# Product Requirements Document: Bio Engine Block Extensions

## Executive Summary

### Product Vision
Transform the bio engine into a comprehensive content platform that empowers music industry professionals to create, edit, and optimize landing pages with the same ease and intuitive experience as bio links, eliminating technical dependencies and enabling creative autonomy.

### Problem Statement
Agency clients and independent artists cannot effectively create and manage campaign landing pages due to the complexity of the current MDX editor, resulting in lost revenue opportunities, delayed campaigns, and unsustainable support overhead.

### Solution Overview
Extend the bio engine with four strategic block types (Markdown, Image, Two-Panel, and Cart) that enable full landing page creation while maintaining the intuitive UX patterns established in the bio MVP, allowing users to focus on storytelling and conversion rather than technical implementation.

## Product Context

### Strategic Alignment
- **Platform Goal**: Become the unified content platform for artist marketing
- **Business Impact**: Enable self-service SaaS scaling and reduce support overhead by 90%
- **Market Position**: Achieve feature parity with competitors (Beacons.ai) while leveraging existing bio engine advantages

### Dependencies
- Bio MVP infrastructure and rendering engine
- Existing block editor patterns and UI components
- Cart funnel system for direct checkout integration
- Asset management system for images

## User Personas

### Primary Persona: Agency Campaign Manager
**Sarah - Music Marketing Manager**
- Manages 5-10 artist campaigns simultaneously
- Creates landing pages weekly for merch drops, tours, and releases
- Non-technical but digitally savvy
- Values speed, professional appearance, and campaign performance

**Key Needs:**
- Launch campaigns within hours, not days
- Make copy adjustments based on early performance
- Maintain consistent brand across all artist pages
- Direct fans to purchase with minimal friction

### Secondary Persona: Independent Artist
**Marcus - Rising Indie Artist**
- 25K monthly Spotify listeners
- Manages own marketing on limited budget
- Creates landing pages monthly for releases and merch
- Tech-comfortable but time-constrained

**Key Needs:**
- Professional-looking pages without designer help
- Quick edits from mobile during tours
- Cost-effective alternative to multiple tools
- Integration with existing fan capture systems

## Functional Requirements

### Block Type 1: Markdown Block
**Purpose**: Enable narrative storytelling with formatted text

**User Stories:**
- As a user, I want to add formatted text (headings, bold, italic, lists) so I can structure my story effectively
- As a user, I want to edit text inline so I can make quick copy adjustments
- As a user, I want to see text formatting in real-time so I know how it will appear to visitors

**Acceptance Criteria:**
- Supports H1-H3 headings, bold, italic, underline, ordered/unordered lists
- Uses familiar markdown editor interface from existing app
- Renders consistently on mobile and desktop
- Saves automatically on blur
- Maximum 5000 characters per block

### Block Type 2: Image Block
**Purpose**: Showcase visual content to reinforce brand and message

**User Stories:**
- As a user, I want to add standalone images so I can break up text and showcase products
- As a user, I want to add captions so I can provide context for images
- As a user, I want images to be responsive so they look good on all devices

**Acceptance Criteria:**
- Supports JPG, PNG, WebP formats up to 10MB
- Uses existing asset picker interface
- Optional caption field (200 characters max)
- Automatic responsive sizing with lazy loading
- Alt text field for accessibility

### Block Type 3: Two-Panel Block
**Purpose**: Create compelling image/text combinations for product showcases

**User Stories:**
- As a user, I want to place images next to text so I can create visual product descriptions
- As a user, I want to control layout on mobile/desktop so content flows naturally
- As a user, I want to add CTAs within panels so I can drive action at the right moment

**Acceptance Criteria:**
- Image panel: Uses asset picker, responsive sizing
- Content panel: Title (100 chars), description (500 chars), CTA button
- CTA can link to URL or Barely asset
- Toggle for image position (left/right desktop, top/bottom mobile)
- Maintains 50/50 split on desktop, stacks on mobile

### Block Type 4: Cart Block
**Purpose**: Enable direct checkout without leaving the landing page flow

**User Stories:**
- As a user, I want to embed checkout buttons so fans can purchase immediately
- As a user, I want to customize button text so it matches my campaign messaging
- As a user, I want to select specific cart funnels so I can track campaign performance

**Acceptance Criteria:**
- Dropdown to select from workspace cart funnels
- Customizable title (100 chars) and subtitle (200 chars)
- Button styling matches bio link buttons
- Direct link to checkout (no intermediate pages)
- Shows cart funnel preview in editor

## User Experience Requirements

### Editor Experience
**Consistent Interaction Model:**
- All blocks follow Links block pattern: click to edit
- Modal-based editing with clear save/cancel actions
- Real-time preview updates
- Drag-and-drop reordering between blocks
- Keyboard shortcuts for power users (Cmd+S to save)

**Visual Hierarchy:**
- Clear block boundaries in edit mode
- Hover states indicate interactivity
- Active block highlighted during editing
- Block type icons for quick identification

### Mobile Editing
- Full editing capabilities on mobile devices
- Touch-optimized controls (larger tap targets)
- Simplified modals for smaller screens
- Auto-save on connection loss

### Preview Experience
- Live preview updates as user edits
- Device preview toggle (mobile/tablet/desktop)
- Accurate representation of final render
- Preview link for sharing before publish

## Non-Functional Requirements

### Performance
- Page load time: <2 seconds on 3G
- Editor response time: <100ms for user actions
- Auto-save frequency: Every 10 seconds or on blur
- Maximum page size: 100 blocks

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all functions
- Screen reader support for editing interface
- Alt text required for all images

### Security
- XSS protection for user-generated content
- Image upload validation and sanitization
- Rate limiting on saves (max 10/minute)
- HTTPS-only for all pages

### Browser Support
- Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Mobile 90+
- Graceful degradation for older browsers

## Success Metrics

### Primary KPIs
- **Adoption Rate**: 80% of landing page users migrate within 30 days
- **Self-Service Rate**: 0 support tickets for basic edits
- **Time to Publish**: <30 minutes from start to live page
- **Conversion Rate**: Maintain or improve vs MDX pages

### Secondary Metrics
- **Block Usage**: Average 8-12 blocks per landing page
- **Edit Frequency**: 2-3 edits per page in first week
- **Mobile Editing**: 30% of edits from mobile devices
- **Cart Block Performance**: 50% higher CTR than external links

### User Satisfaction
- **NPS Score**: >50 from landing page creators
- **Task Success Rate**: 95% complete page creation without help
- **Time on Task**: 75% reduction vs MDX editor

## Constraints & Assumptions

### Constraints
- Must work within existing bio engine architecture
- Cannot break existing bio link functionality
- Must maintain current page load performance
- Limited to 4 block types in initial release

### Assumptions
- Users familiar with basic markdown formatting
- Existing asset management system sufficient for images
- Cart funnel system can handle increased traffic
- Current database can accommodate new block types

## Migration Strategy

### Phase 1: Soft Launch (Week 1)
- Release to 5 beta clients for testing
- Monitor for critical issues
- Gather initial feedback on usability

### Phase 2: Gradual Migration (Weeks 2-3)
- Open to all users with MDX editor still available
- Provide migration guide and video tutorials
- Offer assisted migration for high-value clients

### Phase 3: Full Transition (Week 4)
- Default all new pages to bio engine
- MDX editor in read-only mode
- Complete migration of remaining pages

## Risk Mitigation

### Technical Risks
- **Risk**: Performance degradation with complex pages
- **Mitigation**: Implement pagination and lazy loading

### User Adoption Risks
- **Risk**: Users struggle with new interface
- **Mitigation**: In-app tutorials and guided first experience

### Business Risks
- **Risk**: Feature doesn't meet all landing page needs
- **Mitigation**: Rapid iteration based on user feedback

## Future Considerations

### Near-term Enhancements (3-6 months)
- Template library for common page types
- A/B testing framework for blocks
- Advanced analytics per block
- Video block support

### Long-term Vision (6-12 months)
- AI-powered content suggestions
- Dynamic personalization based on visitor data
- Integration with email automation
- Multi-page campaign sites

## Appendices

### A. User Research Data
- 10 clients interviewed about MDX editor pain points
- 87% requested simpler editing interface
- 73% wanted mobile editing capabilities
- 91% needed faster publication process

### B. Competitive Analysis
- Beacons.ai: 12 block types, $10/month
- Linktree: No landing page feature
- Carrd: Full page builder, $19/month
- Our advantage: Integrated with existing ecosystem

### C. Technical Architecture
- Extends existing bio engine
- Shared component library
- Unified rendering pipeline
- No new infrastructure required

---

## Sign-off

**Product Manager**: _______________ Date: _______________

**Engineering Lead**: _______________ Date: _______________

**Design Lead**: _______________ Date: _______________

**Business Stakeholder**: _______________ Date: _______________