import type { z } from 'zod/v4';

import { tinybird } from '../index';
import {
	cartEventIngestSchema,
	emailEventIngestSchema,
	fmEventIngestSchema,
	pageEventIngestSchema,
	webEventIngestSchema,
} from '../schema/event.schema';

// schema

// publish web events

export const ingestWebEvent = tinybird.buildIngestEndpoint<
	z.output<typeof webEventIngestSchema>,
	z.input<typeof webEventIngestSchema>
>({
	datasource: 'barely_events',
	event: webEventIngestSchema,
});

export const ingestCartEvent = tinybird.buildIngestEndpoint<
	z.output<typeof cartEventIngestSchema>,
	z.input<typeof cartEventIngestSchema>
>({
	datasource: 'barely_events',
	event: cartEventIngestSchema,
});

export const ingestFmEvent = tinybird.buildIngestEndpoint<
	z.output<typeof fmEventIngestSchema>,
	z.input<typeof fmEventIngestSchema>
>({
	datasource: 'barely_events',
	event: fmEventIngestSchema,
});

/* page */

export const ingestPageEvent = tinybird.buildIngestEndpoint<
	z.output<typeof pageEventIngestSchema>,
	z.input<typeof pageEventIngestSchema>
>({
	datasource: 'barely_events',
	event: pageEventIngestSchema,
});

// publish email events

export const ingestEmailEvent = tinybird.buildIngestEndpoint<
	z.output<typeof emailEventIngestSchema>,
	z.input<typeof emailEventIngestSchema>
>({
	datasource: 'email_events',
	event: emailEventIngestSchema,
});
