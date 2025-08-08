# Technical Implementation Plan - VIP Email-Gated Downloads

## Feature Summary

Build a high-conversion email capture system that exchanges exclusive audio content for fan email addresses, leveraging existing streaming infrastructure from barely.press and integrating with barely.email for automated nurture sequences that drive merchandise sales.

## Architecture Overview

The VIP feature will be implemented as a new Next.js app at `apps/vip` following the existing monorepo patterns. It will:
- Reuse the audio player component from barely.press
- Integrate with the workspace authentication system
- Store release metadata in PostgreSQL with new `vipReleases` and `vipAccessLogs` tables  
- Use S3 for audio file storage with presigned URLs for secure downloads
- Track all user interactions through the existing Tinybird analytics pipeline
- Trigger email sequences via the barely.email API

## Key Technical Decisions

1. **Separate App vs Extension**: Create new `apps/vip` rather than extending press app to maintain clear separation of concerns and allow independent scaling
2. **Download Implementation**: Use S3 presigned URLs with 24-hour expiration rather than streaming downloads to reduce server load
3. **Email Validation**: Client-side validation with server verification to minimize invalid submissions while maintaining UX
4. **Mobile Audio Fallback**: Email delivery of download links when in-app browser audio fails, avoiding complex polyfills
5. **Analytics**: Extend existing Tinybird events rather than creating new analytics system
6. **URL Structure**: Subdomain routing (barely.vip) with Cloudflare for optimal performance

## Dependencies & Assumptions

### Dependencies
- `@barely/press` audio player component is stable and exportable
- `@barely/email` API supports tag-based list segmentation
- `@barely/files` S3 client handles large audio files efficiently
- `@barely/db` supports new table creation without breaking changes
- Cloudflare subdomain configuration is accessible

### Assumptions
- Single track per release is sufficient for MVP
- Artists have audio files ready in standard formats (mp3, wav, flac)
- Email delivery infrastructure can handle instant confirmations at scale
- Existing workspace permissions model fits VIP use cases

## Implementation Checklist

### Database & Data Model
- [ ] Create database migration for `vipReleases` table with fields: id, workspaceId, title, key, description, artworkUrl, audioFileUrl, emailGateEnabled, allowDownload, createdAt, updatedAt, stats
- [ ] Create database migration for `vipAccessLogs` table with fields: id, vipReleaseId, email, workspaceId, accessedAt, downloadedAt, userAgent, ipAddress, utmParams
- [ ] Add indexes on vipReleases.key and vipReleases.workspaceId for query performance
- [ ] Create Zod schemas for VIP release validation in `@barely/validators`
- [ ] Add VIP-related types to `@barely/db` exports

### File Storage & CDN
- [ ] Extend `@barely/files` to support audio file validation (format, size limits)
- [ ] Create S3 bucket structure: `vip/{workspaceId}/{releaseId}/{filename}`
- [ ] Implement presigned URL generation with 24-hour expiration
- [ ] Configure Cloudflare caching rules for audio files
- [ ] Add file size limits (500MB per track) and format validation

### API Layer
- [ ] Create tRPC router for VIP operations in `packages/api/src/app/vip`
- [ ] Implement `createRelease` procedure with file upload handling
- [ ] Implement `getRelease` procedure with access control
- [ ] Implement `captureEmail` procedure with validation and deduplication
- [ ] Implement `trackDownload` procedure for secure URL generation
- [ ] Add workspace-scoped permissions checks to all procedures
- [ ] Create `getAnalytics` procedure for dashboard data

### Email Integration
- [ ] Create email template for download confirmation in `@barely/email/templates`
- [ ] Implement API call to barely.email for adding subscribers with tags
- [ ] Set up webhook handler for email bounce/unsubscribe events
- [ ] Create email delivery fallback for failed browser downloads
- [ ] Add rate limiting for email captures (max 5 per IP per minute)

### Frontend - Admin Dashboard
- [ ] Create new route in main app at `/dashboard/vip`
- [ ] Build VIP release creation form with drag-drop file upload
- [ ] Implement audio file preview before publishing
- [ ] Create releases list view with quick stats
- [ ] Add real-time analytics dashboard component
- [ ] Implement bulk actions UI (pause, delete, export)
- [ ] Add mobile preview component for release pages

### Frontend - Public VIP App
- [ ] Initialize new Next.js app at `apps/vip`
- [ ] Configure subdomain routing for barely.vip
- [ ] Create dynamic route structure: `/[handle]/[key]`
- [ ] Build mobile-first release page with locked/unlocked states
- [ ] Integrate audio player component from `@barely/press`
- [ ] Implement inline email capture form with validation
- [ ] Add download button with progress indicator
- [ ] Create success state after email submission
- [ ] Implement error states and retry mechanisms

### Analytics & Tracking
- [ ] Extend Tinybird schema for VIP events
- [ ] Implement client-side event tracking for: page_view, email_displayed, email_submitted, content_unlocked, track_played, download_started, download_completed
- [ ] Add server-side tracking for email validation and file downloads
- [ ] Create UTM parameter parsing and storage
- [ ] Build analytics aggregation queries in Tinybird
- [ ] Implement CSV export functionality for analytics data

### Security & Performance
- [ ] Implement rate limiting on email capture endpoint
- [ ] Add CAPTCHA for suspicious traffic patterns
- [ ] Configure CORS for audio streaming from S3
- [ ] Set up Redis caching for release metadata
- [ ] Implement request deduplication for concurrent downloads
- [ ] Add monitoring alerts for high error rates
- [ ] Configure auto-scaling for traffic spikes

### Testing
- [ ] Unit tests for email validation logic
- [ ] Unit tests for presigned URL generation
- [ ] Integration tests for email capture flow
- [ ] Integration tests for download delivery
- [ ] E2E tests for complete user journey
- [ ] Load tests for 10,000 concurrent visitors
- [ ] Mobile browser compatibility tests (Safari, Chrome, Instagram, TikTok)

### Cart & Attribution Integration
- [ ] Implement post-download redirect to barely.cart
- [ ] Add attribution tracking from VIP to cart conversion
- [ ] Create revenue reporting queries joining VIP and cart data
- [ ] Build attribution dashboard showing full funnel metrics
- [ ] Add email-to-purchase tracking with 30-day window

### Error Handling & Edge Cases
- [ ] Handle S3 upload failures with retry mechanism
- [ ] Implement email delivery fallback for download failures
- [ ] Add graceful degradation for unsupported browsers
- [ ] Create user-friendly error messages for all failure modes
- [ ] Implement offline support for analytics events
- [ ] Handle duplicate email submissions gracefully

### Documentation & Monitoring
- [ ] Document API endpoints and expected responses
- [ ] Create runbook for common issues and solutions
- [ ] Set up Sentry error tracking for both apps
- [ ] Configure CloudWatch alarms for key metrics
- [ ] Document email template variables and triggers
- [ ] Create internal guide for artist onboarding