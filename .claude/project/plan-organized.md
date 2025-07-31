# Technical Implementation Plan - VIP Email-Gated Downloads (Feature-Organized)

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

## Implementation Checklist (Organized by Feature)

### 🏗️ Feature 1: Core Infrastructure & Data Model
Foundation needed before any other features can be built.

**Database & Types**
- [ ] Create database migration for `vipReleases` table with fields: id, workspaceId, title, key, description, artworkUrl, audioFileUrl, emailGateEnabled, allowDownload, createdAt, updatedAt, stats
- [ ] Create database migration for `vipAccessLogs` table with fields: id, vipReleaseId, email, workspaceId, accessedAt, downloadedAt, userAgent, ipAddress, utmParams
- [ ] Add indexes on vipReleases.key and vipReleases.workspaceId for query performance
- [ ] Create Zod schemas for VIP release validation in `@barely/validators`
- [ ] Add VIP-related types to `@barely/db` exports

**File Storage Setup**
- [ ] Extend `@barely/files` to support audio file validation (format, size limits)
- [ ] Create S3 bucket structure: `vip/{workspaceId}/{releaseId}/{filename}`
- [ ] Add file size limits (500MB per track) and format validation
- [ ] Configure Cloudflare caching rules for audio files

**App Initialization**
- [ ] Initialize new Next.js app at `apps/vip`
- [ ] Configure subdomain routing for barely.vip
- [ ] Set up Sentry error tracking for both apps
- [ ] Configure CORS for audio streaming from S3

**Testing Infrastructure**
- [ ] Set up testing framework for new app
- [ ] Create test fixtures for VIP releases
- [ ] Set up test S3 bucket for file uploads

### 📝 Feature 2: VIP Page Creation & Management
Enable artists/agencies to create and manage exclusive content releases.

**Backend - Release Management**
- [ ] Create tRPC router for VIP operations in `packages/api/src/app/vip`
- [ ] Implement `createRelease` procedure with file upload handling
- [ ] Implement `updateRelease` procedure for editing releases
- [ ] Implement `deleteRelease` procedure with proper cleanup
- [ ] Add workspace-scoped permissions checks to all procedures
- [ ] Handle S3 upload failures with retry mechanism

**Frontend - Admin Dashboard**
- [ ] Create new route in main app at `/dashboard/vip`
- [ ] Build VIP release creation form with drag-drop file upload
- [ ] Implement audio file preview before publishing
- [ ] Add mobile preview component for release pages
- [ ] Create releases list view with quick stats
- [ ] Implement bulk actions UI (pause, delete, export)

**Security & Validation**
- [ ] Implement file format validation (mp3, wav, flac only)
- [ ] Add virus scanning for uploaded files
- [ ] Validate release URLs are unique per workspace
- [ ] Add rate limiting for release creation

**Testing**
- [ ] Unit tests for file validation logic
- [ ] Integration tests for release creation flow
- [ ] E2E tests for complete creation process
- [ ] Test error handling for invalid files

### 💌 Feature 3: Email Capture & Content Delivery
Core value exchange - fans trade email for exclusive content.

**Backend - Email Capture**
- [ ] Implement `getRelease` procedure with public access
- [ ] Implement `captureEmail` procedure with validation and deduplication
- [ ] Implement `trackDownload` procedure for secure URL generation
- [ ] Implement presigned URL generation with 24-hour expiration
- [ ] Add rate limiting for email captures (max 5 per IP per minute)
- [ ] Handle duplicate email submissions gracefully

**Frontend - Public VIP Pages**
- [ ] Create dynamic route structure: `/[handle]/[key]`
- [ ] Build mobile-first release page with locked/unlocked states
- [ ] Integrate audio player component from `@barely/press`
- [ ] Implement inline email capture form with validation
- [ ] Add download button with progress indicator
- [ ] Create success state after email submission
- [ ] Implement error states and retry mechanisms
- [ ] Add email delivery fallback for download failures

**Email Infrastructure**
- [ ] Create email template for download confirmation in `@barely/email/templates`
- [ ] Implement API call to barely.email for adding subscribers with tags
- [ ] Create email delivery fallback for failed browser downloads
- [ ] Set up webhook handler for email bounce/unsubscribe events

