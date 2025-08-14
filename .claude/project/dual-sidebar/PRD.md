# App Modularization for Focused User Experiences – PRD

### TL;DR

App Modularization creates focused, distraction-free variants of the barely.ai dashboard tailored to specific workflows. Starting with an FM-focused variant, users will see only streaming analytics features, settings, and media management—eliminating cognitive overhead from unused navigation items. The feature leverages existing environment-based deployment infrastructure to deliver specialized user experiences without code duplication.

---

## Goals

### Business Goals

- **Increase user engagement** by reducing interface complexity and improving task focus
- **Improve new user onboarding** with simplified, purpose-driven entry points
- **Expand market reach** by creating specialized products (barely.fm) that appeal to niche segments
- **Demonstrate technical flexibility** to support future product variants and personalization

### User Goals

- **Complete streaming analytics tasks** without distraction from unrelated features
- **Learn barely.ai capabilities** through focused, simplified interfaces
- **Work efficiently** in specialized contexts with appropriate tool sets
- **Maintain professional appearance** when collaborating or presenting to clients

### Non-Goals

- **User-customizable dashboards** (future consideration, not MVP)
- **Database-driven feature flags** (using environment-based approach instead)
- **Role-based permissions** (addressed through deployment variants, not access control)
- **Complete feature redesign** (leveraging existing navigation structure)

---

## User Stories

### Primary Persona – "Analytics-Focused Independent Artist"

- As an independent artist tracking streaming performance, I want to see only FM-related navigation, so that I can focus on analyzing my music data without getting distracted by email marketing or merchandise features.

- As a new user evaluating barely.ai's streaming analytics, I want a simplified interface showing only FM capabilities, so that I can quickly understand the value proposition without being overwhelmed by the full platform.

- As a power user working on streaming strategy, I want a specialized FM environment, so that I can be more productive during dedicated analytics sessions.

- As an artist manager collaborating on streaming data, I want team members to see only FM features, so that they don't get confused by irrelevant functionality outside their expertise.

- As a consultant presenting barely.ai to streaming-focused clients, I want a clean FM-only interface, so that I can demonstrate relevant capabilities professionally without explaining unrelated features.

---

## Functional Requirements

- **Environment-Based Navigation Filtering** (Priority: High)
  - Navigation renders conditionally based on `NEXT_PUBLIC_CURRENT_APP` environment variable
  - When `NEXT_PUBLIC_CURRENT_APP === 'fm'`, show only FM-specific navigation items
  - When undefined or `'app'`, show full navigation (default behavior unchanged)

- **FM-Focused Navigation** (Priority: High)
  - FM pages (`/{handle}/fm`) prominently featured
  - Basic settings access (profile, domains)
  - Minimal media management for FM content uploads
  - Workspace switcher remains available

- **Default Experience Preservation** (Priority: High)
  - Full navigation available when environment variable not set
  - No breaking changes to existing user workflows
  - Seamless operation for current users

- **Deployment Infrastructure** (Priority: High)
  - Leverage existing GitHub Actions `deploy-app-fm` workflow
  - Automatic environment variable configuration during deployment
  - Support for future variant deployments (app-press, app-link)

- **Visual Consistency** (Priority: Medium)
  - FM variant maintains barely.ai branding and design system
  - Navigation structure follows existing patterns
  - Responsive behavior preserved across devices

---

## User Experience

### Entry Point & Onboarding

- Users access FM variant through specialized URL (e.g., fm.barely.ai)
- First-time users see streamlined onboarding focused on streaming analytics setup
- Clear visual indication of focused environment without confusion

### Core Experience

- **Step 1:** User lands on simplified dashboard showing FM navigation
- **Step 2:** User navigates to FM analytics without distraction from other features
- **Step 3:** User completes streaming data analysis tasks efficiently
- **Step 4:** User accesses basic settings for configuration needs
- **Step 5:** User returns to focused workflow for regular analytics sessions

