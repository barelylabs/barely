import type { EventTrackingProps } from '@barely/validators/schemas';
import { newId } from '@barely/utils';

/**
 * Enriches a URL with comprehensive journey tracking parameters for cross-domain analytics.
 *
 * This function is critical for maintaining user journey continuity across different domains
 * in the barely.ai ecosystem (e.g., barely.bio → barelycart.com). Since cookies cannot be
 * shared across domains, all tracking data must be passed via URL parameters.
 *
 * ## Journey ID Format
 * Journey IDs follow the pattern: `{origin}_{timestamp}_{uniqueId}`
 * - origin: Where the journey began (bio, email, cart, etc.)
 * - timestamp: Unix timestamp when journey started
 * - uniqueId: CUID to prevent collisions
 *
 * ## Query Parameters Added
 * - `jid`: Journey ID - master identifier that persists across all domains
 * - `jsrc`: Journey source - last touchpoint (format: `app:handle:key`)
 * - `jstep`: Journey step - increments with each cross-domain navigation
 * - `rid`: Referrer ID - current asset ID for attribution chain
 * - `orid`: Original referrer ID - first asset in the attribution chain
 * - `fid`: Fan ID - persistent user identifier if available
 * - Campaign parameters: fbclid, metaCampaignId, etc.
 *
 * @param href - The destination URL to enrich
 * @param tracking - Current tracking state containing journey and attribution data
 * @param currentApp - The current application (bio, cart, fm, etc.)
 * @param currentHandle - The workspace/artist handle
 * @param currentKey - The asset key (e.g., 'home' for bio pages)
 * @param currentAssetId - The current asset's unique ID for referrer tracking
 *
 * @returns Enriched URL with all necessary tracking parameters
 *
 * @example
 * // Bio link to cart
 * const enrichedUrl = getTrackingEnrichedHref({
 *   href: 'https://barelycart.com/baresky/checkout',
 *   tracking: {
 *     journeyId: 'email_1736954400000_abc123',
 *     journeyStep: '2',
 *     fanId: 'fan_xyz789'
 *   },
 *   currentApp: 'bio',
 *   currentHandle: 'baresky',
 *   currentKey: 'home',
 *   currentAssetId: 'bio_abc123'
 * });
 * // Returns: https://barelycart.com/baresky/checkout?jid=email_1736954400000_abc123&jsrc=bio:baresky:home&jstep=3&rid=bio_abc123&fid=fan_xyz789
 */
export function getTrackingEnrichedHref({
	href,
	tracking,
	currentApp,
	currentHandle,
	currentKey,
	currentAssetId,
}: {
	href: string;
	tracking: EventTrackingProps;
	currentApp?: string;
	currentHandle?: string;
	currentKey?: string;
	currentAssetId?: string;
}): string {
	const url = new URL(href);

	// Determine if this is cross-domain
	const isCrossDomain =
		typeof window !== 'undefined' && !window.location.hostname.includes(url.hostname);

	// Journey ID - create if doesn't exist and we're going cross-domain
	const journeyId =
		tracking.journeyId ??
		(isCrossDomain && currentApp ?
			`${currentApp}_${Date.now()}_${newId('journey')}`
		:	tracking.sessionId);

	if (journeyId) {
		url.searchParams.set('jid', journeyId);
	}

	// Journey source (where they're coming from)
	if (currentApp && currentHandle && currentKey) {
		url.searchParams.set('jsrc', `${currentApp}:${currentHandle}:${currentKey}`);
	}

	// Journey step (increment from current)
	const currentStep = tracking.journeyStep ?? 1;
	url.searchParams.set('jstep', String(isCrossDomain ? currentStep + 1 : currentStep));

	// Referrer chain
	if (currentAssetId) {
		url.searchParams.set('rid', currentAssetId); // Current asset as referrer
	}

	// Original referrer ID (first in chain)
	if (!tracking.originalReferrerId && tracking.journeyStep === 1 && currentAssetId) {
		url.searchParams.set('orid', currentAssetId);
	} else if (tracking.originalReferrerId) {
		url.searchParams.set('orid', tracking.originalReferrerId);
	}

	// Fan ID if exists
	if (tracking.fanId) {
		url.searchParams.set('fid', tracking.fanId);
	}

	// Campaign and attribution parameters
	const campaignParams = [
		'fbclid',
		'metaCampaignId',
		'metaAdSetId',
		'metaAdId',
		'metaPlacementId',
		'emailBroadcastId',
		'emailTemplateId',
		'flowActionId',
		'landingPageId',
	];

	for (const param of campaignParams) {
		const value = tracking[param as keyof EventTrackingProps];
		if (value && typeof value === 'string') {
			url.searchParams.set(param, value);
		}
	}

	// For backward compatibility - still set sid if sessionId exists
	if (tracking.sessionId && !url.searchParams.has('sid')) {
		url.searchParams.set('sid', tracking.sessionId);
	}

	return url.toString();
}
