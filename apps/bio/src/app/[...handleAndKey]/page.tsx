import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getS3ImageUrl } from '@barely/files/utils';
import { parseHandleAndKey } from '@barely/utils';
import {
	bioTrackingSchema,
	eventReportSearchParamsSchema,
} from '@barely/validators/schemas';
import { z } from 'zod/v4';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { fetchBio, fetchBrandKit } from '../../trpc/server';
import { BioBioRender } from './bio-bio-render';

interface BioRouteProps {
	params: Promise<{ handleAndKey: string[] }>;
	searchParams: Promise<z.infer<typeof eventReportSearchParamsSchema>>;
}

export const revalidate = 60; // ISR: revalidate every 60 seconds
// Remove force-static to allow cookie handling for visitor tracking
// export const dynamic = 'force-static';

export default async function BioPage({ params, searchParams }: BioRouteProps) {
	const { handleAndKey } = await params;
	const awaitedSearchParams = await searchParams;

	const { handle, key } = parseHandleAndKey(handleAndKey, 'home');

	if (!handle) {
		return notFound();
	}

	const brandKit = await fetchBrandKit(handle);
	const bio = await fetchBio(handle, key);

	// Get cookies to extract journey and session data
	const cookieStore = await cookies();

	// Extract journey tracking from cookies
	const journeyId =
		awaitedSearchParams.jid ??
		cookieStore.get(`${handle}.${key}.journeyId`)?.value ??
		undefined;
	const journeyOrigin =
		cookieStore.get(`${handle}.${key}.journeyOrigin`)?.value ?? undefined;
	const journeyStepStr = cookieStore.get(`${handle}.${key}.journeyStep`)?.value ?? '1';
	const journeyStep = parseInt(journeyStepStr, 10) || 1; // Default to 1 if parsing fails
	const journeyPathStr = cookieStore.get(`${handle}.${key}.journeyPath`)?.value;
	// const journeyPath =
	// 	journeyPathStr ? z.array(z.string()).parse(JSON.parse(journeyPathStr)) : [];

	const journeyPath: string[] = [];

	// const journeyPath =
	// 	journeyPathStr ? z.array(z.string()).parse(JSON.parse(journeyPathStr)) : [];
	if (journeyPathStr) {
		const parsed = z.array(z.string()).safeParse(JSON.parse(journeyPathStr));
		if (parsed.success) {
			journeyPath.push(...parsed.data);
		}
	}

	const originalReferrerId =
		awaitedSearchParams.orid ??
		cookieStore.get(`${handle}.${key}.originalReferrerId`)?.value ??
		undefined;

	// Session ID now defaults to journey ID if available
	const sessionId =
		journeyId ??
		awaitedSearchParams.sid ??
		awaitedSearchParams.sessionId ??
		cookieStore.get(`${handle}.${key}.bsid`)?.value ??
		undefined;
	const fanId =
		awaitedSearchParams.fid ??
		awaitedSearchParams.fanId ??
		cookieStore.get(`${handle}.${key}.fanId`)?.value ??
		undefined;

	const searchParamsSafe = eventReportSearchParamsSchema.safeParse(awaitedSearchParams);

	// Create properly typed tracking object
	const trackingData = {
		// From search params (excluding journey params that need special handling)
		emailBroadcastId: searchParamsSafe.data?.emailBroadcastId,
		emailTemplateId: searchParamsSafe.data?.emailTemplateId,
		fbclid: searchParamsSafe.data?.fbclid,
		flowActionId: searchParamsSafe.data?.flowActionId,
		landingPageId: searchParamsSafe.data?.landingPageId,
		metaCampaignId: searchParamsSafe.data?.metaCampaignId,
		metaAdSetId: searchParamsSafe.data?.metaAdSetId,
		metaAdId: searchParamsSafe.data?.metaAdId,
		metaPlacementId: searchParamsSafe.data?.metaPlacementId,

		// Core tracking IDs
		refererId: bio.id, // Use bio.id as refererId for attribution chain
		sessionId,
		fanId,

		// Journey tracking - properly typed
		journeyId,
		journeyOrigin,
		journeySource: searchParamsSafe.data?.jsrc,
		journeyStep,
		journeyPath, // This is already a parsed string[]
		originalReferrerId,

		// Current app context for link enrichment
		currentApp: 'bio' as const,
		currentHandle: handle,
		currentKey: key,
		currentAssetId: bio.id,
	};

	// Validate and ensure type safety - use safeParse to avoid blocking rendering
	const trackingResult = bioTrackingSchema.safeParse(trackingData);
	const tracking = trackingResult.success ? trackingResult.data : undefined;

	// Log error for monitoring but don't block rendering
	if (!trackingResult.success) {
		console.error('Bio tracking validation failed:', trackingResult.error);
	}

	prefetch(trpc.bio.blocksByHandleAndKey.queryOptions({ handle, key }));

	return (
		<HydrateClient>
			<BioBioRender bio={bio} brandKit={brandKit} tracking={tracking} />
		</HydrateClient>
	);
}

export async function generateMetadata({ params }: BioRouteProps) {
	try {
		const { handleAndKey } = await params;

		// Parse handle and key from segments
		const handle = handleAndKey[0] ?? '';
		const key = handleAndKey[1] ?? 'home';

		const brandKit = await fetchBrandKit(handle);
		const bio = await fetchBio(handle, key);

		const title = bio.title ?? `${bio.handle} - Bio`;
		const description = bio.description ?? `Links and content from ${bio.handle}`;
		const imageUrl =
			brandKit.avatarS3Key ?
				getS3ImageUrl({ s3Key: brandKit.avatarS3Key, width: 400 })
			:	null;

		return {
			title,
			description,
			...(bio.noindex === true && {
				robots: {
					index: false,
				},
			}),
			openGraph: {
				title,
				description,
				...(imageUrl && {
					images: [
						{
							url: imageUrl,
							width: 400,
							height: 400,
							alt: `${bio.handle} profile picture`,
						},
					],
				}),
			},
			twitter: {
				card: 'summary',
				title,
				description,
				...(imageUrl && {
					images: [imageUrl],
				}),
			},
		};
	} catch {
		return {
			title: 'Bio Page - barely.bio',
			description: 'Link in bio page',
		};
	}
}
