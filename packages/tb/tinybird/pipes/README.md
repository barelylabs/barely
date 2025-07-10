# Tinybird Pipes

This directory contains all Tinybird pipe definitions, organized by purpose.

## Structure

### `/materialization`

Pipes that process raw events and create materialized views:

#### `/materialization/app-events`

Filter main event stream by application:

- `barely_cart_events_pipe.pipe` - Creates cart events materialized view
- `barely_fm_events_pipe.pipe` - Creates FM events materialized view
- `barely_link_events_pipe.pipe` - Creates link events materialized view
- `barely_page_events_pipe.pipe` - Creates page events materialized view

#### `/materialization/aggregations`

Create aggregated views for performance:

- `web_sessions*.pipe` - Session-level aggregations
- `web_sources*.pipe` - Traffic source aggregations

### `/endpoints`

API endpoint pipes organized by application:

#### `/endpoints/[app]` (cart, fm, link, page)

Each app directory contains analytics endpoints for:

- `v2_[app]_browsers.pipe` - Browser analytics
- `v2_[app]_cities.pipe` - Geographic city data
- `v2_[app]_countries.pipe` - Country analytics
- `v2_[app]_devices.pipe` - Device type analytics
- `v2_[app]_os.pipe` - Operating system analytics
- `v2_[app]_referers.pipe` - Referrer analytics
- `v2_[app]_regions.pipe` - Geographic region data
- `v2_[app]_timeseries.pipe` - Time-based analytics

##### `/endpoints/[app]/attribution`

Attribution and campaign tracking:

- `v2_[app]_emailBroadcasts.pipe` - Email broadcast attribution
- `v2_[app]_emailTemplates.pipe` - Email template performance
- `v2_[app]_flowActions.pipe` - Flow action tracking
- `v2_[app]_landingPages.pipe` - Landing page performance
- `v2_[app]_metaAds.pipe` - Meta (Facebook) ad attribution
- `v2_[app]_metaAdSets.pipe` - Meta ad set performance
- `v2_[app]_metaCampaigns.pipe` - Meta campaign analytics
- `v2_[app]_metaPlacements.pipe` - Meta placement data

#### `/endpoints/general`

Cross-application endpoints:

- `v2_web_events.pipe` - General event stream
- `web_hits*.pipe` - Page hit analytics
- `web_sources__top_*.pipe` - Top sources by dimension

## Naming Conventions

- `v2_` prefix indicates version 2 of the analytics API
- `_mv` suffix indicates materialized view datasources
- Double underscore (`__`) indicates sub-endpoints or variants

## CI/CD Testing

- `ci_test.pipe` - Test pipe for verifying CI/CD deployment
- `deployment_health.pipe` - Health check endpoint for deployment verification

---

**CI/CD Deployment Info:**

- Last updated: 2024-06-20
- Pipeline: GitHub Actions Tinybird CI/CD
- Purpose: Verify deployment pipeline works correctly
- Status: Ready for main branch testing
