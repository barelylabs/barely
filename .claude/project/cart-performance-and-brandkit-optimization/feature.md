# Feature: Cart Performance & BrandKit Optimization

## Context & Background

### Related Work
- **Builds On**: [[0_Projects/bio-mvp]] - Successfully implemented BrandKit caching pattern
- **Integrates With**: [[barely.cart]] - Existing checkout system needing optimization
- **References**: [[1_Areas/business/strategy/barely-platform-strategy-2025]] - Cart as core platform service

### Performance Crisis
- **Current State**: 37 Lighthouse score, 9.3s LCP, 3.7s blocking time
- **Root Cause**: Entire page render blocked on uncached workspace query for single brand color
- **Business Impact**: ~50% cart abandonment due to performance (industry standard)

## Problem Statement

barely.cart has catastrophic performance metrics (9.3s LCP, 37 Lighthouse score) caused by render-blocking workspace queries for brand data, resulting in significant cart abandonment and lost revenue.

### Evidence of Need
- **Lighthouse Performance Score**: 37/100 (failing)
- **Largest Contentful Paint**: 9.3s (370% over "poor" threshold of 2.5s)
- **Total Blocking Time**: 3,700ms (1,850% over target of 200ms)
- **Speed Index**: 6.2s (3x slower than acceptable)
- **Cold starts**: "Many seconds slower" than warm boots
- **Industry impact**: 7% conversion loss per second of delay = ~50% lost sales at current speeds

## Target Users

Artists and their fans attempting to complete purchases through barely.cart checkout flows.

### User Impact
- **Fans**: Abandon carts due to perceived site failure/freeze
- **Artists**: Lose sales and damage brand perception
- **Platform**: Reduced transaction fees and reputation damage

## Current State & Pain Points

### How It Works Today
1. User clicks checkout link
2. Cart page initiates render
3. **BLOCKS** entire page waiting for workspace query
4. Fetches single brand color value
5. Finally renders page after 9.3+ seconds
6. Cold starts are even worse

### Validated Pain Points
- **9.3 second wait** before seeing cart content
- **3.7 seconds of frozen UI** (Total Blocking Time)
- **No progressive loading** - white screen until fully loaded
- **Cold starts catastrophic** - likely 15-20s wait times

## Recommended Solution

Implement the proven BrandKit caching pattern from barely.bio to eliminate render-blocking queries and add progressive loading capabilities.

### Why This Approach
- **Proven pattern**: Already successful in barely.bio (sub-2s loads)
- **Immediate impact**: Removes primary blocking query
- **Progressive enhancement**: Suspense boundaries improve perceived speed
- **Coherent ecosystem**: Consistent caching across Barely platform

## Success Criteria

### Performance Metrics (Primary)
- **Lighthouse Score**: >70 (from 37)
- **LCP**: <2.5s (from 9.3s)
- **TBT**: <200ms (from 3,700ms)
- **Speed Index**: <3s (from 6.2s)

### Business Metrics (Secondary)
- **Cart abandonment**: Reduce by 30%+
- **Conversion rate**: Increase by 20%+
- **Cold start time**: <5s (from "many seconds")

## Core Functionality (MVP)

### Must Have (Performance Critical)
- **Cached BrandKit Provider**: Eliminate render-blocking workspace queries
- **Cart Data Caching**: Cache products, pricing, inventory checks where safe
- **Suspense Boundaries**: Progressive loading with skeleton states
- **Edge Caching**: Static assets served from edge

### Implementation Pattern
```
1. Pre-fetch and cache workspace BrandKit on cart initialization
2. Render immediately with cached data or defaults
3. Progressive enhancement as data loads
4. Background refresh for real-time data (inventory, pricing)
```

## Out of Scope for MVP

### Not Performance Critical
- Visual brand customization beyond colors
- Advanced theming options
- Cart template variations
- Animation improvements

### Available Later
- A/B testing different loading strategies
- Predictive prefetching based on user behavior
- Advanced CDN optimizations

## Integration Points

### With Existing Features
- **barely.bio BrandKit**: Reuse caching infrastructure and providers
- **Workspace System**: Leverage existing workspace data structure
- **Cart API**: Maintain compatibility with existing checkout flow

### Technical Integration
- Extends: BrandKit provider from bio app
- Reuses: Workspace caching infrastructure
- New requirements: Cart-specific cache invalidation strategies

## Complexity Assessment

**Overall Complexity**: Medium

**Reduced Complexity Through:**
- Reusing proven BrandKit pattern from bio
- Existing caching infrastructure
- Clear performance targets

**Remaining Complexity:**
- Cache invalidation for transactional data
- Balancing real-time inventory with performance
- Testing across connection speeds

## Human Review Required

- [ ] Validate cold start measurement methodology
- [ ] Confirm cart abandonment correlation with performance
- [ ] Review cache invalidation strategy for inventory/pricing

## Technical Considerations

- Fits within existing Next.js RSC architecture
- Leverages React Suspense for progressive loading
- Cache-Control headers for edge caching
- Consider Redis for session-based cart caching

## Migration Path

### Zero-Downtime Deployment
1. Deploy caching layer without changing rendering
2. A/B test cached vs. uncached performance
3. Progressive rollout based on metrics
4. Full migration once stable

## Future Possibilities

### Based on Performance Gains
- Sub-second cart loads with predictive prefetching
- Offline-capable checkout with service workers
- Real-time collaborative carts for group purchases