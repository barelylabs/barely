import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@barely/db';
import { meta } from '@barely/meta';
import { EventReport } from '@prisma/client/edge';

import { handleUndefined } from '@barely/utils/edge';
import { linkAnalyticsSchema } from '@barely/schema/analytics/link';

const analytics = async (req: NextApiRequest, res: NextApiResponse) => {
	const {
		linkId,
		artistId,
		url,
		// visitor info
		ip,
		browserName,
		browserVersion,
		cpu,
		deviceModel,
		deviceType,
		deviceVendor,
		isBot,
		osName,
		osVersion,
		referrer,
		ua,
		...geo
	} = linkAnalyticsSchema.parse(req.body);

	//* ⏲ create session *//
	const visitorSession = await prisma.visitorSession.create({
		data: {
			ip,
			browserName,
			browserVersion,
			cpu,
			deviceModel,
			deviceType,
			deviceVendor,
			isBot,
			osName,
			osVersion,
			referrer,
			ua,
			...geo,
		},
	});

	//* 📈 create event *//
	const event = await prisma.event.create({
		data: {
			type: 'pageView',
			session: { connect: { id: visitorSession.id } },
			link: {
				connect: { id: linkId },
			},
		},
	});

	//* 📊 report event to analytics *//
	const artist = await prisma.artist.findFirst({
		where: { id: artistId },
		select: { analytics: { select: { analyticsEndpoint: true } } },
	});
	const analyticsEndpoints = artist ? artist.analytics.map(a => a.analyticsEndpoint) : [];
	if (!analyticsEndpoints.length) return;

	const eventReports: Omit<EventReport, 'createdAt'>[] = [];

	// report events to all analytics endpoints
	await Promise.all(
		analyticsEndpoints.map(async ({ id, platform, accessToken }) => {
			switch (platform) {
				case /*👾*/ 'meta':
					if (!accessToken) break;
					const metaReport = await meta.event.report({
						pixelId: id,
						accessToken,
						eventName: 'PageView',
						url,
						ip,
						geo,
						ua,
					});

					eventReports.push({
						eventId: event.id,
						analyticsId: id,
						analyticsPlatform: platform,
						error: handleUndefined.toNull(metaReport.error),
					});

				case /*🇨🇳*/ 'tiktok':
					/*feature*/
					break;

				case /*📈*/ 'google':
					/*feature*/
					break;

				case /*👻*/ 'snapchat':
					/*feature*/
					break;
				default:
					break;
			}
		}),
	);

	// record all completed event reports to db
	await Promise.all(
		eventReports.map(async r => {
			await prisma.eventReport.create({
				data: {
					event: {
						connect: { id: r.eventId },
					},
					analyticsEndpoint: {
						connect: {
							platform_id: { platform: r.analyticsPlatform, id: r.analyticsId },
						},
					},
					error: r.error,
				},
			});
		}),
	);

	return res.status(200).json({ eventReports });
};

export default analytics;
