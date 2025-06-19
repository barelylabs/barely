# Tinybird Data Flow Architecture

## Overview
This document describes how data flows through the Tinybird analytics pipeline from raw events to API endpoints.

## Data Flow Diagram

```
┌─────────────────┐
│   Applications  │
│  (cart, fm,     │
│   link, page)   │
└────────┬────────┘
         │ Send events
         ▼
┌─────────────────┐
│  barely_events  │ ← Raw event stream
│  (datasource)   │
└────────┬────────┘
         │ Filter by event_type
         ▼
┌─────────────────────────────────────────┐
│        Materialization Pipes            │
├─────────────────┬───────────────────────┤
│ cart_events_pipe│ fm_events_pipe        │
│ link_events_pipe│ page_events_pipe      │
└─────────────────┴───────────────────────┘
         │ Create materialized views
         ▼
┌─────────────────────────────────────────┐
│      App-Specific Materialized Views    │
├─────────────────┬───────────────────────┤
│ cart_events_mv  │ fm_events_mv          │
│ link_events_mv  │ page_events_mv        │
└─────────────────┴───────────────────────┘
         │ Query for analytics
         ▼
┌─────────────────────────────────────────┐
│         Analytics Endpoint Pipes        │
├─────────────────────────────────────────┤
│ • Dimensions: browsers, countries, etc. │
│ • Attribution: meta ads, email, etc.    │
│ • Time series analytics                 │
└─────────────────────────────────────────┘
         │ Expose as API
         ▼
┌─────────────────┐
│   REST API      │
│   Endpoints     │
└─────────────────┘
```

## Event Schema

### Core Event Fields
All events in `barely_events` contain:
- `timestamp` - Event occurrence time
- `event_type` - Type of event (cart, fm, link, page)
- `workspace_id` - Workspace identifier
- `session_id` - User session
- `visitor_id` - Unique visitor identifier

### Event Types
1. **Cart Events** - E-commerce interactions (view, add_to_cart, purchase)
2. **FM Events** - Music platform interactions (play, pause, share)
3. **Link Events** - Short link clicks and redirects
4. **Page Events** - Landing page views and interactions

## Performance Optimizations

### Materialized Views
- Pre-filtered by event type to reduce query complexity
- Indexed on common query dimensions (timestamp, workspace_id)
- Automatically refreshed as new events arrive

### Endpoint Design
- Each endpoint queries a specific materialized view
- Time-based partitioning for efficient range queries
- Parameterized queries with default values

## API Token Structure
Each pipe that serves as an endpoint has a READ token defined:
- Format: `v2_[app]_[dimension]_endpoint_read_[id]`
- Example: `v2_cart_browsers_endpoint_read_5053`

## Best Practices

### When Adding New Analytics
1. Determine if it fits an existing app category
2. Create the endpoint pipe in the appropriate directory
3. Follow the naming convention: `v2_[app]_[dimension].pipe`
4. Include appropriate TOKEN definition for API access

### When Modifying Existing Analytics
1. Test changes in a development workspace first
2. Consider impact on materialized views
3. Update documentation if schema changes

### Monitoring and Maintenance
- Check materialized view refresh status regularly
- Monitor query performance through Tinybird UI
- Review unused endpoints for potential removal