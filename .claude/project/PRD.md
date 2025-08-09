# barely.bio (Link-in-Bio) – Product Requirements Document

### TL;DR

barely.bio is a conversion-optimized link-in-bio solution for independent artists that transforms a simple link list into an intelligent fan acquisition engine. Unlike generic bio link tools, barely.bio integrates seamlessly with the barely.ai ecosystem to capture email subscribers, track analytics across the entire fan journey, and enable automatic remarketing—all while providing a simple, mobile-first experience that artists can set up in minutes.

---

## Goals

### Business Goals

- **Increase Platform Adoption**: Attract new artists by offering a compelling entry point that competitors use as their primary product
- **Drive Cross-Product Usage**: Convert bio page users into email marketing and analytics customers (50%+ multi-product adoption)
- **Reduce Customer Churn**: Create ecosystem lock-in through integrated value that standalone tools can't match
- **Capture Market Share**: Convert 50%+ of agency artists from paid Linktree subscriptions within 3 months

### User Goals

- **Simplify Online Presence**: Manage all important links from one place without technical complexity
- **Build Fan Relationships**: Convert anonymous social media followers into owned email contacts
- **Understand Fan Behavior**: See what content resonates to make better promotional decisions
- **Save Money**: Eliminate need for separate paid bio link services ($5-20/month savings)

### Non-Goals

- Complex customization options (custom CSS/HTML)
- E-commerce functionality within the bio page (v1)
- Advanced A/B testing or AI optimization (v1)
- QR code generation
- Team collaboration features for bio pages

---

## User Stories

### Primary Persona – "Independent Artist (1K-100K monthly listeners)"

- As an independent artist, I want to create a professional bio page in minutes, so that I can focus on making music instead of learning technology
- As an independent artist, I want one link that showcases all my content, so that I don't have to update multiple social media bios when I release new music
- As an independent artist, I want to capture fan emails automatically, so that I can build direct relationships without relying on social algorithms
- As an independent artist, I want to see which links fans click most, so that I can promote the right content at the right time
- As an independent artist, I want my bio page to work perfectly on mobile, so that fans have a great experience when clicking from Instagram/TikTok

### Secondary Persona – "Artist Manager/Agency"

- As an artist manager, I want to quickly set up bio pages for multiple artists, so that I can onboard new clients efficiently
- As an agency, I want integrated analytics across all tools, so that I can demonstrate ROI to my artists
- As an agency, I want automatic remarketing pixels, so that I can run effective ad campaigns without technical setup

---

## Functional Requirements

- **Page Creation & Management** (Priority: High)
  - One-click bio page creation with artist name as subdomain
  - Drag-and-drop link reordering
  - Smart link suggestions from barely ecosystem (latest release, upcoming shows)
  - Automatic social media icon detection and display
  - Preview mode before publishing

- **Email Capture Integration** (Priority: High)
  - Native email capture widget (not popup)
  - Automatic sync with barely.email lists
  - Customizable incentive text
  - GDPR-compliant consent handling
  - Welcome email automation trigger

- **Analytics & Tracking** (Priority: High)
  - Real-time click tracking per link
  - Traffic source attribution
  - Conversion tracking (email signups, downstream actions)
  - Integration with barely.fm analytics dashboard
  - Automatic remarketing pixel installation

- **Mobile Optimization** (Priority: High)
  - Sub-2-second load time on 3G
  - Perfect rendering in Instagram/TikTok in-app browsers
  - Touch-optimized link buttons
  - Responsive image handling
  - Offline-capable with service worker

- **Theming & Branding** (Priority: Medium)
  - 5-10 professional themes at launch
  - Color customization within themes
  - Artist photo/logo upload
  - Font selection (3-5 options)
  - barely branding on free tier

- **Link Types Support** (Priority: Medium)
  - Standard URL links
  - barely.link smart links (with analytics)
  - Embedded music players (Spotify, Apple Music)
  - Social media profile links
  - Email/SMS contact links

---

## User Experience

### Entry Point & Onboarding

- Artists discover barely.bio through:
  - Agency recommendation during onboarding
  - In-app prompts within barely.ai dashboard
  - SEO/content marketing
  - Social proof from other artists

- First-time setup flow:
  1. Click "Create Bio Page" from dashboard
  2. Auto-populate artist name and photo from Spotify connection
  3. Select theme (preview on mobile device mockup)
  4. Add first 3-5 links with smart suggestions
  5. Configure email capture (optional but encouraged)
  6. Preview and publish

### Core Experience

