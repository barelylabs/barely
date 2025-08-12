# Technical Implementation Plan - App Modularization for Focused User Experiences

## Feature Summary

Implement environment-based navigation filtering and variant-specific pricing to create focused app variants (starting with FM) that display only relevant features and offer lower price points for simplified feature sets, leveraging existing deployment infrastructure and conditional rendering to deliver specialized user experiences without code duplication.

## Architecture Overview

The feature extends the existing navigation system by introducing conditional rendering logic based on the `NEXT_PUBLIC_CURRENT_APP` environment variable. The GitHub Actions deployment pipeline already supports app variants through `current_app_override`, requiring only the addition of environment variable configuration and navigation filtering logic within the React components.

**Components/Services Affected:**
- `apps/app/src/app/[handle]/_components/dash-sidebar-nav.tsx` (primary navigation filtering)
- `apps/app/src/app/[handle]/settings/billing/upgrade/page.tsx` (pricing component filtering)
- `packages/const/src/workspace-plans.constants.ts` (app variant pricing structure)
- `.github/workflows/deploy-to-vercel.yml` (environment variable configuration)
- New utility functions for app variant detection, navigation filtering, and pricing
- Environment configuration validation

## Key Technical Decisions

1. **Environment-based filtering over database flags**: Leverages existing deployment infrastructure and maintains performance without additional database queries or complexity.

2. **Conditional rendering in existing component**: Modifies the current navigation component rather than creating new components, maintaining consistency and reducing maintenance overhead.

3. **Utility functions for variant detection**: Creates reusable functions that can be extended for future app variants (press, link, merch) without duplicating logic.

4. **Backward compatibility preserved**: Default behavior remains unchanged when environment variable is not set, ensuring no breaking changes for existing deployments.

5. **App-specific pricing structure**: Creates separate Stripe price IDs for app variants with lower price points while maintaining the same tier names (Bedroom, Rising, Breakout) to avoid confusion.

## Dependencies & Assumptions

**Dependencies:**
- Existing GitHub Actions workflow with `current_app_override` support
- Current environment variable system (`@t3-oss/env-nextjs`)
- Existing navigation component structure and patterns
- Current workspace plans structure and Stripe integration
- App constants definition in `packages/const/src/app.constants.ts`
- Existing billing/upgrade page component

**Assumptions:**
- FM variant users primarily need: FM pages, basic settings, minimal media management, workspace switching
- Navigation filtering at the component level provides sufficient performance
- Future app variants will follow similar patterns of feature subset filtering and pricing tiers
- Environment variable approach scales to additional variants without significant refactoring
- App variant pricing will be 20-40% lower than full platform pricing to reflect simplified feature sets
- Cross-grading from app variants to full platform will be implemented later (out of scope for MVP)

## Implementation Checklist

### Core Navigation Filtering Feature

- [ ] Create `useCurrentApp` hook in `packages/hooks` to detect current app variant from environment
- [ ] Create `getNavigationForApp` utility function in `packages/utils` to filter navigation items based on app variant
- [ ] Add TypeScript definitions for app variants and navigation filtering in `packages/validators`
- [ ] Update `dash-sidebar-nav.tsx` to use conditional navigation filtering logic
- [ ] Create FM-specific navigation configuration with only essential links (FM, basic settings, media)
- [ ] Add environment variable validation for `NEXT_PUBLIC_CURRENT_APP` in app env configuration
- [ ] Implement fallback behavior when environment variable is undefined (show full navigation)

### App Variant Pricing Structure

- [ ] Extend `WORKSPACE_PLAN_TYPES` to include app variant plan types (e.g., 'fm.bedroom', 'fm.rising', 'fm.breakout')
- [ ] Create FM-specific plan configurations with lower pricing (20-40% reduction from standard plans)
- [ ] Add FM variant Stripe product IDs and price IDs for both test and production environments
- [ ] Update plan descriptions to reflect FM-focused feature sets and limitations
- [ ] Create `getPlansForApp` utility function to return appropriate plans based on current app variant
- [ ] Modify usage limits and highlights to reflect FM-specific feature constraints
- [ ] Implement plan feature filtering to show only FM-relevant capabilities
- [ ] Add TypeScript types for app variant pricing structures

### Deployment Infrastructure Updates

- [ ] Modify GitHub Actions `deploy-to-vercel.yml` to set `NEXT_PUBLIC_CURRENT_APP` environment variable based on `current_app_override`
- [ ] Add environment variable injection step during app variant copying process
- [ ] Update Vercel environment configuration to include `NEXT_PUBLIC_CURRENT_APP` for app-fm deployments
- [ ] Verify environment variable propagation through build and runtime processes

### Utility Functions and Shared Code

- [ ] Create `appVariants.ts` utility module with variant detection and validation functions
- [ ] Add navigation filtering helpers that return appropriate link arrays for each variant
- [ ] Create TypeScript types for app variant configurations and navigation structures
- [ ] Implement navigation group filtering logic that preserves existing component interfaces
- [ ] Create pricing plan filtering utilities for app variant-specific plan display
- [ ] Add app variant detection helpers for pricing and billing components

### Testing and Quality Assurance

- [ ] Add unit tests for `useCurrentApp` hook with different environment variable values
- [ ] Create component tests for `dash-sidebar-nav.tsx` with FM variant configuration
- [ ] Add integration tests for navigation filtering logic across different app variants
- [ ] Test environment variable detection and fallback behavior
- [ ] Verify navigation accessibility and responsive behavior in FM variant
- [ ] Test workspace switching maintains proper navigation filtering
- [ ] Add unit tests for FM-specific pricing plan configurations and calculations
- [ ] Create component tests for billing/upgrade page with FM variant pricing display
- [ ] Test pricing plan filtering logic and Stripe integration with variant-specific price IDs
- [ ] Verify app variant pricing displays correctly across different billing periods (monthly/yearly)

### Documentation and Developer Experience

- [ ] Update component documentation for navigation filtering behavior
- [ ] Document app variant configuration process for future variants
- [ ] Add development setup instructions for testing different app variants locally
- [ ] Create troubleshooting guide for environment variable configuration issues
- [ ] Document app variant pricing structure and Stripe configuration process
- [ ] Add guidance for setting up FM-specific pricing in test and production environments

### Security and Performance

- [ ] Validate that navigation filtering doesn't expose unintended routes or data
- [ ] Ensure navigation filtering performance doesn't impact page load times
- [ ] Verify that app variant detection works correctly in all deployment environments
- [ ] Test that workspace data access remains properly scoped regardless of navigation variant
- [ ] Ensure pricing plan filtering doesn't expose inappropriate upgrade options for app variants
- [ ] Validate that FM variant users can only access FM-appropriate billing plans
- [ ] Verify Stripe webhook handling works correctly with app variant-specific price IDs
- [ ] Test billing component performance with additional plan filtering logic

---

*Created: 2025-08-09*
*Feature: App Modularization for Focused User Experiences*
*Implementation Complexity: Simple*
*Estimated Components: 6 new utility functions, 2 major component modifications, 1 deployment workflow update, pricing structure extensions*