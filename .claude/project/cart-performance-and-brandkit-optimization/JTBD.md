# Jobs To Be Done (JTBD) - Cart Performance & BrandKit Optimization

## Overview

This document captures the core jobs that fans and artists are trying to accomplish when using barely.cart, focusing on the checkout experience and how performance impacts their ability to complete purchases successfully.

---

## Primary Jobs (High Priority)

### JTBD 1: Complete Purchase Without Doubt

**Job Statement**  
As a fan ready to buy merchandise or content, I want to complete my checkout quickly and smoothly, so that I can secure my purchase before second-guessing my decision or getting distracted.

**Context**
- When I've decided to buy and clicked the checkout link
- Often happens impulsively after seeing content I love
- Frequently on mobile devices with varying connection speeds

**Motivation (Why this matters)**
- Purchase decisions are often emotional and time-sensitive
- Every second of delay increases buyer's remorse or distraction
- Slow loads feel like the site is broken or untrustworthy

**Current Alternatives**
- Waiting through the 9.3+ second load time (often abandoning)
- Refreshing the page multiple times thinking it's stuck
- Coming back later (but often forgetting or losing interest)

**Desired Outcome / Success Criteria**
- Cart loads in under 2.5 seconds
- Immediate visual feedback that the page is loading
- Smooth transition from decision to purchase confirmation

**Priority Level**
- High

---

### JTBD 2: Trust the Purchase Process

**Job Statement**  
As a fan making an online purchase, I want to see immediate response and professional presentation, so that I feel confident my payment information is safe and my order will be fulfilled.

**Context**
- First-time purchase from an artist's store
- Entering payment information
- Often comparing to experiences with major e-commerce sites

**Motivation**
- Slow, unresponsive sites feel unprofessional or potentially fraudulent
- 3.7 seconds of frozen UI creates anxiety about site security
- Need confidence that the artist's store is legitimate

**Current Alternatives**
- Abandoning cart and looking for artist products on trusted platforms (Shopify, Bandcamp)
- Messaging the artist directly to verify the store is real
- Taking screenshots before purchase in case something goes wrong

**Desired Outcome**
- Professional, responsive checkout matching mainstream e-commerce
- Clear visual indicators of security and legitimacy
- No frozen or unresponsive states during interaction

**Priority Level**
- High

---

### JTBD 3: Purchase on Limited Connection

**Job Statement**  
As a fan often on mobile data or weak WiFi, I want to complete purchases even with poor connectivity, so that I don't miss limited releases or tour merchandise.

**Context**
- At concerts/venues with poor cellular coverage
- On public transit or traveling
- International fans with slower internet infrastructure

**Motivation**
- Limited edition items sell out quickly
- Tour merchandise only available at specific times
- Don't want to wait until better connection is available

**Current Alternatives**
- Asking friends with better connections to purchase
- Missing out on limited releases
- Using venue WiFi (often unreliable)

**Desired Outcome**
- Progressive loading that shows content as available
- Cached assets that reduce data requirements
- Ability to complete purchase even on 3G/slow connections

**Priority Level**
- High

---

## Secondary Jobs (Medium Priority)

### JTBD 4: Recognize Artist Brand

**Job Statement**  
As a fan, I want to see the artist's branding immediately when I load the cart, so that I feel connected to the artist and confident I'm in the right place.

**Context**
- Clicking from social media or email links
- Multiple tabs open while browsing different artists
- Returning to complete an abandoned cart

**Motivation**
- Want to feel connected to the artist during purchase
- Need confirmation I'm buying from the right artist
- Brand consistency reinforces authenticity

**Current Alternatives**
- Waiting for full page load to see any branding
- Checking the URL to confirm correct artist
- Going back to the link source to verify

**Desired Outcome**
- Instant brand colors/identity while page loads
- Clear artist identification even during loading states
- Consistent branding with other artist touchpoints

**Priority Level**
- Medium

---

### JTBD 5: Return to Complete Purchase

**Job Statement**  
As a fan who got interrupted or needed to think about a purchase, I want to quickly return to my cart without re-loading everything, so that I can complete my purchase when ready.

**Context**
- Returning after checking bank balance
- Coming back after discussing with friends/partner
- Resuming after connection loss or interruption

**Motivation**
- Don't want to lose cart contents
- Expect faster load on return visit
- May have limited time window to complete

**Current Alternatives**
- Starting over from scratch
- Keeping tab open and hoping it doesn't timeout
- Taking photos of cart contents to remember

**Desired Outcome**
- Near-instant load when returning to cart
- Cart contents preserved and quickly accessible
- No need to re-enter any information

**Priority Level**
- Medium

---

### JTBD 6: Share Purchase Experience

**Job Statement**  
As a fan excited about my purchase, I want the checkout to load fast enough that I can share it live with friends, so that we can buy together or I can show my support for the artist.

**Context**
- Group chats discussing new releases
- Social media stories showing support
- Coordinating group purchases for shipping savings

**Motivation**
- Want to share excitement in the moment
- Group purchases need coordination
- Social proof helps artist sales

**Current Alternatives**
- Sharing screenshots instead of live experience
- Warning friends about slow load times
- Purchasing separately and losing group shipping benefits

**Desired Outcome**
- Fast loads that don't interrupt social sharing flow
- Smooth experience when multiple people access simultaneously
- Professional appearance that reflects well on artist

**Priority Level**
- Medium

---

## Low Priority Jobs

### JTBD 7: Compare Purchase Options

**Job Statement**  
As a fan considering multiple items or variants, I want to quickly move between product options, so that I can make the best purchase decision.

**Context**
- Choosing between merch sizes or colors
- Comparing bundle options
- Budget-conscious decision making

**Motivation**
- Need to see options without long waits
- Want to adjust cart without losing progress
- Time-sensitive for limited releases

**Current Alternatives**
- Opening multiple tabs (each taking 9+ seconds)
- Making quick decisions without proper comparison
- Purchasing wrong variant due to time pressure

**Desired Outcome**
- Quick navigation between options
- Cart updates without full page reloads
- Ability to compare without performance penalty

**Priority Level**
- Low

---

## Success Metrics Aligned to Jobs

### Quantitative
- **Load Time**: <2.5s LCP (from 9.3s) - directly impacts Jobs 1, 2, 3
- **Interactivity**: <200ms TBT (from 3,700ms) - critical for Job 2
- **Cart Abandonment**: Reduce by 30%+ - validates Job 1 completion
- **Mobile Conversion**: Increase by 40%+ - proves Job 3 success

### Qualitative
- User feedback about trust and professionalism (Job 2)
- Social sharing of purchase process (Job 6)
- Artist feedback on fan satisfaction (Jobs 1, 4)
- Support ticket reduction for "broken" checkout (Jobs 1, 2)

---

## Notes on Implementation Priority

While all jobs matter, the performance optimization directly addresses the three highest priority jobs:
1. **Speed enables purchase completion** (Job 1)
2. **Responsiveness builds trust** (Job 2)  
3. **Optimization enables mobile/slow connection purchases** (Job 3)

The BrandKit caching additionally serves Job 4 (brand recognition) as a valuable secondary benefit of the optimization work.