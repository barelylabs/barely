# Materialized Views in Tinybird

This document explains how materialized views work in Tinybird and best practices for managing them in a version-controlled environment.

## What are Materialized Views?

Materialized Views (MVs) in Tinybird are special datasources that:

- Pre-compute and store results from a transformation pipe
- Update automatically as new data arrives
- Provide fast query performance for aggregated data
- Reduce query costs by avoiding repeated calculations

## Materialized Views in Our Project

We use materialized views for pre-aggregating event data:

```
datasources/
├── raw/
│   └── events.datasource          # Raw events (landing datasource)
└── materialized/
    └── events_by_hour_mv.datasource  # Hourly aggregations
```

## Creating Materialized Views

### 1. Define the Transformation Pipe

```sql
-- pipes/transform/events_hourly.pipe
NODE events_hourly
SQL >
    SELECT
        toStartOfHour(timestamp) as hour,
        workspaceId,
        COUNT(*) as event_count,
        COUNT(DISTINCT sessionId) as unique_sessions
    FROM events
    WHERE timestamp >= now() - INTERVAL 7 DAY
    GROUP BY hour, workspaceId

TYPE materialized
DATASOURCE events_by_hour_mv
```

### 2. Define the Materialized View Datasource

```sql
-- datasources/materialized/events_by_hour_mv.datasource
SCHEMA >
    hour DateTime,
    workspaceId String,
    event_count UInt64,
    unique_sessions UInt64

ENGINE "AggregatingMergeTree"
ENGINE_PARTITION_KEY "toYYYYMM(hour)"
ENGINE_SORTING_KEY "hour, workspaceId"
```

## Deployment Considerations

### Initial Deployment

1. Deploy the source datasource first
2. Deploy the transformation pipe
3. The MV will start populating automatically

```bash
# Deploy in order
tb push datasources/raw/events.datasource
tb push pipes/transform/events_hourly.pipe
```

### Schema Changes

**⚠️ CAUTION**: Changing schemas requires careful coordination

#### Safe Changes

- Adding new columns with defaults
- Changing column comments
- Modifying TTL settings

#### Dangerous Changes

- Removing columns
- Changing column types
- Modifying sorting keys

#### How to Handle Schema Changes

1. **For Minor Changes** (new columns):

```bash
# Update the pipe and datasource
git commit -am "Add new column to MV"
# Deploy will handle it automatically
```

2. **For Breaking Changes**:

```bash
# 1. Stop materialization in UI
# 2. Create new MV with new schema
tb push datasources/materialized/events_by_hour_v2_mv.datasource
tb push pipes/transform/events_hourly_v2.pipe

# 3. Migrate queries to use new MV
# 4. Delete old MV after verification
```

## Refresh Strategies

### Continuous Refresh (Default)

- New data is processed as it arrives
- Best for real-time requirements
- Higher resource usage

### Scheduled Refresh

- Process data at specific intervals
- Better for cost optimization
- Suitable for historical data

### Manual Refresh

- Triggered on-demand
- Useful for debugging
- Good for one-time historical fills

## Best Practices

### 1. Naming Conventions

- Use `_mv` suffix for materialized view datasources
- Group in `datasources/materialized/` directory
- Match pipe name to MV name

### 2. Data Retention

```sql
-- Set TTL to manage storage
ENGINE_TTL "hour + INTERVAL 90 DAY"
```

### 3. Monitoring

- Check materialization lag in UI
- Monitor storage usage
- Set up alerts for failures

### 4. Testing Changes

```bash
# Test in a branch first
tb branch create test_mv_changes
tb branch use test_mv_changes

# Deploy and verify
tb push --force

# Check in UI before merging
```

## Troubleshooting

### MV Not Updating

1. Check source datasource for new data
2. Verify pipe has no errors
3. Check materialization status in UI
4. Look for resource limits

### Historical Data Missing

MVs only process data from creation time forward. To backfill:

```sql
-- Create a backfill pipe
NODE backfill
SQL >
    SELECT * FROM events
    WHERE timestamp < now() - INTERVAL 7 DAY

TYPE copy
TARGET_DATASOURCE events_by_hour_mv
```

### Performance Issues

1. Check sorting keys match query patterns
2. Verify partition strategy
3. Consider multiple MVs for different access patterns
4. Monitor materialization lag

## CI/CD Considerations

### Deployment Order

Always deploy in dependency order:

1. Source datasources
2. Transformation pipes
3. Materialized view datasources
4. Pipes that query MVs

### Validation

```bash
# Add to CI pipeline
tb push --dry-run

# Check MV definitions
tb pipe show <transformation_pipe>
tb datasource show <mv_datasource>
```

### Rollback Strategy

See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md#materialized-view-rollback) for MV-specific rollback procedures.

## Common Patterns

### Time-based Aggregations

```sql
-- Hourly, daily, monthly rollups
toStartOfHour(timestamp) as hour
toStartOfDay(timestamp) as day
toStartOfMonth(timestamp) as month
```

### Deduplication

```sql
-- Use ReplacingMergeTree for dedup
ENGINE "ReplacingMergeTree"
ENGINE_VER "updated_at"
```

### Counter Aggregations

```sql
-- Use SummingMergeTree for counters
ENGINE "SummingMergeTree"
ENGINE_SUMMING_COLS "views, clicks"
```

## Costs and Optimization

1. **Storage**: MVs consume additional storage
2. **Compute**: Processing happens during materialization
3. **Query**: Queries on MVs are typically much cheaper

### Optimization Tips

- Aggregate as much as possible in MVs
- Use appropriate TTLs
- Partition by time for easy cleanup
- Create multiple MVs for different query patterns

## References

- [Tinybird Materialized Views Docs](https://www.tinybird.co/docs/concepts/materialized-views)
- [ClickHouse Table Engines](https://clickhouse.com/docs/en/engines/table-engines/)
- [Our Data Model](./DATA_FLOW.md)
