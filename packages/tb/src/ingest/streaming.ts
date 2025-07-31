import type { z } from 'zod/v4';

import { tinybird } from '../index';
import {
	albumStreamingStatSchema,
	artistStreamingStatSchema,
	streamingStatSchema,
	trackStreamingStatSchema,
} from '../schema/streaming-ingest.schema';

// Ingest endpoint for all streaming stats (discriminated union)
export const ingestStreamingStat = tinybird.buildIngestEndpoint<
	z.output<typeof streamingStatSchema>,
	z.input<typeof streamingStatSchema>
>({
	datasource: 'barely_streaming_stats',
	event: streamingStatSchema,
});

// Specific endpoints for each stat type
export const ingestArtistStreamingStat = tinybird.buildIngestEndpoint<
	z.output<typeof artistStreamingStatSchema>,
	z.input<typeof artistStreamingStatSchema>
>({
	datasource: 'barely_streaming_stats',
	event: artistStreamingStatSchema,
});

export const ingestTrackStreamingStat = tinybird.buildIngestEndpoint<
	z.output<typeof trackStreamingStatSchema>,
	z.input<typeof trackStreamingStatSchema>
>({
	datasource: 'barely_streaming_stats',
	event: trackStreamingStatSchema,
});

export const ingestAlbumStreamingStat = tinybird.buildIngestEndpoint<
	z.output<typeof albumStreamingStatSchema>,
	z.input<typeof albumStreamingStatSchema>
>({
	datasource: 'barely_streaming_stats',
	event: albumStreamingStatSchema,
});
