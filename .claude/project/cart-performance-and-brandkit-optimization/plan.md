# Technical Implementation Plan - Cart Performance & BrandKit Optimization

## Feature Summary

Implement BrandKit caching pattern from apps/bio in apps/cart to eliminate render-blocking workspace queries, reducing cart load time from 9.3s to under 2.5s through cached brand data, progressive loading with React Suspense, and edge optimization.

## Architecture Overview

The solution integrates the existing BrandKit provider from the UI package into the cart application, replacing the synchronous `getFunnelByParams` call with cached workspace data. This involves:

- **Server Components**: Implementing cached BrandKit fetching at layout level
- **Client Components**: Using BrandKitProvider for brand context throughout cart UI
- **API Layer**: Creating cart-specific tRPC routes with caching strategies  
- **Edge Layer**: Implementing CDN caching for static assets and API responses
- **Database Layer**: Optimizing queries and implementing cache invalidation

## Key Technical Decisions

1. **Use React's `cache()` function**: Leverage Next.js 15's built-in request deduplication for BrandKit data
2. **Split data fetching**: Separate BrandKit (cacheable) from cart data (real-time) to enable parallel loading
3. **Implement at layout level**: Fetch BrandKit in layout.tsx to share across all cart pages
4. **Use existing UI patterns**: Reuse BrandKitProvider from UI package rather than creating cart-specific solution
5. **Progressive enhancement**: Use Suspense boundaries with skeleton states for perceived performance
6. **Edge caching strategy**: Cache BrandKit data at edge with 5-minute TTL, cart products with 1-minute TTL

## Dependencies & Assumptions

**Dependencies:**
- `@barely/ui` package with BrandKitProvider component
- `@barely/api` for tRPC route definitions
- `@barely/lib` for workspace and cart functions
- React 18+ with Suspense support
- Next.js 15 with App Router and RSC

**Assumptions:**
- BrandKit data changes infrequently (safe to cache aggressively)
- Inventory/pricing requires real-time accuracy (limited caching)
- Users primarily access cart on mobile devices
- Cold starts are acceptable trade-off for reduced server load

## Implementation Checklist

### Feature 1: BrandKit Caching Implementation

- [ ] Create cached BrandKit fetcher in apps/cart/src/trpc/server.tsx
  - Copy pattern from apps/bio/src/trpc/server.tsx
  - Implement `fetchBrandKitByHandle` using React cache()
  - Add prefetch capability for BrandKit data

- [ ] Refactor cart layout to use cached BrandKit
  - Update apps/cart/src/app/[mode]/[handle]/[key]/layout.tsx
  - Fetch BrandKit separately from cart funnel data
  - Pass BrandKit to providers for context usage

- [ ] Implement BrandKitProvider in cart providers
  - Update apps/cart/src/app/[mode]/[handle]/[key]/providers.tsx
  - Import BrandKitProvider from @barely/ui/bio
  - Wrap children with BrandKitProvider using fetched data

- [ ] Extract workspace query from getFunnelByParams
  - Create new `getFunnelWithoutWorkspace` function in cart.fns.ts
  - Remove workspace join from main query
  - Return lightweight funnel data only

- [ ] Create cart-specific BrandKit API route
  - Add brandKitByHandle procedure to cart tRPC router
  - Implement caching headers (Cache-Control: max-age=300)
  - Add stale-while-revalidate strategy

- [ ] Update cart page components to use BrandKit context
  - Replace direct workspace property access with useBrandKit hook
  - Update color and font references throughout cart UI
  - Ensure brand styles apply during loading states

- [ ] Add BrandKit data validation
  - Create Zod schema for cart-specific BrandKit subset
  - Validate cached data before usage
  - Implement fallback for invalid cache entries

- [ ] Set up cache invalidation strategy
  - Implement workspace update webhook handler
  - Clear BrandKit cache on workspace changes
  - Add manual cache purge capability

### Feature 2: Progressive Loading with Suspense

- [ ] Create cart skeleton components
  - Build CartSkeleton component matching final layout
  - Create ProductSkeleton for product cards
  - Design CheckoutFormSkeleton for form sections

- [ ] Implement Suspense boundaries in cart pages
  - Wrap cart content in Suspense with skeleton fallback
  - Add nested Suspense for product sections
  - Create loading.tsx files for route segments

- [ ] Split data fetching for parallel loading
  - Fetch BrandKit in parallel with cart data
  - Load product images asynchronously
  - Defer non-critical data (recommendations, reviews)

- [ ] Optimize component lazy loading
  - Lazy load checkout form components
  - Defer upsell components until main content loads
  - Code-split payment provider SDKs

- [ ] Add streaming SSR configuration
  - Enable streaming in Next.js config
  - Configure React 18 streaming features
  - Set appropriate chunk sizes for mobile

- [ ] Implement error boundaries
  - Add error boundary around cart content
  - Create fallback UI for loading failures
  - Log errors to monitoring service

- [ ] Create progressive image loading
  - Use blur placeholders for product images
  - Implement lazy loading with intersection observer
  - Optimize image formats and sizes

### Feature 3: Cart Data Caching Strategy

- [ ] Implement Redis session caching
  - Set up Redis connection in cart app
  - Create cart session storage adapter
  - Implement session-based cart retrieval

