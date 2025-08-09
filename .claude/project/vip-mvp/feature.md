# Feature: VIP Email-Gated Downloads

## Context & Background

### Related Work
- **Builds On**: [[1_Areas/development/apps/press/]] - Existing streaming infrastructure
- **Differs From**: [[0_Projects/bio-link-mvp/]] - Focused conversion vs. general homepage
- **Integrates With**: [[barely.email]], [[barely.cart]] - Email capture to sales funnel

### Historical Context
- **Previous Attempts**: None - greenfield opportunity
- **Lessons Applied**: Single-purpose pages convert better (from agency experience)
- **Success Factors**: Real client demand with immediate revenue impact

## Problem Statement

Agency clients need focused landing pages for ad campaigns that convert paid traffic into email subscribers through exclusive content offers, ultimately driving merchandise sales.

### Evidence of Need
- Gap in existing solution: Bio pages too general for paid ad traffic
- User feedback: High-value agency clients ($5k+ MRR) specifically requesting
- Market validation: Clients spending on ads need better conversion tools

## Target Users

**Primary**: Marketing agencies managing 10+ artists with active merch businesses
**Secondary**: Individual artists running paid ad campaigns

### Differentiation from Existing Users
- Not served by bio pages because: Need focused, single-action conversion
- Higher need for: Direct ad traffic → email → sale funnel
- Currently using: Custom landing pages or losing conversions

## Current State & Pain Points

### How Users Handle This Today
- Current workaround: Linktree with Toneden or custom Wordpress pages
- Use bio pages but: Too many options dilute conversion
- External tools: Paying $50+/month for inferior solutions

### Validated Pain Points
- Low email capture from paid traffic: Current tools convert <10%
- Complex setup: Multiple tools to connect ads → email → merch
- Quantified impact: Losing 50%+ of potential revenue from poor conversion

## Recommended Solution

Email-gated download pages for exclusive tracks that capture fan emails and feed directly into automated merchandise sales funnels.

### Why This Approach
- Addresses conversion gap that bio pages miss
- Simpler than mixtape platforms (download only)
- Leverages existing streaming infrastructure from press
- Avoids complex mobile audio issues with download fallback

## Success Criteria

### Differentiated Metrics
- Email capture rate: 30%+ (vs. 10% current tools)
- Email → first sale: 5% conversion in 30 days
- Revenue impact: 2x merchandise sales for participating artists

### Learning from Previous Attempts
- NOT measuring: Streaming metrics or time on site
- Focus on: Email captures and downstream revenue

## Core Functionality (MVP)

### Must Have (Validated through context)
- Single track upload with artwork
- Email gate with instant unlock
- Download option (fallback for mobile)
- Auto-add to barely.email with tags
- Basic analytics (views, captures, downloads)

### Reusable Components
- Use barely.press audio player for streaming
- Extend barely.email API for list management
- Apply tinybird event tracking

## Out of Scope for MVP

### Learned from Previous Attempts
- Multiple tracks per release (complexity)
- Artist discovery features (not the goal)
- Social sharing (dilutes conversion focus)

### Available in Existing Solutions
- Playlist functionality (use mixtape later)
- Community features (not conversion-focused)

## Integration Points

### With Existing Features
- barely.email: Auto-add with "vip-download-[release]" tag
- barely.cart: Post-download redirect + email sequence
- barely.link: Track ad → VIP → cart funnel

### Technical Integration
- Extends: barely.press streaming infrastructure
- Reuses: Authentication and workspace system
- New requirements: Download delivery system only

## Complexity Assessment

**Overall Complexity**: Simple

**Reduced Complexity Through:**
- Reusing press streaming player
- Single track limitation
- Download-only mobile fallback

**Remaining Complexity:**
- Download file delivery at scale
- Email verification flow

## Human Review Required

- [ ] Assumption: 30% email capture rate achievable
- [ ] Differentiation: One track enough value for email
- [ ] Priority: Confirm 30-day timeline with clients

## Technical Considerations

[High-level only - informed by existing architecture]
- Fits within existing app structure at `apps/vip/`
- Extends current event tracking with VIP events
- New requirement: Secure download URLs with expiration

## Migration Path

### From Existing Solutions
- Users of Toneden: Simple CSV import of emails
- Bio page users: Add VIP pages for campaigns
- Gradual adoption through: Keep bio for organic, VIP for paid

### Deprecation Considerations
- Could replace: External landing page tools
- Coexistence strategy: Bio for discovery, VIP for conversion

## Future Possibilities

### Based on Historical Patterns
- If successful, could enable: Paid VIP tiers ($5-20/month)
- Watch for: Scope creep toward full streaming platform
- Natural evolution toward: Multi-track EPs, then albums

---

## Revenue Model Validation

### Unit Economics
- Average first purchase: $15
- Email → sale conversion: 5%
- Value per email: $0.75
- Target emails/month: 4,000 (across clients)
- Additional revenue: $3,000/month
- Platform take (10%): $300/month additional

### Client Success Metrics
- Current sales: $3k/month
- Target sales: $6k/month
- Required emails: 1,000/month per artist
- Required traffic: 3,333 visitors at 30% conversion

This math validates the feature can achieve its revenue goals with reasonable traffic levels.