**Performance & Edge Cases**
- [ ] Set up Redis caching for release metadata
- [ ] Implement request deduplication for concurrent downloads
- [ ] Add graceful degradation for unsupported browsers
- [ ] Create user-friendly error messages for all failure modes
- [ ] Implement offline support for analytics events

**Testing**
- [ ] Unit tests for email validation logic
- [ ] Unit tests for presigned URL generation
- [ ] Integration tests for email capture flow
- [ ] Integration tests for download delivery
- [ ] Mobile browser compatibility tests (Safari, Chrome, Instagram, TikTok)
- [ ] Load tests for 10,000 concurrent visitors

### 📊 Feature 4: Analytics & Attribution
Track conversions and prove ROI for agency clients.

**Analytics Infrastructure**
- [ ] Extend Tinybird schema for VIP events
- [ ] Create UTM parameter parsing and storage
- [ ] Build analytics aggregation queries in Tinybird
- [ ] Create `getAnalytics` procedure for dashboard data

**Event Tracking Implementation**
- [ ] Implement client-side event tracking for: page_view, email_displayed, email_submitted, content_unlocked, track_played, download_started, download_completed
- [ ] Add server-side tracking for email validation and file downloads
- [ ] Track geographic data and device information
- [ ] Implement funnel tracking: Visit → Email → Download

**Analytics Dashboard**
- [ ] Add real-time analytics dashboard component
- [ ] Create funnel visualization component
- [ ] Build geographic distribution map
- [ ] Implement CSV export functionality for analytics data
- [ ] Add date range selection for analytics

**Testing**
- [ ] Unit tests for event tracking logic
- [ ] Integration tests for analytics pipeline
- [ ] Test data accuracy and aggregation

### 📧 Feature 5: Email Marketing Integration
Automated sequences to nurture leads toward purchases.

**Email Automation Setup**
- [ ] Configure barely.email integration for automated sequences
- [ ] Create tags structure: "vip-[artist]-[release-key]"
- [ ] Set up trigger for post-capture nurture sequence
- [ ] Implement unsubscribe handling and preference management

**Monitoring & Management**
- [ ] Create email performance dashboard
- [ ] Track email open rates and click rates
- [ ] Monitor bounce rates and handle suppressions
- [ ] Set up alerts for deliverability issues

**Testing**
- [ ] Test email delivery at scale
- [ ] Verify tag application and segmentation
- [ ] Test unsubscribe flow
- [ ] Load test email sending capacity

### 🛒 Feature 6: Cart & Revenue Attribution
Connect email captures to merchandise sales for ROI proof.

**Attribution Infrastructure**
- [ ] Implement post-download redirect to barely.cart
- [ ] Add attribution tracking from VIP to cart conversion
- [ ] Add email-to-purchase tracking with 30-day window
- [ ] Store attribution data in database

**Revenue Reporting**
- [ ] Create revenue reporting queries joining VIP and cart data
- [ ] Build attribution dashboard showing full funnel metrics
- [ ] Implement ROAS calculation and display
- [ ] Add export functionality for revenue reports

**Testing**
- [ ] Test attribution tracking accuracy
- [ ] Verify revenue calculations
- [ ] Test edge cases (multiple purchases, returns)
- [ ] E2E tests for complete funnel

### 🔍 Feature 7: Security, Performance & Monitoring
Cross-cutting concerns for production readiness.

**Security Hardening**
- [ ] Implement rate limiting on all public endpoints
- [ ] Add CAPTCHA for suspicious traffic patterns
- [ ] Configure secure headers and CSP
- [ ] Implement IP-based blocking for abuse

**Performance Optimization**
- [ ] Configure auto-scaling for traffic spikes
- [ ] Optimize database queries with proper indexing
- [ ] Implement CDN preloading for common assets
- [ ] Add performance monitoring

**Monitoring & Alerting**
- [ ] Configure CloudWatch alarms for key metrics
- [ ] Set up uptime monitoring
- [ ] Add monitoring alerts for high error rates
- [ ] Create operational dashboard

**Documentation**
- [ ] Document API endpoints and expected responses
- [ ] Create runbook for common issues and solutions
- [ ] Document email template variables and triggers
- [ ] Create internal guide for artist onboarding