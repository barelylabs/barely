# Track Stats - TODO

## Enhancements Implemented ✅

- [x] Reorganized layout with unified filter bar
- [x] Added persistent stats cards (selected tracks, average, peak, trend)
- [x] Created comparison table for multiple tracks
- [x] Removed redundant titles and improved visual hierarchy
- [x] Replaced toggle with metric indicator badge
- [x] Added track artwork to comparison table
- [x] Fixed React hooks ordering issues
- [x] Proper empty states when no tracks selected

## Future Enhancements

### Enhanced Functionality (Medium Priority)

- [ ] **Chart Tooltips**: Show exact popularity values and dates on hover
- [ ] **Export Feature**: Add CSV/JSON export for stats data
- [ ] **Trend Context**: Show more detailed trend info (e.g., "up 5% from last week")
- [ ] **Date Range Presets**: Quick buttons for "Today", "This Week", "This Month"
- [ ] **Annotations**: Mark significant events on the chart (releases, playlist adds, etc.)

### Track Selector Improvements (Medium Priority)

- [ ] **Show Current Popularity**: Display popularity score in dropdown options
- [ ] **Search in Selector**: Add search/filter within the multiselect
- [ ] **Selection Limit Indicator**: Show "2 of 3 selected" near the selector
- [ ] **Better Deselection UX**: Make it easier to remove individual tracks
- [ ] **Recently Viewed**: Show recently viewed tracks at top of dropdown

### Professional Polish (Low Priority)

- [ ] **Smooth Loading States**: Better skeleton screens during data transitions
- [ ] **Chart Animations**: Animate line drawing and data point transitions
- [ ] **Responsive Design**: Optimize for mobile/tablet views
- [ ] **Keyboard Navigation**: Add hotkeys for common actions
- [ ] **Print-Friendly View**: Optimize layout for printing/PDF export

### Future Metrics

- [ ] **Spotify Streams**: Add stream count tracking when available
- [ ] **Playlist Adds**: Track playlist additions over time
- [ ] **Monthly Listeners**: Show artist-level monthly listener trends
- [ ] **Geographic Data**: Add regional popularity breakdowns

### Technical Improvements

- [ ] **Data Caching**: Implement better caching for frequently viewed tracks
- [ ] **Real-time Updates**: Auto-refresh data when new stats are available
- [ ] **Error Boundaries**: Add graceful error handling for API failures
- [ ] **Performance**: Optimize chart rendering for large date ranges

## Notes

- The metric toggle has been simplified to a badge for now, but the infrastructure is ready to support multiple metrics when we add streams, playlist data, etc.
- The comparison table only shows when tracks are selected (not for empty state)
- Maximum 3 tracks can be compared at once (enforced by the multiselect)
