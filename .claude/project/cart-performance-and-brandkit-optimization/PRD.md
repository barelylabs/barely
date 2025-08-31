# Cart Performance & BrandKit Optimization – PRD

### TL;DR

A critical performance optimization for barely.cart that reduces load times from 9.3s to under 2.5s by implementing the proven BrandKit caching pattern from barely.bio. This eliminates render-blocking workspace queries, adds progressive loading, and enables purchases on slow connections - directly addressing a ~50% cart abandonment rate caused by catastrophic performance.

---

## Goals

### Business Goals

- **Recover Lost Revenue**: Reduce cart abandonment by 30%+ by fixing performance issues
- **Increase Conversion Rate**: Achieve 20%+ higher checkout completion through faster loads
- **Platform Trust**: Build confidence in Barely as a professional e-commerce platform
- **Transaction Volume**: Enable more successful purchases, increasing platform fees

### User Goals

- **Complete Purchases Quickly**: Checkout in under 2.5 seconds to maintain purchase momentum
- **Trust the Process**: Experience responsive, professional checkout that feels secure
- **Buy Anywhere**: Complete purchases on mobile/slow connections without frustration
- **See Artist Brand**: Instantly recognize whose store they're in through immediate branding, implementing the BrandKit caching pattern from barely.bio, inclusive of brand colors, fonts, and button styles.

### Non-Goals

- Advanced theming or visual customization beyond what's already available in the BrandKit
- Cart template variations or layout changes
- New checkout features or payment methods
- Marketing optimizations or A/B testing infrastructure
- Changes to cart functionality beyond performance

---

## User Stories

### Primary Persona – "Impulse Fan Buyer"

- As a fan ready to purchase, I want the cart to load immediately, so that I can complete my purchase before second-guessing my decision.
- As a mobile user, I want to see the cart loading progressively, so that I know the site is working even on slow connections.
- As a first-time buyer, I want responsive interactions, so that I trust this store with my payment information.
- As a fan at a concert, I want to purchase merchandise quickly, so that I don't miss limited items while dealing with venue WiFi.
- As a returning customer, I want my cart to load instantly from cache, so that I can complete an interrupted purchase.

### Secondary Persona – "Artist/Workspace Owner"

- As an artist, I want fans to complete purchases successfully, so that I maximize revenue from my audience.
- As a workspace owner, I want my brand to appear immediately, so that fans feel connected to me during checkout.
- As an artist, I want professional checkout performance, so that my brand isn't damaged by poor user experience.

---

## Functional Requirements

- **Performance Optimization** (Priority: High)

  - Achieve <2.5s Largest Contentful Paint (from 9.3s)
  - Reduce Total Blocking Time to <200ms (from 3,700ms)
  - Reach Lighthouse score >70 (from 37)
  - Enable progressive loading with visible skeleton states
  - Support checkout completion on 3G connections

- **BrandKit Caching** (Priority: High)

  - Implement workspace BrandKit provider from UI package - refer to apps/bio for reference
  - Query cached BrandKit data on cart initialization. This can be cached and used across the cart layout.tsx and page.tsx files. It should be fed down to the BrandKitProvider to be used anywhere in the UI.
  - Eliminate render-blocking workspace queries
  - Show brand identity during loading states
  - Maintain cache consistency across sessions

- **Cart Data Caching** (Priority: High)

  - Cache product information where safe
  - Implement smart invalidation for inventory/pricing
  - Store cart contents for interrupted sessions
  - Background refresh for real-time data
  - Reduce cold start times to <5s

- **Progressive Enhancement** (Priority: Medium)

  - Add React Suspense boundaries for incremental loading
  - Display skeleton states while data loads
  - Prioritize above-the-fold content
  - Lazy load non-critical elements
  - Provide immediate visual feedback

- **Cart Preview in App** (Priority: Medium)

  - Same as the current bio preview in the settings/brand page, but for the cart. Follow the same pattern as the bio preview, but for the cart.

- **Edge Optimization** (Priority: Medium)
  - Serve static assets from CDN edge locations
  - Implement proper Cache-Control headers
  - Optimize bundle sizes and code splitting
  - Minimize network requests
  - Compress all transferrable assets

---

## User Experience

### Entry Point & Onboarding

- Users click checkout links from social media, emails, or artist pages
- Cart should show immediate loading feedback (skeleton state) within 100ms
- Brand colors appear instantly from cache while content loads
- No blank white screens or frozen states

### Core Experience

- **Step 1:** User clicks checkout link → Immediate skeleton with brand colors
- **Step 2:** Progressive content appears as it loads (products, prices, images)
- **Step 3:** Interactive elements become available as soon as ready
- **Step 4:** User completes purchase without delays or freezes
- **Step 5:** Confirmation loads quickly with proper success feedback

