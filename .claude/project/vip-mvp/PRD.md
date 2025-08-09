# barely.vip Product Requirements Document

### TL;DR

barely.vip is a conversion-optimized landing page platform that enables artists to share exclusive music in exchange for email addresses, with a roadmap toward paid membership tiers. Unlike general link-in-bio tools, barely.vip creates focused, high-converting pages specifically designed for paid advertising campaigns, ultimately driving merchandise sales through automated email sequences. This PRD outlines the MVP implementation targeting 30%+ email capture rates and 2x merchandise revenue for participating artists.

---

## Goals

### Business Goals

- **Increase Agency Client Value**: Double merchandise revenue for existing $5k+ MRR clients within 30 days
- **Improve Client Retention**: Create ecosystem lock-in through integrated email-to-sales funnels
- **Validate Paid Tier Potential**: Prove email capture model before expanding to subscription revenue
- **Expand Platform Usage**: Drive adoption of barely.email and barely.cart through VIP integration

### User Goals

- **Maximize Ad ROI**: Convert 30%+ of paid traffic into owned email contacts (vs. 10% industry standard)
- **Automate Sales Funnels**: Turn email captures into merchandise revenue without manual work
- **Prove Campaign Value**: Show clear attribution from ad spend to merchandise sales
- **Reward True Fans**: Give exclusive content to fans willing to share contact information

### Non-Goals

- Complex multi-track releases or albums (MVP is single track only)
- Artist discovery or browsing features
- Social sharing or viral mechanics
- Community features or fan interaction
- Paid subscription tiers (future phase)
- Mobile app development
- A/B testing or optimization features

---

## User Stories

### Primary Persona – "Agency Account Manager"

- As an agency account manager, I want to create VIP pages in under 5 minutes, so that I can launch campaigns quickly for multiple artists
- As an agency account manager, I want to see real-time conversion metrics, so that I can optimize ad creative and targeting
- As an agency account manager, I want automatic email list segmentation, so that each campaign's subscribers are properly tagged
- As an agency account manager, I want clear revenue attribution, so that I can prove ROI to my artists in monthly reports
- As an agency account manager, I want to manage multiple artist VIP pages from one dashboard, so that I can efficiently scale campaigns

### Secondary Persona – "Independent Artist"

- As an independent artist, I want to upload exclusive tracks easily, so that I can focus on creating music instead of technical setup
- As an independent artist, I want to see which content drives the most email signups, so that I can create more of what fans want
- As an independent artist, I want automated follow-up emails, so that new fans stay engaged without manual effort

---

## Functional Requirements

### **VIP Page Creation** (Priority: High)
- Single track upload with drag-and-drop interface
- Automatic audio format detection and validation
- Album artwork upload with smart cropping
- Title and description fields (character limits enforced)
- Unique URL generation: barely.vip/[artist-handle]/[release-key]
- Preview mode before publishing
- Mobile-responsive page templates

### **Email Capture & Verification** (Priority: High)
- Inline email form (not popup) for better mobile experience
- Real-time email validation
- Instant unlock upon valid email submission
- Double opt-in option for GDPR compliance
- Custom confirmation messaging
- Fallback to email delivery if browser issues

### **Content Delivery** (Priority: High)
- Streaming playback using existing barely.press player
- One-click download button for full quality file
- Secure, expiring download URLs (24-hour validity)
- Mobile fallback: email delivery of download link
- Basic playback controls (play/pause, scrubber, volume)

### **Analytics Dashboard** (Priority: High)
- Real-time view count
- Email capture count and conversion rate
- Download count
- Geographic distribution of visitors
- Traffic source tracking (UTM parameters)
- Funnel visualization: Visit → Email → Download
- Export data as CSV

### **Email Integration** (Priority: High)
- Automatic addition to barely.email lists
- Custom tags: "vip-[artist]-[release-key]"
- Instant confirmation email with download link
- Trigger for automated nurture sequence
- Unsubscribe handling and preference management

### **Merchandise Integration** (Priority: Medium)
- Post-download redirect to barely.cart store
- Email sequence integration for merch promotions
- Revenue tracking from VIP email captures
- Attribution reporting by VIP page

### **Artist Dashboard** (Priority: Medium)
- List view of all VIP releases
- Quick stats for each release
- Bulk actions (pause, delete, export data)
- Email list growth visualization
- Revenue impact reporting

### **Workspace Management** (Priority: Medium)
- Multi-artist support for agencies
- Role-based permissions (admin, editor, viewer)
- Bulk VIP page creation
- Cross-artist analytics

---

## User Experience

### Entry Point & Onboarding

Artists/agencies discover barely.vip through:
- Feature announcement to existing barely.ai users
- Inclusion in agency onboarding flow
- Direct sales outreach to high-value clients
- Success story case studies

First-time setup:
1. Navigate to VIP section in barely.ai dashboard
2. Click "Create VIP Release"
3. Upload track (system validates format)
4. Add artwork and release details
5. Preview on mobile mockup
6. Publish and receive shareable link

### Core Experience

- **Step 1:** Agency creates targeted ad campaign promoting exclusive content
- **Step 2:** Fan clicks ad and lands on barely.vip/artist/exclusive-track
- **Step 3:** Page loads instantly showing locked content with clear value proposition
- **Step 4:** Fan enters email address inline (no popup)
- **Step 5:** Content unlocks immediately, playback begins
- **Step 6:** Fan can stream or download the exclusive track
- **Step 7:** Confirmation email sent with permanent download link
- **Step 8:** Fan receives nurture sequence leading to merchandise offer
- **Step 9:** Agency views real-time analytics showing conversion funnel
- **Step 10:** Monthly report demonstrates 2x merchandise revenue increase

