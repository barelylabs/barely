# Jobs to be Done: Deferred Shipping Rate Calculation

## Overview

This document captures the jobs that users are trying to accomplish when checking out on Barely cart. It focuses on the "why" behind behavior - specifically, why checkout speed matters and what users are actually trying to accomplish.

---

## User Segments

### Segment 1: Fans/Customers

**Context**: Music fans who have discovered an artist's merchandise through their bio link, social media, or website. They've found something they want to buy and have clicked through to checkout.

**Situation**: They're in purchase mode - credit card ready, decision made, just need to complete the transaction. They may be on mobile (most common), possibly on cellular data, and have limited patience.

### Segment 2: Artists/Creators (Indirect)

**Context**: Musicians and creators using Barely cart to sell merchandise. They don't experience the checkout directly but are impacted by conversion rates.

**Situation**: They've invested in merchandise, set up their store, and are driving traffic to their cart. Every abandoned checkout is lost revenue and wasted marketing effort.

---

## Primary Jobs (High Priority)

### Job 1: Complete My Purchase Quickly

**Job Statement**: When I've decided to buy merchandise from an artist I support, I want to complete checkout as fast as possible so I can get back to what I was doing.

**Functional Aspects**:
- See the checkout form immediately when I click "checkout"
- Enter my information without waiting for pages to load
- Submit payment and get confirmation quickly

**Emotional Aspects**:
- Feel confident the site is working (not broken)
- Maintain purchase momentum before second-guessing
- Not feel frustrated or impatient
- Trust my payment information is being handled properly

**Social Aspects**:
- Support the artist I care about
- Complete the transaction before getting distracted

**Current Workarounds**: Users wait up to 5 seconds staring at a loading screen, or abandon entirely.

**Success Metrics**:
- Time from click to interactive checkout < 2 seconds
- Reduced bounce rate on checkout page
- Higher checkout completion rate

---

### Job 2: Know What I'm Paying Before I Commit

**Job Statement**: When I'm ready to checkout, I want to see the total cost including shipping so I can confirm my purchase decision.

**Functional Aspects**:
- See product price clearly
- See shipping cost before entering payment
- Understand the total I'll be charged

**Emotional Aspects**:
- Feel informed, not surprised
- Trust the pricing is fair
- Feel confident in my purchase decision

**Social Aspects**:
- Justify the purchase to myself/others

**Current Workarounds**: Shipping is calculated but blocks the entire page from loading - users don't even see the form until shipping is calculated.

**Success Metrics**:
- Shipping cost visible before payment submission
- Clear loading indicator while shipping calculates (not blocking the page)

---

### Job 3: Trust the Checkout Process

**Job Statement**: When I'm entering my payment information, I want to feel confident the process is secure and reliable so I don't hesitate to complete my purchase.

**Functional Aspects**:
- See a professional, responsive checkout form
- Have clear feedback on form state and errors
- See secure payment indicators (Stripe badge, etc.)

**Emotional Aspects**:
- Feel the site is legitimate and professional
- Trust my payment will go through
- Not worry about double-charges or failed transactions

**Social Aspects**:
- Feel good about supporting the artist through a quality experience

**Current Workarounds**: Slow loading undermines trust - users may question if the site is broken or legitimate.

**Success Metrics**:
- Reduced "is this site safe?" support inquiries
- Higher payment completion rate after form interaction

---

## Secondary Jobs (Lower Priority)

### Job 4: Recover If Something Goes Wrong

**Job Statement**: If shipping can't be calculated or something fails, I want clear feedback so I know what to do next.

**Functional Aspects**:
- See clear error messages if shipping fails
- Have option to retry or contact support
- Not lose my cart contents

**Emotional Aspects**:
- Not feel stuck or confused
- Trust there's a path forward

**Current Workarounds**: N/A - current flow blocks everything, so failures are catastrophic.

---

### Job 5: Get Accurate Shipping Information

**Job Statement**: When I'm buying merchandise, I want accurate shipping costs and delivery estimates so I can plan accordingly.

**Functional Aspects**:
- See shipping options and prices
- Understand estimated delivery time
- Know if there are any shipping restrictions

**Emotional Aspects**:
- Feel informed about what to expect
- Trust the shipping estimate is accurate

**Current Workarounds**: Shipping is already calculated (just at the wrong time in the flow).

---

## Internal Jobs (Barely/Artist)

### Job 6: Maximize Checkout Conversions

**Job Statement**: When fans reach checkout, we want them to complete their purchase so artists earn revenue and fans get their merchandise.

**Functional Aspects**:
- Fast, frictionless checkout experience
- No unnecessary loading or delays
- Clear path from cart to confirmation

**Emotional Aspects**:
- Feel confident the checkout is optimized
- Trust conversion rates are as high as possible

**Current Workarounds**: Accepting lower conversion rates due to slow checkout.

**Success Metrics**:
- Checkout completion rate improvement
- Reduced cart abandonment
- Higher revenue per visitor

---

## Job Prioritization Matrix

| Job | Frequency | Importance | Satisfaction Gap | Priority |
|-----|-----------|------------|------------------|----------|
| Complete purchase quickly | Every checkout | Critical | High (5s wait) | **P0** |
| Know what I'm paying | Every checkout | High | Low (shipping shows, just slowly) | **P1** |
| Trust the checkout process | Every checkout | High | Medium (slow = unprofessional) | **P1** |
| Recover from failures | Rare | Medium | Unknown | **P2** |
| Get accurate shipping info | Every checkout | Medium | Low (accuracy is fine) | **P2** |
| Maximize conversions (internal) | Ongoing | Critical | High (slow = abandonment) | **P0** |

---

## Key Insights

1. **The core job isn't "calculate shipping faster"** - it's "let me complete my purchase without friction." Shipping calculation is a means to an end, not the end itself.

2. **Timing matters more than the calculation itself** - The shipping rates are accurate and the UI already handles loading states. The problem is purely WHEN the calculation happens, not HOW it's done.

3. **First paint is the critical moment** - The psychological switch from "waiting" to "doing" happens when the form appears. Every second before first paint feels longer than seconds spent filling out the form.

4. **Slow checkout signals unprofessionalism** - Fans may subconsciously distrust a slow checkout, even if the calculation is accurate. Speed is a trust signal.

5. **Mobile users are least patient and most common** - Mobile checkout is the primary use case, and mobile users on cellular data are the most sensitive to load times.

6. **Shipping doesn't need to block anything** - Users can't submit payment until shipping is calculated anyway (button is disabled). So there's zero functional reason to block first paint for it.

---

## Success Definition

This feature succeeds when:

1. **Fans** see the checkout form in under 2 seconds, enter their information while shipping calculates in the background, and complete purchases with higher conversion rates

2. **Artists** earn more revenue from the same traffic because fewer fans abandon during checkout

3. **The experience** feels instant and professional, building trust in the Barely platform

---

## What This Isn't About

- **Not about shipping accuracy** - The calculation logic doesn't change
- **Not about UI changes** - Loading states already exist
- **Not about caching complexity** - Just changing timing, not infrastructure
- **Not about the full cart optimization project** - Surgical fix for one specific bottleneck
