# Track Spotify Stats Visualization

## Overview
Implement timeseries data visualization for track Spotify popularity scores, following the pattern established by FM stats.

## Status
- **Branch**: `feature/spotify-popularity-v2`
- **Created**: 2025-01-29
- **Status**: Planning Complete ✅

## Objectives
- [ ] Display track popularity trends over time
- [ ] Support month, week, and day granularity
- [ ] Enable timezone-aware data visualization
- [ ] Provide interactive chart with metric toggles
- [ ] Follow existing FM stats patterns for consistency

## Technical Architecture

### URL Structure
- Route: `/[handle]/tracks/[trackId]/stats`
- Query params: `dateRange`, `start`, `end`, `granularity`, `timezone`, `compareVersions`

### Data Flow
1. **Tinybird** → `spotify_track_timeseries` pipe
2. **TRPC** → `stat.spotifyTrackTimeseries` procedure
3. **React Query** → Cached data fetching
4. **Tremor Charts** → Data visualization

## Implementation Tasks

### 1. Schema & Validation ⏳
- [ ] Create `trackStatFiltersSchema` in `packages/lib/src/trpc/routes/track-stat.schema.ts`
- [ ] Extend base stat schemas with track-specific filters
- [ ] Add validation for multiple Spotify ID comparison

### 2. TRPC Route ⏳
- [ ] Add `spotifyTrackTimeseries` to stat router
- [ ] Implement workspace-scoped procedure
- [ ] Handle multiple Spotify IDs for track versions
- [ ] Connect to Tinybird pipe functions

### 3. React Hook ⏳
- [ ] Create `useTrackStatFilters` hook
- [ ] Implement filter state management
- [ ] Add date formatting helpers
- [ ] Support URL state persistence

### 4. Page Component ⏳
- [ ] Create page at `/app/[handle]/tracks/[trackId]/stats/page.tsx`
- [ ] Implement server-side data prefetching
- [ ] Add loading and error boundaries
- [ ] Set up component hierarchy

### 5. Chart Components ⏳
- [ ] Create `TrackStatHeader` for date controls
- [ ] Build `TrackTimeseries` chart component
- [ ] Add metric toggle buttons
- [ ] Implement responsive design

### 6. UI Components ⏳
- [ ] Date range selector (reuse existing)
- [ ] Granularity toggle (month/week/day)
- [ ] Metric cards for key stats
- [ ] Export data button

### 7. Integration ⏳
- [ ] Add stats link to tracks table
- [ ] Update track detail pages
- [ ] Add to navigation menu
- [ ] Mobile responsive adjustments

## Component Structure

```
/[handle]/tracks/[trackId]/stats/
├── page.tsx                    # Server component with prefetching
├── track-stat-header.tsx       # Client component for controls
├── track-timeseries.tsx        # Main chart component
├── track-version-comparison.tsx # Optional comparison view
└── metric-card.tsx            # Reusable stat display
```

## Data Schema

### Input Filters
```typescript
{
  dateRange?: '1d' | '1w' | '28d' | '1y',
  start?: Date,
  end?: Date,
  granularity?: 'month' | 'week' | 'day',
  timezone?: 'America/New_York' | 'America/Los_Angeles',
  compareVersions?: boolean
}
```

### Chart Data
```typescript
{
  timestamp: Date,
  spotifyPopularity: number,
  spotifyListeners?: number,
  spotifyStreams?: number,
  spotifyId?: string // When comparing versions
}
```

## UI/UX Considerations

### Desktop Layout
```
┌─────────────────────────────────────┐
│ Track Name - Spotify Stats          │
├─────────────────────────────────────┤
│ [Date Range] [Granularity] [Export] │
├─────────────────────────────────────┤
│                                     │
│         [Area Chart]                │
│                                     │
├─────────────────────────────────────┤
│ Current: 72 | Peak: 85 | Avg: 68   │
└─────────────────────────────────────┘
```

### Mobile Layout
- Stack controls vertically
- Scrollable chart with zoom
- Collapsible metric cards

## Testing Requirements

### Unit Tests
- [ ] Filter schema validation
- [ ] Date range calculations
- [ ] Data transformation logic

### Integration Tests
- [ ] TRPC route with mock data
- [ ] Chart rendering
- [ ] Filter state management

### E2E Tests
- [ ] Navigation to stats page
- [ ] Filter interactions
- [ ] Data export functionality

## Performance Considerations

1. **Data Aggregation**
   - Limit data points for large date ranges
   - Use appropriate granularity defaults
   - Cache Tinybird responses

2. **Client Optimization**
   - Lazy load chart library
   - Debounce filter changes
   - Virtualize long data lists

3. **Server Optimization**
   - Prefetch common date ranges
   - Use React Suspense
   - Implement proper caching headers

## Future Enhancements

1. **Phase 2**
   - Album popularity trends
   - Artist-level aggregations
   - Playlist performance tracking

2. **Phase 3**
   - Predictive trend analysis
   - Anomaly detection
   - Competitor comparison

3. **Phase 4**
   - Real-time updates
   - Custom alerts
   - API webhooks

## Dependencies

### External Libraries
- `@tremor/react` - Chart components
- `date-fns` - Date manipulation
- `zod` - Schema validation

### Internal Packages
- `@barely/lib` - TRPC routes
- `@barely/tb` - Tinybird queries
- `@barely/ui` - Shared components

## Success Metrics

1. **User Engagement**
   - Track stats page views
   - Average session duration
   - Filter interaction rate

2. **Performance**
   - Page load time < 2s
   - Chart render time < 500ms
   - Zero runtime errors

3. **Business Value**
   - Improved artist insights
   - Data-driven decisions
   - Increased platform stickiness

## Notes

- Follow existing FM stats patterns for consistency
- Ensure mobile-first responsive design
- Consider accessibility (ARIA labels, keyboard nav)
- Document any deviations from patterns

## References

- [FM Stats Implementation](/apps/app/src/app/[handle]/fm/stats/)
- [Tinybird Pipes](/packages/tb/tinybird/endpoints/)
- [Tremor Charts Docs](https://www.tremor.so/docs/components/chart/area-chart)