# Tinybird Datasources

This directory contains all Tinybird datasource definitions, organized by type.

## Structure

### `/raw`
Raw event sources that receive data directly from applications:
- `barely_events.datasource` - Main event stream for all user interactions
- `barely_streaming_stats.datasource` - Streaming platform statistics
- `email_events.datasource` - Email interaction events

### `/materialized`
Derived datasources created from processing raw events:

#### `/materialized/app-events`
App-specific filtered event views:
- `barely_cart_events_mv.datasource` - E-commerce cart events
- `barely_fm_events_mv.datasource` - Music/FM platform events
- `barely_link_events_mv.datasource` - Link shortener events
- `barely_page_events_mv.datasource` - Landing page events

#### `/materialized/aggregations`
Pre-aggregated data for performance:
- `web_sessions_*.datasource` - Session-level aggregations
- `web_sources_*.datasource` - Traffic source aggregations

## Data Flow
1. Applications send events to raw datasources
2. Materialization pipes process and filter events into app-specific views
3. Endpoint pipes query materialized views for analytics