'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import {
	action,
	createResourceDataHook,
	createResourceSearchParamsHook,
} from '@barely/hooks';
import { parseAsStringEnum } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for campaigns
interface CampaignPageData {
	campaigns: AppRouterOutputs['campaign']['byHandle']['campaigns'];
	nextCursor?: Date | null;
}

// Create the search params hook for campaigns with custom filters
export const useCampaignSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		stage: parseAsStringEnum(['screening', 'approved', 'active']),
	},
	additionalActions: {
		setStage: action(
			(setParams, stage: 'screening' | 'approved' | 'active' | undefined) =>
				setParams({ stage }),
		),
	},
});

// Create a custom data hook for campaigns that properly uses tRPC
export function useCampaign() {
	const trpc = useTRPC();
	const searchParams = useCampaignSearchParams();

	const baseHook = createResourceDataHook<
		AppRouterOutputs['campaign']['byHandle']['campaigns'][0],
		CampaignPageData
	>(
		{
			resourceName: 'campaigns',
			getQueryOptions: (handle, filters) =>
				trpc.campaign.byHandle.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: CampaignPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.campaigns),
		},
		() => searchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useCampaignContext = useCampaign;