- [ ] Cache product catalog data
  - Store product details with 1-minute TTL
  - Implement cache warming for popular products
  - Add cache tags for targeted invalidation

- [ ] Create smart inventory checking
  - Batch inventory checks per request
  - Cache inventory status for 30 seconds
  - Implement optimistic UI updates

- [ ] Build cart persistence layer
  - Store cart state in Redis
  - Implement cart recovery after session timeout
  - Add cross-device cart sync capability

- [ ] Optimize database queries
  - Add appropriate indexes for cart queries
  - Implement query result caching
  - Use database connection pooling

- [ ] Set up background data refresh
  - Create background job for cache warming
  - Implement stale-while-revalidate for products
  - Add predictive prefetching for related items

- [ ] Add cache monitoring
  - Track cache hit/miss rates
  - Monitor cache memory usage
  - Alert on cache performance degradation

### Feature 4: Edge Optimization

- [ ] Configure CDN caching headers
  - Set Cache-Control for static assets (max-age=31536000)
  - Configure s-maxage for dynamic content
  - Implement Vary headers for proper caching

- [ ] Optimize bundle splitting
  - Analyze current bundle with webpack-bundle-analyzer
  - Split vendor chunks appropriately
  - Implement route-based code splitting

- [ ] Compress static assets
  - Enable Brotli compression for text assets
  - Optimize images with next/image
  - Minify CSS and JavaScript

- [ ] Implement edge functions
  - Move BrandKit resolution to edge
  - Cache API responses at edge locations
  - Add geolocation-based optimization

- [ ] Configure preloading strategies
  - Preload critical fonts and CSS
  - Use resource hints (dns-prefetch, preconnect)
  - Implement link prefetching for likely navigation

- [ ] Set up service worker
  - Cache static assets offline
  - Implement network-first strategy for API calls
  - Add offline fallback page

- [ ] Optimize third-party scripts
  - Load payment SDKs asynchronously
  - Defer analytics scripts
  - Use web workers for heavy computations

### Feature 5: Cart Preview in App

- [ ] Create CartPreview component
  - Copy pattern from bio preview in settings
  - Build iframe-based preview container
  - Add preview controls (device size, themes)

- [ ] Integrate preview in brand settings
  - Add cart tab to settings/brand page
  - Implement live preview updates
  - Connect to BrandKit changes

- [ ] Build preview data mocking
  - Create sample cart data for preview
  - Generate realistic product listings
  - Mock checkout flow states

- [ ] Add preview synchronization
  - Sync BrandKit changes to preview
  - Update preview on setting changes
  - Implement debounced updates

- [ ] Create preview API endpoint
  - Build preview-specific data fetcher
  - Add authentication for preview access
  - Cache preview data appropriately

### Feature 6: Performance Monitoring

- [ ] Implement Web Vitals tracking
  - Add LCP, FID, CLS monitoring
  - Track TTFB and FCP metrics
  - Send metrics to analytics service

- [ ] Set up Real User Monitoring
  - Track performance by user segment
  - Monitor performance by geography
  - Analyze device and connection impact

- [ ] Create performance dashboards
  - Build Lighthouse CI integration
  - Set up performance budgets
  - Create alerting for regressions

- [ ] Add synthetic monitoring
  - Set up Checkly or similar service
  - Monitor critical user paths
  - Test from multiple locations

- [ ] Implement custom performance marks
  - Track cart initialization time
  - Measure time to interactive
  - Monitor API response times

- [ ] Configure error tracking
  - Set up Sentry for error monitoring
  - Track performance-related errors
  - Create error rate dashboards

### Feature 7: Testing & Validation

- [ ] Write unit tests for cache functions
  - Test cache hit/miss scenarios
  - Validate cache invalidation logic
  - Test error handling paths

- [ ] Create integration tests
  - Test BrandKit provider integration
  - Validate cart data flow
  - Test cache warming processes

- [ ] Build performance test suite
  - Create Lighthouse CI tests
  - Add load testing with k6
  - Test on throttled connections

- [ ] Implement E2E tests
  - Test critical checkout paths
  - Validate progressive loading
  - Test error recovery flows

- [ ] Add visual regression tests
  - Capture skeleton state screenshots
  - Test brand styling application
  - Validate responsive layouts

- [ ] Create cache testing utilities
  - Build cache inspection tools
  - Add cache debugging endpoints
  - Create cache performance benchmarks

### Feature 8: Migration & Rollout

- [ ] Create feature flags
  - Add flag for BrandKit caching
  - Control progressive loading rollout
  - Enable gradual user migration

- [ ] Build rollback capabilities
  - Create instant rollback switch
  - Maintain backward compatibility
  - Test rollback procedures

- [ ] Set up A/B testing
  - Compare old vs new performance
  - Track conversion impact
  - Monitor error rates

- [ ] Create migration scripts
  - Migrate existing cart sessions
  - Warm caches before cutover
  - Validate data integrity

- [ ] Document deployment process
  - Write runbook for deployment
  - Document rollback procedures
  - Create monitoring checklist

- [ ] Plan staged rollout
  - Start with 5% of traffic
  - Monitor metrics at each stage
  - Full rollout after validation