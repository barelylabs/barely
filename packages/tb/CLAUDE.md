This package has 2 sections:

1. The `tinybird` directory uses the Tinybird CLI to manage the Tinybird project. All datasources, pipes, etc. are managed here. This is the source of truth for our Tinybird project.
2. The `src` directory is a TypeScript library that provides a wrapper around the Tinybird API. It's used to build the Tinybird API endpoints for the Barely app. If updates are made to a datasource, pipe, etc. in the `tinybird` directory, they need to be reflected in the appropriate ingest endpoint or query endpoint in the `src` directory.

---

title: Evolve data sources
meta:
description: Evolve your data sources in Tinybird.

---

# Evolve data sources

After you've deployed your project, you can evolve your data sources. For example, you might need to add a new column, change the data type of a column, or change the sorting key. Tinybird handles the data migration.

## Types of changes

You can evolve your data sources by editing one or more of the following:

- Landing data source schema.
- Landing data source engine settings.
- Materialized data source.

## Landing data source schema

When you make changes to the schema of a landing data source, such as adding or editing columns or changing a data type, you can follow these steps:

1. In Tinybird Local, start a dev session with `tb dev`.
2. Edit the .datasource file to add the changes. See [SCHEMA instructions](/forward/dev-reference/datafiles/datasource-files#schema).
3. Add a [forward query](#forward-query) instruction to tell Tinybird how to migrate your data.
4. Run `tb deploy --check` to validate the deployment before creating it. This is a good way of catching potential breaking changes.
5. Deploy and promote your changes in Tinybird Cloud using `tb --cloud deploy`.

When Tinybird Cloud creates the deployment, it automatically populates the new table following the updated schema.

If a deployment fails, Tinybird automatically discards the staging deployment and maintains the live version.

### Forward query

If you make changes to a .datasource file that are incompatible with the live version, you must use a forward query to transform the data from the live schema to the new one. Otherwise, your deployment fails due to a schema mismatch.

The `FORWARD_QUERY` instruction is a `SELECT` query executed on the live data source. The query must include the column selection part of the query, for example `SELECT a, b, c` or `SELECT * except 'guid', toUUID(guid) AS guid`. The `FROM` and `WHERE` clauses aren't supported.

The following is an example of a forward query that changes the `session_id` column from a `String` to a `UUID` type:

```tb {% title="tinybird/datasources/forward-query.datasource - data source with a FORWARD_QUERY declaration" %}
DESCRIPTION >
    Analytics events landing data source

SCHEMA >
    `timestamp` DateTime `json:$.timestamp`,
    `session_id` UUID `json:$.session_id`,
    `action` String `json:$.action`,
    `version` String `json:$.version`,
    `payload` String `json:$.payload`

ENGINE "MergeTree"
ENGINE_PARTITION_KEY "toYYYYMM(timestamp)"
ENGINE_SORTING_KEY "timestamp"
ENGINE_TTL "timestamp + toIntervalDay(60)"

FORWARD_QUERY >
    SELECT timestamp, CAST(session_id, 'UUID') as session_id, action, version, payload
```

Tinybird runs a backfill to migrate the data to the new schema. These backfills are logged in `datasources_ops_log` with the `event_type` set to `deployment_backfill`.

If the existing data is incompatible with the schema change, the staging deployment fails and is discarded. For example, if you change a data type from `String` to `UUID`, but the existing data contains invalid values like `'abc'`, the deployment fails with this error:

```bash
» tb --cloud deploy
...

✓ Deployment submitted successfully
Deployment failed
* Error on datasource '<datasource_name>': Error migrating data: Populate job <job_id> failed, status: error
Rolling back deployment
Previous deployment is already live
Removing current deployment
Discard process successfully started
Discard process successfully completed
```

If you're willing to accept data loss or default values for incompatible records, you can make the deployment succeed by using the [accurateCastOrDefault](/sql-reference/functions/type-conversion-functions#accuratecastordefaultx-t-default-value) function in your forward query:

```tb
FORWARD_QUERY >
    SELECT timestamp, accurateCastOrDefault(session_id, 'UUID') as session_id, action, version, payload
```

After changes have been deployed and promoted, if you want to deploy other changes that don't affect that data source, you can remove the forward query.

## Landing data source engine settings

When you make changes to the engine settings of a landing data source, such as changing the sorting or partition key, you can follow these steps:

1. In Tinybird Local, start a dev session with `tb dev`.

2. Edit the .datasource file to add the changes. No forward query is required. See [engine settings](/forward/dev-reference/datafiles/datasource-files#engine-settings).

3. Run `tb deploy --check` to validate the deployment before creating it. This is a good way of catching potential breaking changes.

4. Deploy and promote your changes in Tinybird Cloud using `tb --cloud deploy`.

When Tinybird Cloud creates the deployment, it automatically populates the new table following the changes.

## Materialized data sources

When editing materialized data sources, you need to consider the settings of the landing data sources that feed into them, especially the TTL (Time To Live) settings.

[Forward queries](#forward-query) are essential when evolving materialized data sources, both schema and engine settings, to retain historical data.

{% callout type="caution" %}
If your landing data source has a shorter TTL than your materialized data source, you will get a warning when you deploy your changes.
You will need to add a forward query to prevent data loss or, if you accept loss of historical data, add the `--allow-destructive-operations` flag to your deployment command.
{% /callout %}

For example, consider this scenario:

- Landing data source has a 7-day TTL.
- Materialized data source has no TTL (keeps data indefinitely).
- You want to change the data type of a column in the materialized data source.

Without a forward query, recalculating the materialized data source would only process the last 7 days of data due to the landing source's TTL, causing you to lose historical data beyond that period. To retain all historical data, use a forward query to transform the data from the live schema to the new one.

Here's an example materialized data source that uses a forward query to transform the data type of the `visits` column from `AggregateFunction(count, UInt16)` to `AggregateFunction(count, UInt64)`:

```tb
DESCRIPTION >
    Materialized data source for daily page visits aggregation

SCHEMA >
    `date` Date,
    `page_url` String,
    `visits` AggregateFunction(count, UInt64)

ENGINE "AggregatingMergeTree"
ENGINE_PARTITION_KEY "toYYYYMM(date)"
ENGINE_SORTING_KEY "date, page_url"

FORWARD_QUERY >
    SELECT date, page_url, CAST(visits, 'AggregateFunction(count, UInt64)') AS visits

```

Omitting the forward query instruction fully recalculates the materialized data source.

You can omit the forward query when:

- Landing data source has a longer TTL than the materialized data source, or no TTL.
- Making non-backward compatible changes, like adding a new group by column.
- Accepting loss of historical data.
