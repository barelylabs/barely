import type { IngestEndpoint } from './client';
import { webEventIngestSchema } from '../routes/event/event.tb';
import { webHitTimeseriesPipeDataSchema } from '../routes/stat/stat.schema';
import { tinybird } from './client';

export const writes = {
	webEvents: {
		name: 'barely_events',
		description: 'Barely events',
		schema: webEventIngestSchema,
	},
} as const;

type TBWrite = {
	[K in keyof typeof writes]: IngestEndpoint<
		Record<string, unknown>,
		Record<string, unknown>
	>;
};

const tbWrite: TBWrite = Object.fromEntries(
	Object.entries(writes).map(([key, { name, schema }]) => [
		key,
		tinybird.buildIngestEndpoint({ datasource: name, event: schema }),
	]),
) as TBWrite;

export const reads = {
	webHitsTimeseries: {
		name: 'web_hits_timeseries',
		description: 'Web hits timeseries',
		schema: webHitTimeseriesPipeDataSchema,
	},
} as const;

export const tb = {
	write: tbWrite,
};