### Advanced Features & Edge Cases

- **Slow connections**: Progressive loading ensures usability on 3G
- **Return visits**: Near-instant loads from cache
- **Cart recovery**: Preserved cart contents after interruption
- **Multiple tabs**: Consistent performance across concurrent sessions
- **Cold starts**: Reduced from "many seconds" to <5s

### UI/UX Highlights

- Skeleton states match final layout to prevent layout shift
- Brand colors provide immediate artist identity
- Loading indicators show genuine progress
- Responsive interactions throughout (no frozen UI)
- Mobile-first optimization for 90% of traffic

---

## Narrative

Sarah is at a Baresky concert, surrounded by thousands of fans. During the show, the artist announces exclusive tour merchandise available only tonight through their barely.cart store. Sarah pulls out her phone, fighting with spotty venue WiFi.

She clicks the link and - instead of staring at a white screen wondering if it's working - sees the Baresky brand colors immediately with a skeleton layout showing the page is loading. Within 2 seconds, the products appear. She quickly selects a limited edition vinyl and hoodie.

The checkout is responsive, every tap provides instant feedback. Even as the venue WiFi struggles, the progressive loading ensures she can complete her purchase. Within 30 seconds of the announcement, she has her confirmation.

Her friend next to her, still waiting for the page to load on a competitor's platform, misses out as items sell out. Sarah shares her success in the group chat, and three more friends successfully purchase through the now-cached, lightning-fast barely.cart.

---

## Success Metrics

### User-Centric Metrics

- **Load Performance**: LCP <2.5s (currently 9.3s)
- **Interactivity**: TBT <200ms (currently 3,700ms)
- **Perceived Speed**: Speed Index <3s (currently 6.2s)
- **Cart Completion Rate**: Increase by 20%+
- **Mobile Success Rate**: Increase by 40%+

### Business Metrics

- **Cart Abandonment**: Reduce by 30%+
- **Revenue Recovery**: Capture ~50% of currently lost sales
- **Transaction Volume**: 20%+ increase in successful checkouts
- **Support Tickets**: 50%+ reduction in "broken checkout" reports
- **Artist Satisfaction**: Improved NPS from workspace owners

### Technical Metrics

- **Lighthouse Score**: >70 (currently 37)
- **Cold Start Time**: <5s (currently "many seconds")
- **Cache Hit Rate**: >80% for return visits
- **Edge Cache Rate**: >90% for static assets
- **Error Rate**: <0.1% for performance-related failures

### Tracking Plan

- Page load timing (LCP, FCP, TBT, CLS)
- Cart abandonment funnel with performance correlation
- Cache hit/miss rates by resource type
- Cold vs warm start performance distribution
- Mobile vs desktop performance metrics
- Connection speed impact on conversion

---

## Technical Considerations

### Technical Needs

- Next.js RSC architecture (existing)
- React Suspense and streaming SSR
- Redis or similar for session caching
- CDN with edge computing capabilities
- Performance monitoring (Web Vitals)

### Integration Points

- BrandKit provider and caching system from UI package - refer to apps/bio for reference
- Existing workspace data structure
- Current cart API and checkout flow
- Payment processing systems (maintain compatibility)
- Analytics and tracking infrastructure

### Data Storage & Privacy

- Cache sensitive data appropriately (not payment info)
- Session-based cart storage with proper expiration
- Respect user privacy in performance tracking
- Secure handling of workspace brand data
- GDPR-compliant caching strategies

### Scalability & Performance

- Horizontal scaling through edge caching
- Reduced database load via aggressive caching
- Progressive enhancement for all connection speeds
- Graceful degradation when caches miss
- Monitoring and alerting for performance regression

### Potential Challenges

- **Cache Invalidation**: Balance performance with real-time accuracy for inventory
- **Payment Security**: Ensure caching doesn't compromise payment data
- **Cross-Session Consistency**: Manage cart state across devices/sessions
- **Rollback Strategy**: Ability to disable caching if issues arise
- **Testing Complexity**: Validating performance across all connection types

---

## Implementation Phases

### Phase 1: Critical Path (Week 1)

- Implement BrandKit provider from UI package in apps/cart and apps/app (for the cart preview) - see apps/app and apps/bio for reference
- Eliminate render-blocking workspace query
- Add basic Suspense boundaries

### Phase 2: Progressive Loading (Week 2)

- Complete skeleton states
- Implement progressive enhancement
- Add edge caching for static assets

### Phase 3: Cart Caching (Week 3)

- Session-based cart caching
- Smart invalidation strategies
- Cold start optimization

### Phase 4: Polish & Monitoring (Week 4)

- Performance monitoring setup
- A/B testing infrastructure
- Final optimizations based on metrics
