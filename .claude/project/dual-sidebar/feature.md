# Feature: App Modularization for Focused User Experiences

## Context & Background

### Related Work
- **Builds On**: Current barely.ai unified platform architecture
- **Differs From**: Single-app approach - creates focused variants of the main application
- **Integrates With**: Existing GitHub Actions CI/CD pipeline and environment configuration

### Historical Context
- **Previous Attempts**: None - this is the first implementation of app modularization
- **Lessons Applied**: Leveraging existing infrastructure to minimize complexity
- **Success Factors**: Simple environment-based feature flagging with existing deployment pipeline

## Problem Statement

Independent artists need focused, distraction-free experiences for specific workflows, but the current unified dashboard shows all features regardless of the user's primary intent or use case.

### Evidence of Need
- Users often use barely.ai for single-purpose workflows (e.g., only FM pages)
- Full navigation can be overwhelming for focused tasks
- Different user segments need different feature sets

## Target Users

Independent artists who want focused experiences for specific barely.ai products (starting with FM users).

### Differentiation from Existing Users
- Users who primarily use one product (e.g., FM) but get distracted by full navigation
- New users who want to start with one focused workflow
- Power users who want specialized environments for different tasks

## Current State & Pain Points

### How Users Handle This Today
- Navigate through full dashboard regardless of intended workflow
- Must ignore irrelevant navigation items
- No way to customize interface for specific use cases

### Validated Pain Points
- Cognitive overhead from seeing all features when only using one
- Navigation complexity for single-purpose users
- No personalization based on primary use case

## Recommended Solution

Create app variants that show filtered navigation and features based on the `NEXT_PUBLIC_CURRENT_APP` environment variable, starting with an FM-focused variant.

### Why This Approach
- Leverages existing environment configuration system
- Uses established GitHub Actions deployment pipeline
- Maintains single codebase for easier maintenance
- Allows gradual feature expansion per variant

## Success Criteria

### Differentiated Metrics
- Reduced navigation complexity (fewer menu items for FM variant)
- Focused user experience (only FM-relevant features shown)
- Deployment flexibility (multiple app variants from single codebase)

### Learning from Previous Attempts
- Focus on simplicity first - minimal viable feature set
- Use existing infrastructure rather than building new systems

## Core Functionality (MVP)

### Must Have (Validated through context)
- Environment-based navigation filtering using `NEXT_PUBLIC_CURRENT_APP`
- FM variant showing only: FM pages, basic settings, minimal media management
- Default behavior unchanged (full navigation when env var not set)

### Reusable Components
- Existing navigation structure in `dash-sidebar-nav.tsx`
- Current environment configuration system
- GitHub Actions deployment pipeline with `current_app_override`

## Out of Scope for MVP

### Learned from Previous Attempts
- No new deployment infrastructure needed
- No database changes required

### Available in Existing Solutions
- Full feature set available in default app variant
- All functionality remains accessible in standard deployment

## Integration Points

### With Existing Features
- Navigation system: Filter existing nav arrays conditionally
- Environment config: Use existing `NEXT_PUBLIC_CURRENT_APP` variable
- Deployment: Leverage existing `deploy-app-fm` GitHub Action

### Technical Integration
- Extends: Current sidebar navigation component
- Reuses: Environment configuration system
- New requirements: Simple conditional rendering logic

## Complexity Assessment

**Overall Complexity**: Simple

**Reduced Complexity Through:**
- Reusing existing deployment infrastructure
- Leveraging current environment variable system
- Building on established navigation patterns

**Remaining Complexity:**
- Conditional navigation logic implementation
- Testing across different app variants

## Human Review Required

- [ ] Assumption: FM users want minimal navigation (needs user validation)
- [ ] Differentiation: Confirm this provides meaningful value over current approach
- [ ] Priority: Should this come before other navigation improvements?

## Technical Considerations

**High-level only - informed by existing architecture**
- Fits within current React component patterns
- Extends existing environment variable usage
- Leverages established GitHub Actions workflow

## Migration Path

### From Existing Solutions
- Default app behavior remains unchanged
- FM deployment creates focused variant automatically
- No user migration needed - environment-determined

### Deprecation Considerations
- No deprecation needed - additive feature
- Coexistence strategy: Variants complement full app

## Future Possibilities

### Based on Historical Patterns
- If successful, could enable: app-press, app-link, app-merch variants
- Watch for: Feature creep - keep variants focused
- Natural evolution toward: User-customizable dashboard experiences

---

*Created: 2025-08-09*
*Status: Ready for Implementation*
*Complexity: Simple*
*Next Command: `/product-development:02_create-jtbd`*