### Advanced Features & Edge Cases

- **Failed downloads**: Automatic email delivery as backup
- **Invalid emails**: Clear error messaging with retry
- **Mobile audio issues**: Fallback to email-only delivery
- **High traffic**: CDN scaling and queue management
- **International fans**: Automatic language detection

### UI/UX Highlights

- Mobile-first design (90% of traffic from social ads)
- Sub-3-second load time on 3G networks
- Single-column layout for optimal mobile conversion
- Large, thumb-friendly buttons
- Minimal text, maximum visual impact
- Accessibility: WCAG 2.1 AA compliant
- Progressive enhancement for slow connections

---

## Narrative

Marcus manages 12 indie artists at a boutique agency. His client, Luna, just finished recording an acoustic version of her viral TikTok song. She wants to capitalize on the momentum but needs to build her email list for an upcoming merch drop.

Marcus creates a VIP page for the exclusive acoustic version in 3 minutes. He uploads the track, adds Luna's press photo, and writes "Get the exclusive acoustic version before anyone else!" The page is live at barely.vip/luna/acoustic-shadows.

He launches a $500 Instagram campaign targeting Luna's existing followers with the headline "Hear the version you've been asking for." The campaign drives 2,000 clicks in the first week.

Thanks to the focused, single-action page, 35% of visitors (700 people) trade their email for the exclusive track. The automated email sequence Marcus set up introduces Luna's story and on day 7, offers a limited edition vinyl pressing.

52 fans purchase the $25 vinyl (7.4% conversion), generating $1,300 in revenue. After barely's 10% commission, Luna nets $1,170 from a $500 ad spend – a 2.3x return. Marcus shares the attribution report showing the clear path from ad to email to sale.

Luna is thrilled. She commits to monthly exclusive releases and increases her marketing budget. Marcus replicates this system across his roster, doubling the agency's value to artists while building sustainable, owned audiences for each client.

---

## Success Metrics

### User-Centric Metrics

- **Email Capture Rate**: 30%+ of page visitors (baseline: 10%)
- **Content Unlock Rate**: 95%+ of email submitters
- **Download Completion**: 80%+ of unlocked content
- **Email Deliverability**: 98%+ confirmation emails delivered
- **Mobile Success Rate**: 90%+ successful experiences on mobile

### Business Metrics

- **Revenue Impact**: 2x merchandise sales for active campaigns
- **Client Activation**: 80%+ of agency clients create VIP page within 30 days
- **Email List Growth**: 1,000+ emails per artist per month
- **Platform Revenue**: $300+ additional monthly revenue per agency
- **Cross-Product Adoption**: 100% VIP users activate barely.email

### Technical Metrics

- **Page Load Speed**: p95 < 3 seconds on 3G
- **Uptime**: 99.9%+ availability
- **Conversion Time**: < 10 seconds from email entry to content access
- **Download Success**: 99%+ successful file deliveries
- **API Response Time**: p95 < 200ms

### Tracking Plan

Key events tracked via Tinybird:
- vip_page_created
- vip_page_viewed (with source, device, location)
- email_form_displayed
- email_submitted
- email_validated
- content_unlocked
- track_played
- track_downloaded
- email_confirmed
- cart_redirect_clicked
- purchase_attributed

---

## Technical Considerations

### Technical Needs

- Next.js app within existing monorepo structure
- Shared component library with barely.bio
- PostgreSQL for VIP release metadata
- AWS S3 for audio file storage
- Tinybird for real-time analytics
- SendGrid for transactional emails
- Redis for download URL tokens

### Integration Points

- **barely.email API**: List management and tagging
- **barely.cart**: Post-download redirects and attribution
- **barely.link**: Campaign tracking and analytics
- **Authentication**: Existing workspace/user system
- **CDN**: Cloudflare for global content delivery
- **Analytics**: Tinybird event pipeline

### Data Storage & Privacy

- Email addresses stored encrypted at rest
- GDPR-compliant consent tracking
- Right to deletion implemented
- No tracking without consent
- Download URLs expire after 24 hours
- Artists own all fan data
- SOC 2 compliance maintained

### Scalability & Performance

- Static page generation where possible
- CDN caching for all assets
- Horizontal scaling for high-traffic releases
- Queue system for email processing
- Rate limiting on download endpoints
- Database read replicas for analytics

### Potential Challenges

- **Mobile Browser Audio**: Instagram/TikTok in-app browsers have limited audio support
  - *Mitigation*: Email delivery fallback, clear download CTA
  
- **High-Traffic Spikes**: Viral campaigns could overwhelm infrastructure
  - *Mitigation*: Auto-scaling, CDN, queue systems
  
- **Email Deliverability**: Confirmation emails could hit spam filters
  - *Mitigation*: Proper DKIM/SPF setup, warming IP reputation
  
- **Content Piracy**: Exclusive tracks could be shared publicly
  - *Mitigation*: Expiring URLs, optional watermarking (future)

---

*Created: 2025-07-31*  
*Version: 1.0*  
*Status: Ready for Implementation*  
*Product Owner: Adam Barito*