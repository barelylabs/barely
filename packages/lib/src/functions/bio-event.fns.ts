import type { WEB_EVENT_TYPES__BIO } from '@barely/const';
import type { Bio, BioButton, Workspace } from '@barely/validators/schemas';
import { WORKSPACE_PLANS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { AnalyticsEndpoints } from '@barely/db/sql/analytics-endpoint.sql';
// Commented out unused imports for MVP - views/clicks columns not yet in schema
// import { BioButtons, Bios } from '@barely/db/sql/bio.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { sqlIncrement } from '@barely/db/utils';
import { ingestWebEvent } from '@barely/tb/ingest';
import { webEventIngestSchema } from '@barely/tb/schema';
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

export async function recordBioEvent({
	bio,
	bioButton,
	type,
	visitor,
	workspace,
	buttonPosition,
}: {
	bio: Bio;
	type: (typeof WEB_EVENT_TYPES__BIO)[number];
	bioButton?: BioButton;
	buttonPosition?: number;
	visitor?: VisitorInfo;
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
}) {
	console.log('recordBioEvent visitor >>', visitor);

	if (visitor?.isBot) return null;

	const rateLimitPeriod = isDevelopment() ? '1 s' : '1 h';

	const { success } = await ratelimit(1, rateLimitPeriod).limit(
		`recordBioEvent:${visitor?.ip}:${bio.id}:${type}:${bioButton?.id}`,
	);

	if (!success) {
		await log({
			type: 'alerts',
			location: 'recordBioEvent',
			message: `rate limit exceeded for ${visitor?.ip} ${bio.id} ${type} ${bioButton?.id}`,
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
		bioButton,
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

	// report event to tinybird
	try {
		const eventData = webEventIngestSchema.parse({
			timestamp,
			workspaceId: bio.workspaceId,
			assetId: bio.id,
			...flattenVisitorForIngest(visitor),
			sessionId: visitor?.sessionId ?? newId('barelySession'),
			type,
			href: sourceUrl,
			linkClickDestinationHref: null, // TODO: implement link URL extraction when relation is available
			buttonPosition: buttonPosition ?? null,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : undefined,
		});

		console.log('bioEventData => ', eventData);
		const tinybirdRes = await ingestWebEvent(eventData);
		console.log('tinybirdRes => ', tinybirdRes);
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
	bioButton,
	eventType,
}: {
	bio: Bio;
	bioButton?: BioButton;
	eventType: (typeof WEB_EVENT_TYPES__BIO)[number];
}): MetaEvent[] | null {
	switch (eventType) {
		case 'bio/view':
			return [
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
			return bioButton ?
					[
						{
							eventName: 'ViewContent',
							customData: {
								content_type: 'bio_button',
								content_ids: [bioButton.id],
								content_name: bioButton.text,
								content_category: 'link_click',
							},
						},
					]
				:	null;
		case 'bio/emailCapture':
			return [
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
