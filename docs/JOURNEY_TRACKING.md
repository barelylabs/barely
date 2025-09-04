# Journey Tracking System Documentation

## Overview

The Journey Tracking System enables comprehensive cross-domain analytics for user flows across the barely.io ecosystem. This system solves the fundamental challenge of tracking user journeys across different domains (e.g., barely.bio → barelycart.com) where cookies cannot be shared.

## Core Problem

Traditional web analytics rely on cookies for session tracking, but browser security prevents cookie sharing across different domains. This creates a "blind spot" when users navigate from one barely.io service to another, making it impossible to track conversion funnels or attribute sales to their original sources.

## Solution Architecture

### 1. Journey ID as Universal Identifier

Every user journey is assigned a unique Journey ID with the format:
```
{origin}_{timestamp}_{uniqueId}
```

Example: `bio_1736954400000_clr3m9k2p0000`

- **origin**: Where the journey started (bio, email, cart, link, etc.)
- **timestamp**: Unix timestamp of journey start (for duration analysis)
- **uniqueId**: CUID to prevent collisions

This ID persists across all domain boundaries via URL parameters.

### 2. Query Parameter Protocol

Since cookies can't cross domains, we pass tracking data through URL parameters:

| Parameter | Name | Purpose | Example |
|-----------|------|---------|---------|
| `jid` | Journey ID | Master session identifier | `bio_1736954400000_abc123` |
| `jsrc` | Journey Source | Last touchpoint | `bio:baresky:home` |
| `jstep` | Journey Step | Navigation counter | `3` |
| `rid` | Referrer ID | Current asset ID | `bio_xyz789` |
| `orid` | Original Referrer ID | First asset in chain | `email_template_123` |
| `fid` | Fan ID | User identifier | `fan_abc123` |

### 3. Cookie Storage Per Domain

Each domain stores journey information in its own cookies:
- `{handle}.{key}.journeyId` - The journey identifier
- `{handle}.{key}.journeyOrigin` - Where the journey began
- `{handle}.{key}.journeyPath` - JSON array of touchpoints
- `{handle}.{key}.journeyStep` - Current step number

## Implementation Details

### Middleware Layer (`setVisitorCookies`)

The middleware processes incoming requests and:
1. Extracts journey parameters from URL
2. Creates new journey if none exists
3. Updates journey path with current touchpoint
4. Stores journey data in domain-specific cookies

```typescript
// Journey flows from URL → Cookies → Event Recording
if (journeyInfo.journeyId) {
  // Continuing existing journey
  res.cookies.set(`${handle}.${key}.journeyId`, journeyInfo.journeyId);
} else {
  // Starting new journey
  const newJourneyId = `${app}_${Date.now()}_${newId('journey')}`;
  res.cookies.set(`${handle}.${key}.journeyId`, newJourneyId);
}
```

### URL Enrichment (`getTrackingEnrichedHref`)

Every cross-domain link is enriched with tracking parameters:

```typescript
// Automatic parameter addition for cross-domain links
const enrichedUrl = getTrackingEnrichedHref({
  href: 'https://barelycart.com/checkout',
  tracking: currentTrackingState,
  currentApp: 'bio',
  currentHandle: 'baresky',
  currentKey: 'home',
  currentAssetId: 'bio_123'
});
```

### Event Recording

Events are recorded with full journey context:

```typescript
// Bio event includes journey metadata
{
  type: 'bio/buttonClick',
  journeyId: 'email_1736954400000_abc',
  journeyOrigin: 'email',
  journeyStep: 3,
  journeyPath: ['email', 'bio:baresky:home', 'cart:baresky:checkout'],
  sessionId: journeyId, // Journey ID becomes session ID
}
```

## Journey Flow Examples

### Example 1: Email → Bio → Cart

1. **Email Click** (Journey Start)
   - Creates: `journeyId: email_1736954400000_abc`
   - URL: `https://barely.bio/baresky?jid=email_1736954400000_abc&jsrc=email:broadcast:123&jstep=1`

2. **Bio Page View** (Step 2)
   - Receives journey from URL
   - Stores in cookies: `baresky.home.journeyId`
   - Records event with `journeyStep: 2`

3. **Bio Link Click** (Step 3)
   - Enriches cart URL with journey
   - URL: `https://barelycart.com/baresky/checkout?jid=email_1736954400000_abc&jsrc=bio:baresky:home&jstep=3`

4. **Cart Purchase** (Step 4)
   - Completes journey with full attribution
   - Can trace back to original email campaign

### Example 2: Direct Bio Visit → Cart

1. **Bio Direct Visit** (Journey Start)
   - Creates: `journeyId: bio_1736954500000_def`
   - No incoming journey parameters
   - Starts fresh journey with origin='bio'

2. **Cart Navigation**
   - Continues bio-originated journey
   - Lower conversion probability tracked

## Analytics Queries

### Funnel Analysis
```sql
SELECT 
  journeyId,
  journeyOrigin,
  countIf(type = 'bio/view') as bio_views,
  countIf(type = 'bio/buttonClick') as bio_clicks,
  countIf(type = 'cart/purchase') as purchases
FROM events
WHERE journeyOrigin = 'bio'
GROUP BY journeyId, journeyOrigin
```

### Attribution Analysis
```sql
SELECT
  originalReferrerId,
  count() as journeys,
  countIf(purchases > 0) as conversions,
  round(conversions * 100.0 / journeys, 2) as conversion_rate
FROM journey_events
GROUP BY originalReferrerId
```

## Benefits

1. **Complete Visibility**: Track users across all touchpoints regardless of domain boundaries
2. **Accurate Attribution**: Know exactly which campaigns, emails, or content drive conversions
3. **Funnel Optimization**: Identify drop-off points in cross-domain user flows
4. **Campaign ROI**: Measure true end-to-end conversion rates
5. **Multi-Touch Attribution**: See all touchpoints in a customer's journey

## Migration Strategy

The system is designed for backward compatibility:

1. **Phase 1**: Journey tracking runs alongside existing session tracking
2. **Phase 2**: Analytics queries gradually migrate to use journeyId
3. **Phase 3**: Legacy sessionId fields can be deprecated

## Technical Considerations

### Performance
- URL parameters add ~200 bytes to each cross-domain link
- Cookie storage is minimal (~1KB per domain)
- No additional network requests required

### Privacy
- No PII in journey IDs
- Parameters are visible in URLs (consider for sensitive flows)
- Respects cookie consent preferences

### Limitations
- Journey data lost if user manually removes URL parameters
- Browser bookmark behavior may strip parameters
- Email clients may modify URLs

## Future Enhancements

1. **Server-Side Journey Store**: Persist journey state in database/Redis
2. **Shortened Parameters**: Encode journey data in compact tokens
3. **Journey Replay**: Visualize complete user journeys
4. **Advanced Attribution Models**: Support for custom attribution windows
5. **Real-Time Journey Monitoring**: Live dashboard of active journeys

## Code References

- **Middleware**: `packages/lib/src/middleware/request-parsing.ts`
- **URL Enrichment**: `packages/utils/src/tracking.ts`
- **Event Recording**: `packages/lib/src/functions/bio-event.fns.ts`
- **Tinybird Schemas**: `packages/tb/tinybird/datasources/barely_events.datasource`
- **Analytics Queries**: `packages/tb/tinybird/pipes/journey_funnel_analysis.pipe`