import type { IngestEndpoint } from "./client";
import { webEventIngestSchema } from "../event.tb";
import { webHitTimeseriesPipeDataSchema } from "../stat.schema";
import { tinybird } from "./client";

export const writes = {
  webEvents: {
    name: "web_events",
    description: "Web events",
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
    name: "web_hits_timeseries",
    description: "Web hits timeseries",
    schema: webHitTimeseriesPipeDataSchema,
  },
} as const;

// type TBRead = {
// 	[K in keyof typeof reads]: IngestEndpoint<
// 		Record<string, unknown>,
// 		Record<string, unknown>
// 	>;
// };

// const testPipe = tinybird.buildPipe({
// 	pipe: 'web_hits_timeseries',
// 	parameters: z.object({
// 		start_date: z.string(),
// 		end_date: z.string(),
// 	}),
// 	data: webHitTimeseriesPipeDataSchema,
// });

// const tbRead: TBRead = Object.fromEntries(
// 	Object.entries(reads).map(([key, { name, schema }]) => [
// 		key,
// 		tinybird.buildPipe({
// 			pipe: name,
// 			parameters: webHitTimeseriesPipeParamsSchema,
// 			data: schema,
// 		}),
// 	]),
// ) as TBRead;

export const tb = {
  write: tbWrite,
};
