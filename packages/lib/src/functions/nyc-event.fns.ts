import type { WEB_EVENT_TYPES__NYC } from '@barely/const';
import { isDevelopment } from '@barely/utils';

import type { MetaEvent } from '../integrations/meta/meta.endpts.event';
import type { VisitorInfo } from '../middleware/request-parsing';
import { libEnv } from '../../env';
import { reportEventsToMeta } from '../integrations/meta/meta.endpts.event';
import { ratelimit } from '../integrations/upstash';
import { log } from '../utils/log';

/**
 * Records NYC marketing site events to Meta Pixel via server-side Conversions API.
 *
 * This is a simplified server-side-only event tracking implementation for the NYC marketing site.
 * Unlike other apps, NYC is a single-tenant site with hardcoded Meta Pixel configuration.
 *
 * ## Server-Side Only
 * - All tracking happens server-to-server via Meta Conversions API
 * - No client-side pixel script is used
 * - Requires both META_PIXEL_ID_NYC and META_PIXEL_ACCESS_TOKEN_NYC
 *
 * ## Event Types
 * - `nyc/pageView`: Page view tracking (ViewContent event)
 * - `nyc/contactFormSubmit`: Contact form submission (Lead event)
 * - `nyc/playlistSubmit`: Playlist submission form (Lead event)
 * - `nyc/linkClick`: External link clicks (Contact event)
 *
 * ## Rate Limiting
 * - Development: 1 event per second per IP/type
 * - Production: 1 event per hour per IP/type
 *
 * ## Minimal Implementation
 * - Server-side only (no client-side pixel)
 * - No Tinybird ingestion (Meta Conversions API only)
 * - No workspace usage tracking (single tenant)
 * - Environment-based pixel configuration
 * - Bot traffic filtered
 *
 * @param type - Type of NYC event being recorded
 * @param visitor - Visitor information including IP, fbclid, etc.
 * @param email - Optional email for lead events (will be hashed by Meta SDK)
 * @param phone - Optional phone for lead events (will be hashed by Meta SDK)
 * @param firstName - Optional first name for lead events
 * @param lastName - Optional last name for lead events
 * @param customData - Optional additional data to pass to Meta
 *
 * @example
 * // Recording a page view
 * await recordNYCEvent({
 *   type: 'nyc/pageView',
 *   visitor,
 * });
 *
 * @example
 * // Recording a contact form submission
 * await recordNYCEvent({
 *   type: 'nyc/contactFormSubmit',
 *   visitor,
 *   email: 'user@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   customData: {
 *     content_category: 'contact_form',
 *     service_interest: 'breakout',
 *   },
 * });
 */
export async function recordNYCEvent({
	type,
	visitor,
	email,
	phone,
	firstName,
	lastName,
	customData,
}: {
	type: (typeof WEB_EVENT_TYPES__NYC)[number];
	visitor?: VisitorInfo;
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
	customData?: Record<string, unknown>;
}) {
	// Skip bot traffic
	if (visitor?.isBot) return null;

	// Rate limiting: 1 request per second in dev, 1 per hour in prod
	const rateLimitPeriod = isDevelopment() ? '1 s' : '1 h';

	const { success } = await ratelimit(1, rateLimitPeriod).limit(
		`recordNYCEvent:${visitor?.ip}:${type}`,
	);

	if (!success) {
		await log({
			type: 'alerts',
			location: 'recordNYCEvent',
			message: `rate limit exceeded for ${visitor?.ip} ${type}`,
		});
		return null;
	}

	// Get Meta Pixel ID from environment
	const pixelId = libEnv.META_PIXEL_ID_NYC;

	if (!pixelId) {
		await log({
			type: 'alerts',
			location: 'recordNYCEvent',
			message: 'META_PIXEL_ID_NYC not configured',
		});
		return null;
	}

	// Get Meta events based on NYC event type
	const metaEvents = getMetaEventFromNYCEvent({
		eventType: type,
		customData,
	});

	if (!metaEvents) {
		await log({
			type: 'alerts',
			location: 'recordNYCEvent',
			message: `no meta events generated for ${type}`,
		});
		return null;
	}

	// Source URL for Meta is the page where event occurred
	const sourceUrl = (isDevelopment() ? visitor?.href : visitor?.referer_url) ?? '';

	// Get Meta Pixel access token (required for server-side Conversions API)
	const accessToken = libEnv.META_PIXEL_ACCESS_TOKEN_NYC;

	// Report to Meta via server-side Conversions API
	try {
		await reportEventsToMeta({
			pixelId,
			accessToken,
			sourceUrl,
			ip: visitor?.ip,
			ua: visitor?.userAgent.ua,
			geo: visitor?.geo,
			email,
			phone,
			firstName,
			lastName,
			events: metaEvents,
			fbclid: visitor?.fbclid ?? null,
		});
	} catch (err) {
		await log({
			type: 'errors',
			location: 'recordNYCEvent',
			message: `error reporting NYC event to meta => ${String(err)}`,
		});
		return null;
	}

	return { success: true };
}

function getMetaEventFromNYCEvent({
	eventType,
	customData,
}: {
	eventType: (typeof WEB_EVENT_TYPES__NYC)[number];
	customData?: Record<string, unknown>;
}): MetaEvent[] | null {
	const baseCustomData = {
		content_type: 'nyc_marketing',
		...customData,
	};

	switch (eventType) {
		case 'nyc/pageView':
			return [
				{
					eventName: 'barely.nyc/pageView',
					customData: baseCustomData,
				},
				{
					eventName: 'ViewContent',
					customData: baseCustomData,
				},
			];
		case 'nyc/contactFormSubmit':
			return [
				{
					eventName: 'barely.nyc/contactFormSubmit',
					customData: {
						...baseCustomData,
						content_category: 'contact_form',
					},
				},
				{
					eventName: 'Lead',
					customData: {
						...baseCustomData,
						content_category: 'contact_form',
					},
				},
			];
		case 'nyc/playlistSubmit':
			return [
				{
					eventName: 'barely.nyc/playlistSubmit',
					customData: {
						...baseCustomData,
						content_category: 'playlist_submission',
					},
				},
				{
					eventName: 'Lead',
					customData: {
						...baseCustomData,
						content_category: 'playlist_submission',
					},
				},
			];
		case 'nyc/linkClick':
			return [
				{
					eventName: 'barely.nyc/linkClick',
					customData: {
						...baseCustomData,
						content_category: 'external_link',
					},
				},
				{
					eventName: 'Contact',
					customData: {
						...baseCustomData,
						content_category: 'external_link',
					},
				},
			];
		case 'nyc/ctaClick':
			return [
				{
					eventName: 'barely.nyc/ctaClick',
					customData: {
						...baseCustomData,
						content_category: 'cta_click',
					},
				},
				{
					eventName: 'Lead',
					customData: {
						...baseCustomData,
						content_category: 'cta_click',
					},
				},
			];
		case 'nyc/discoveryCallClick':
			return [
				{
					eventName: 'barely.nyc/discoveryCallClick',
					customData: {
						...baseCustomData,
						content_category: 'discovery_call',
					},
				},
				{
					eventName: 'Schedule',
					customData: {
						...baseCustomData,
						content_category: 'discovery_call',
					},
				},
			];
		default:
			return null;
	}
}
