import type { BioBlockType, WEB_EVENT_TYPES__BIO } from '@barely/const';
import type { Bio, BioLink, Workspace } from '@barely/validators/schemas';
import { WORKSPACE_PLANS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { AnalyticsEndpoints } from '@barely/db/sql/analytics-endpoint.sql';
// Commented out unused imports for MVP - views/clicks columns not yet in schema
// import { BioButtons, Bios } from '@barely/db/sql/bio.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { sqlIncrement } from '@barely/db/utils';
import { ingestBioEvent } from '@barely/tb/ingest';
import { bioEventIngestSchema } from '@barely/tb/schema';
import { isDevelopment, newId } from '@barely/utils';
import { eq } from 'drizzle-orm';

import type { MetaEvent } from '../integrations/meta/meta.endpts.event';
import type { VisitorInfo } from '../middleware/request-parsing';
import { reportEventsToMeta } from '../integrations/meta/meta.endpts.event';
import { ratelimit } from '../integrations/upstash';
import { log } from '../utils/log';
import { flattenVisitorForIngest } from './event.fns';

async function checkIfWorkspaceIsAboveEventUsageLimit({
	workspace,
}: {
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
}) {
	const eventUsageLimit =
		workspace.eventUsageLimitOverride ??
		WORKSPACE_PLANS.get(workspace.plan)?.usageLimits.trackedEventsPerMonth;

	if (!eventUsageLimit) {
		await log({
			type: 'alerts',
			location: 'checkIfWorkspaceIsAboveEventUsageLimit',
			message: `no event usage limit found for workspace ${workspace.id}`,
		});
		return false;
	}

	if (workspace.eventUsage >= eventUsageLimit) {
		return true;
	}

	return false;
}

/**
 * Records bio events to Tinybird with comprehensive journey tracking.
 *
 * This function handles all bio-related events (views, clicks, email captures) and ensures
 * they're properly attributed to the user's journey across domains. The journey context
 * allows us to track conversion funnels from initial touchpoint through final purchase.
 *
 * ## Journey Integration
 * - Uses journeyId as the primary session identifier
 * - Preserves journey origin and path for funnel analysis
 * - Maintains referrer chain for multi-touch attribution
 *
 * ## Event Types
 * - `bio/view`: Initial page load (typically journey step 1 or 2)
 * - `bio/buttonClick`: Link interaction (progresses journey)
 * - `bio/emailCapture`: Lead generation event
 *
 * ## Rate Limiting
 * - Development: 1 event per second per IP/bio/type
 * - Production: 1 event per hour per IP/bio/type
 *
 * @param bio - Bio object containing workspace and identifying information
 * @param type - Type of bio event being recorded
 * @param bioLink - Optional link that was clicked (for buttonClick events)
 * @param visitor - Visitor information including journey tracking data
 * @param workspace - Workspace information for usage limits
 * @param blockId - ID of the block containing the clicked element
 * @param blockType - Type of block (links, cart, contactForm, etc.)
 * @param blockIndex - Position of block on the page
 * @param linkIndex - Position of link within the block
 * @param linkAnimation - Animation style applied to the link
 * @param emailMarketingOptIn - Whether user consented to marketing (for email capture)
 *
 * @example
 * // Recording a bio view with journey context
 * await recordBioEvent({
 *   bio,
 *   type: 'bio/view',
 *   visitor: {
 *     journeyId: 'email_1736954400000_abc',
 *     journeyOrigin: 'email',
 *     journeyStep: '2',
 *     // ... other visitor data
 *   },
 *   workspace
 * });
 *
 * @example
 * // Recording a link click that will navigate to cart
 * await recordBioEvent({
 *   bio,
 *   type: 'bio/buttonClick',
 *   bioLink: clickedLink,
 *   blockId: 'blk_123',
 *   blockType: 'links',
 *   blockIndex: 0,
 *   linkIndex: 2,
 *   visitor,
 *   workspace
 * });
 */
export async function recordBioEvent({
	bio,
	bioLink,
	type,
	visitor,
	workspace,
	blockId,
	blockType,
	blockIndex,
	linkIndex,
	linkAnimation,
	emailMarketingOptIn,
	smsMarketingOptIn,
}: {
	bio: Bio;
	type: (typeof WEB_EVENT_TYPES__BIO)[number];
	bioLink?: BioLink;
	blockId?: string;
	blockType?: BioBlockType;
	blockIndex?: number;
	linkIndex?: number;
	linkAnimation?: 'none' | 'bounce' | 'wobble' | 'jello' | 'pulse' | 'shake' | 'tada';
	emailMarketingOptIn?: boolean;
	smsMarketingOptIn?: boolean;
	visitor?: VisitorInfo;
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
}) {
	if (visitor?.isBot) return null;

	const rateLimitPeriod = isDevelopment() ? '1 s' : '1 h';

	const { success } = await ratelimit(1, rateLimitPeriod).limit(
		`recordBioEvent:${visitor?.ip}:${bio.id}:${type}:${bioLink?.id}`,
	);

	if (!success) {
		await log({
			type: 'alerts',
			location: 'recordBioEvent',
			message: `rate limit exceeded for ${visitor?.ip} ${bio.id} ${type} ${bioLink?.id}`,
		});
		return null;
	}

	// check if the workspace is above the event usage limit.
	const isAboveEventUsageLimit = await checkIfWorkspaceIsAboveEventUsageLimit({
		workspace,
	});

	if (isAboveEventUsageLimit) {
		await log({
			type: 'alerts',
			location: 'recordBioEvent',
			message: `workspace ${bio.workspaceId} is above the event usage limit`,
		});
		return;
	}

	const timestamp = new Date(Date.now()).toISOString();

	const analyticsEndpoints = await dbHttp.query.AnalyticsEndpoints.findMany({
		where: eq(AnalyticsEndpoints.workspaceId, bio.workspaceId),
	});

	const metaPixel = analyticsEndpoints.find(endpoint => endpoint.platform === 'meta');
	const metaEvents = getMetaEventFromBioEvent({
		bio,
		bioLink,
		eventType: type,
	});

	// this is being logged from an api route in preview/production, so the sourceUrl is the referer_url
	const sourceUrl = (isDevelopment() ? visitor?.href : visitor?.referer_url) ?? '';

	const metaRes =
		metaPixel?.accessToken && metaEvents ?
			await reportEventsToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				sourceUrl,
				ip: visitor?.ip,
				ua: visitor?.userAgent.ua,
				geo: visitor?.geo,
				events: metaEvents,
				fbclid: visitor?.fbclid ?? null,
			}).catch(async err => {
				await log({
					type: 'errors',
					location: 'recordBioEvent',
					message: `err reporting bio event to meta => ${err}`,
				});
				return { reported: false };
			})
		:	{ reported: false };

	// report event to tinybird with journey tracking
	try {
		// Extract journey info from visitor
		const journeyId = visitor?.journeyId ?? visitor?.sessionId ?? newId('barelySession');
		const journeyOrigin = visitor?.journeyOrigin ?? journeyId.split('_')[0] ?? 'bio';
		const journeySource = visitor?.journeySource ?? `bio:${bio.handle}:${bio.key}`;
		const journeyStep = visitor?.journeyStep ? parseInt(visitor.journeyStep, 10) : 1;
		const journeyPath = visitor?.journeyPath ?? [`bio:${bio.handle}:${bio.key}`];

		const eventData = bioEventIngestSchema.parse({
			timestamp,
			workspaceId: bio.workspaceId,
			assetId: bio.id,
			...flattenVisitorForIngest(visitor),
			sessionId: journeyId, // Use journey ID as session ID
			type,
			href: sourceUrl,
			linkClickDestinationHref: bioLink?.url ?? null,
			bio_blockId: blockId ?? null,
			bio_blockType: blockType ?? null,
			bio_blockIndex: blockIndex ?? null,
			bio_linkId: bioLink?.id ?? null,
			bio_linkIndex: linkIndex ?? null,
			bio_linkText: bioLink?.text ?? null,
			bio_linkAnimation: linkAnimation ?? null,
			bio_emailMarketingOptIn: emailMarketingOptIn ?? null,
			bio_smsMarketingOptIn: smsMarketingOptIn ?? null,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : undefined,
			// Journey tracking fields (if supported by schema)
			journeyId,
			journeyOrigin,
			journeySource,
			journeyStep,
			journeyPath,
		});

		await ingestBioEvent(eventData);
	} catch (error) {
		await log({
			type: 'errors',
			location: 'recordBioEvent',
			message: `error ingesting bio event => ${String(error)}`,
		});
	}

	// increment usage counts in db - skipping view count for now
	// TODO: Add views column to Bios table if needed for metrics

	// increment button click count - skipping for now
	// TODO: Add clicks column to BioButtons table if needed for metrics

	// increment the workspace event usage count
	await dbHttp
		.update(Workspaces)
		.set({ eventUsage: sqlIncrement(Workspaces.eventUsage) })
		.where(eq(Workspaces.id, bio.workspaceId));

	return;
}