### Advanced Features & Edge Cases

- Workspace switching maintains navigation filtering per variant
- Team collaboration preserves focused experience for each member
- Error states and loading conditions respect the simplified interface
- Mobile experience maintains focus benefits with appropriate responsive behavior

### UI/UX Highlights

- **Minimal cognitive load** through reduced navigation options
- **Visual clarity** with cleaner, less cluttered sidebar
- **Accessibility maintained** through consistent design patterns
- **Professional appearance** suitable for client presentations

---

## Narrative

Sarah, an independent artist with 15K monthly Spotify listeners, opens her laptop for her weekly streaming analytics review. Instead of navigating through barely.ai's full dashboard with 15+ navigation options (email campaigns, merchandise, press kits, fan management), she accesses the FM variant showing only 4 focused items: FM analytics, media management, basic settings, and workspace switching.

She immediately clicks into her streaming data, analyzes her latest single's performance across platforms, and identifies which playlists are driving the most engagement—all without the mental distraction of seeing email template notifications or merchandise inventory alerts. The simplified interface helps her complete her analytics review 30% faster and with better focus on the streaming-specific insights she needs for her upcoming release strategy.

When her manager joins the call to review the data together, the clean FM interface presents professionally without requiring explanations about irrelevant features, making their collaboration more efficient and focused.

---

## Success Metrics

### User-Centric Metrics

- **Task completion time** for FM-specific workflows (target: 20% reduction)
- **User engagement depth** in FM features (target: increased session duration on FM pages)
- **New user activation** for FM-focused onboarding (target: improved completion rates)
- **Navigation efficiency** measured by clicks to reach FM functionality

### Business Metrics

- **FM feature adoption** rates in focused vs. full dashboard environments
- **User retention** for artists who start with FM-only experience
- **Expansion revenue** from FM-focused users upgrading to full platform
- **Customer satisfaction** scores for focused experience users

### Technical Metrics

- **Deployment success rate** for app variants
- **Page load performance** maintained across variants
- **Error rates** consistent between focused and full experiences
- **Mobile responsiveness** performance parity

### Tracking Plan

- **Navigation interactions** tracked per app variant
- **Feature usage patterns** compared between environments
- **User journey mapping** from FM-focused to full platform expansion
- **Time-to-value metrics** for streaming analytics workflows

---

## Technical Considerations

### Technical Needs

- **Environment variable configuration** using existing `NEXT_PUBLIC_CURRENT_APP` system
- **Conditional rendering logic** in React navigation components
- **GitHub Actions workflow** leveraging current `deploy-app-fm` pipeline
- **Build optimization** to maintain performance across variants

### Integration Points

- **Existing navigation component** (`dash-sidebar-nav.tsx`) modified for conditional rendering
- **Environment configuration system** extended for variant-specific settings
- **Vercel deployment pipeline** supporting multiple app variants
- **Analytics tracking** maintained across all variants

### Data Storage & Privacy

- **No additional data collection** required for basic variant functionality
- **User preferences** stored client-side through environment-based deployment
- **Privacy compliance** maintained through existing barely.ai data practices
- **Workspace data** remains consistent across all variants

### Scalability & Performance

- **Single codebase** prevents duplication and maintenance overhead
- **Environment-based scaling** allows easy addition of future variants
- **Bundle size optimization** through conditional loading where appropriate
- **CDN performance** maintained through existing Vercel infrastructure

### Potential Challenges

- **User confusion** between variants - mitigated through clear branding and URL differentiation
- **Feature discoverability** for FM users who might benefit from other tools - addressed through progressive disclosure strategies
- **Development complexity** for testing multiple variants - managed through environment-specific testing protocols
- **Support complexity** for multiple app experiences - handled through variant-aware documentation

---

*Created: 2025-08-09*  
*Feature: App Modularization for Focused User Experiences*  
*Target Release: Q1 2025*  
*Product Owner: [To be assigned]*