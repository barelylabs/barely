import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { Events } from './event.sql';

export const VisitorSessions = pgTable(
	'VisitorSessions',
	{
		...primaryId,
		...timestamps,

		browserName: varchar('browserName', { length: 255 }),
		browserVersion: varchar('browserVersion', { length: 255 }),
		cpu: varchar('cpu', { length: 255 }),
		deviceModel: varchar('deviceModel', { length: 255 }),
		deviceType: varchar('deviceType', { length: 255 }),
		deviceVendor: varchar('deviceVendor', { length: 255 }),
		ip: varchar('ip', { length: 255 }),
		isBot: boolean('isBot'),
		osName: varchar('osName', { length: 255 }),
		osVersion: varchar('osVersion', { length: 255 }),
		referrer: varchar('referrer', { length: 255 }),
		ua: varchar('ua', { length: 255 }),
		city: varchar('city', { length: 255 }),
		country: varchar('country', { length: 255 }),
		latitude: varchar('latitude', { length: 255 }),
		longitude: varchar('longitude', { length: 255 }),
		region: varchar('region', { length: 255 }),

		// relations
		externalWebsiteId: dbId('externalWebsiteId'),
	},
	visitorSession => ({
		externalWebsite: index('VisitorSessions_externalWebsite_idx').on(
			visitorSession.externalWebsiteId,
		),
	}),
);

export const VisitorSession_Relations = relations(VisitorSessions, ({ many }) => ({
	// many-to-one
	events: many(Events),
}));
