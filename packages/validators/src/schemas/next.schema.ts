import type { NextFormattedUserAgent, NextGeo } from '@barely/db/schema';
import {
	formattedUserAgentSchema,
	nextGeoSchema,
	nextUserAgentToFormattedSchema,
} from '@barely/db/schema';

export type { NextFormattedUserAgent, NextGeo };
export { nextUserAgentToFormattedSchema, formattedUserAgentSchema, nextGeoSchema };
