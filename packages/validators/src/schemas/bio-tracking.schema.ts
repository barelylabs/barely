import { z } from 'zod/v4';

import type { EventTrackingProps } from './event-report.schema';

/**
 * Bio-specific tracking interface that properly handles both string search params
 * and parsed/processed values like journeyPath array
 */
export interface BioTrackingData
	extends Omit<EventTrackingProps, 'journeyPath' | 'journeyStep'> {
	// Journey tracking - processed values
	journeyId?: string;
	journeyOrigin?: string;
	journeySource?: string;
	journeyStep?: number;
	journeyPath?: string[]; // Always an array when processed
	originalReferrerId?: string;

	// Session and fan tracking
	sessionId?: string;
	fanId?: string;
	refererId?: string;

	// Email and marketing attribution
	emailBroadcastId?: string;
	emailTemplateId?: string;

	// Meta/Facebook advertising
	metaCampaignId?: string;
	metaAdSetId?: string;
	metaAdId?: string;
	metaPlacementId?: string;

	// Other tracking
	fbclid?: string;
	flowActionId?: string;
	landingPageId?: string;

	// Bio app-specific context
	currentApp?: string;
	currentHandle?: string;
	currentKey?: string;
	currentAssetId?: string;
}

/**
 * Schema for validating bio tracking data
 */
export const bioTrackingSchema = z.object({
	// Journey tracking
	journeyId: z.string().optional(),
	journeyOrigin: z.string().optional(),
	journeySource: z.string().optional(),
	journeyStep: z.number().optional(),
	journeyPath: z.array(z.string()).optional(),
	originalReferrerId: z.string().optional(),

	// Session and fan tracking
	sessionId: z.string().optional(),
	fanId: z.string().optional(),
	refererId: z.string().optional(),

	// Email and marketing attribution
	emailBroadcastId: z.string().optional(),
	emailTemplateId: z.string().optional(),

	// Meta/Facebook advertising
	metaCampaignId: z.string().optional(),
	metaAdSetId: z.string().optional(),
	metaAdId: z.string().optional(),
	metaPlacementId: z.string().optional(),

	// Other tracking
	fbclid: z.string().optional(),
	flowActionId: z.string().optional(),
	landingPageId: z.string().optional(),

	// Bio app-specific context
	currentApp: z.string().optional(),
	currentHandle: z.string().optional(),
	currentKey: z.string().optional(),
	currentAssetId: z.string().optional(),
}) satisfies z.ZodType<BioTrackingData>;

/**
 * Type guard to check if an object conforms to BioTrackingData
 */
export function isBioTrackingData(obj: unknown): obj is BioTrackingData {
	return bioTrackingSchema.safeParse(obj).success;
}