function getMetaEventFromBioEvent({
	bio,
	bioLink,
	eventType,
}: {
	bio: Bio;
	bioLink?: BioLink;
	eventType: (typeof WEB_EVENT_TYPES__BIO)[number];
}): MetaEvent[] | null {
	switch (eventType) {
		case 'bio/view':
			return [
				{
					eventName: 'barely.bio/view',
					customData: {
						content_type: 'bio',
						content_ids: [bio.id],
						content_name: bio.handle,
					},
				},
				{
					eventName: 'PageView',
					customData: {
						content_type: 'bio',
						content_ids: [bio.id],
						content_name: bio.handle,
					},
				},
			];
		case 'bio/buttonClick':
			return bioLink ?
					[
						{
							eventName: 'barely.bio/buttonClick',
							customData: {
								content_type: 'bio_link',
								content_ids: [bioLink.id],
								content_name: bioLink.text,
								content_category: 'link_click',
							},
						},
						{
							eventName: 'ViewContent',
							customData: {
								content_type: 'bio_link',
								content_ids: [bioLink.id],
								content_name: bioLink.text,
								content_category: 'link_click',
							},
						},
					]
				:	null;
		case 'bio/emailCapture':
			return [
				{
					eventName: 'barely.bio/emailCapture',
					customData: {
						content_type: 'bio',
						content_ids: [bio.id],
						content_name: bio.handle,
					},
				},
				{
					eventName: 'Lead',
					customData: {
						content_type: 'bio',
						content_ids: [bio.id],
						content_name: bio.handle,
					},
				},
			];
		default:
			return null;
	}
}