- **Step 1:** Artist shares their barely.bio URL in all social media bios
- **Step 2:** Fan clicks link from Instagram/TikTok/YouTube
- **Step 3:** Bio page loads instantly with artist branding
- **Step 4:** Fan browses available links (music, merch, tour dates)
- **Step 5:** Email capture widget offers exclusive content/updates
- **Step 6:** Fan signs up and receives welcome email
- **Step 7:** Artist sees real-time analytics in dashboard
- **Step 8:** Remarketing pixel fires for future ad targeting

### Advanced Features & Edge Cases

- Link scheduling (publish/unpublish at specific times)
- Geographic link variations (different content by country)
- Link click limits (for exclusive content)
- Custom domain support (Pro tier)
- API access for programmatic updates

### UI/UX Highlights

- Mobile-first design (90% of traffic is mobile)
- Accessibility: WCAG 2.1 AA compliant
- Progressive enhancement for slow connections
- Smooth animations that don't impact performance
- Clear visual hierarchy with artist content as hero

---

## Narrative

Sarah is an indie pop artist with 15K monthly Spotify listeners. She just released a new single and wants to promote it across her social channels. Previously, she paid $9/month for Linktree Pro just to track clicks and install a Facebook pixel.

She signs up for barely.ai (free tier) and creates her bio page in 3 minutes. The setup auto-imported her Spotify profile pic and suggested links to her new single, previous EP, and upcoming tour dates. She picks the "Sunset Vibes" theme that matches her aesthetic.

When she posts on Instagram stories about the new release, she includes her barely.bio link. Fans click through and see all her important links in one place. The email capture widget offers exclusive acoustic versions to subscribers—30% sign up on their first visit.

In her barely.ai dashboard, Sarah sees that 65% of visitors clicked the new single link, while 20% checked tour dates. She notices Denver shows high engagement, so she adds an extra show there. The integrated Facebook pixel automatically built a custom audience of her bio visitors, which her manager uses to run a targeted ad campaign that converts at 3x the rate of cold traffic.

After one month, Sarah has grown her email list by 500 subscribers and increased her streaming numbers by 15%. She's cancelled her Linktree subscription and upgraded to barely.ai Pro to remove branding and access advanced analytics. The $19/month pays for itself through better fan insights and higher conversion rates.

---

## Success Metrics

### User-Centric Metrics

- Bio page creation to publish time: <5 minutes average
- Mobile page load speed: <2 seconds on 3G
- Email capture conversion rate: 20%+ of visitors
- Weekly active bio pages: 70%+ of created pages
- Link click-through rate: 40%+ of visitors click at least one link

### Business Metrics

- New artist acquisition via bio product: 500+ monthly
- Free to paid conversion: 15%+ within 90 days
- Multi-product adoption: 50%+ use email or analytics
- Churn reduction: 20% lower for multi-product users
- Revenue from saved Linktree subscriptions: $50K+ ARR

### Technical Metrics

- Uptime: 99.9%+ availability
- Page load performance: p95 < 2 seconds
- API response time: p95 < 200ms
- Error rate: <0.1% of page loads
- Mobile rendering success: 99%+ across all browsers

### Tracking Plan

- Page created
- Link added/removed/reordered
- Theme selected/changed
- Email capture enabled/configured
- Page published
- Page viewed (with source)
- Link clicked (with position)
- Email captured
- Downstream conversion events

---

## Technical Considerations

### Technical Needs

- Next.js for bio pages (SSG/ISR for performance)
- Shared component library with other barely products
- PostgreSQL for link/page data
- Redis for caching and real-time analytics
- CDN for global performance
- Service worker for offline capability

### Integration Points

- barely.email API for list management
- barely.fm analytics pipeline
- Facebook/Google ad platform pixels
- Spotify/Apple Music APIs for embedded players
- Social platform APIs for profile data
- Webhook system for external integrations

### Data Storage & Privacy

- GDPR/CCPA compliant data handling
- Email consent tracked and honored
- Analytics data anonymized after 90 days
- Artist owns all fan data
- Export functionality for data portability
- Encryption at rest and in transit

### Scalability & Performance

- Static generation for bio pages (regenerate on change)
- Edge caching for global performance
- Lazy loading for below-fold content
- Image optimization pipeline
- Database read replicas for analytics
- Queue system for batch operations

### Potential Challenges

- **In-app browser compatibility**: Extensive testing needed across Instagram, TikTok, etc.
- **Analytics accuracy**: Some browsers block tracking; need fallback methods
- **Theme flexibility**: Balance customization with performance
- **Migration friction**: Artists invested in existing Linktree URLs
- **Spam prevention**: Email capture could attract bots; need protection

---

*Created: 2025-07-31*  
*Version: 1.0*  
*Status: Ready for Review*  
*Author: Product Team*