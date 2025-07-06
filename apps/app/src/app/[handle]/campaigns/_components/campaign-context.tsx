'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { BaseResourceFilters, ResourceSearchParamsReturn } from '@barely/hooks';
import { useRef } from 'react';
import { createResourceDataHook, createResourceSearchParamsHook, useWorkspace } from '@barely/hooks';
import { parseAsStringEnum } from 'nuqs';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for campaigns
interface CampaignPageData {
	campaigns: AppRouterOutputs['campaign']['byWorkspaceId']['campaigns'];
	nextCursor?: Date | null;
}

// Define custom filters interface
interface CampaignFilters extends BaseResourceFilters {
	stage?: 'screening' | 'approved' | 'active';
}

// Define the return type for campaign search params
interface CampaignSearchParamsReturn extends ResourceSearchParamsReturn<CampaignFilters> {
	setStage: (stage: 'screening' | 'approved' | 'active' | undefined) => Promise<URLSearchParams> | undefined;
}

// Create the search params hook for campaigns with custom filters
const _useCampaignSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		stage: parseAsStringEnum(['screening', 'approved', 'active']),
	},
	additionalActions: {
		setStage: setParams => 
			((...args: unknown[]) => {
				const [stage] = args as ['screening' | 'approved' | 'active' | undefined];
				return setParams({ stage });
			}) as (...args: unknown[]) => Promise<URLSearchParams> | undefined,
	},
});

export const useCampaignSearchParams = _useCampaignSearchParams as () => CampaignSearchParamsReturn;

// Create a custom data hook for campaigns that properly uses tRPC
export function useCampaign() {
	const trpc = useTRPC();
	const { workspace } = useWorkspace();
	const { selection, setSelection, filters } = useCampaignSearchParams();
	
	// Fetch data with infinite query
	const {
		data,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.campaign.byWorkspaceId.infiniteQueryOptions(
			{ workspaceId: workspace.id, ...filters },
			{ getNextPageParam: (lastPage: CampaignPageData) => lastPage.nextCursor },
		),
	});
	
	// Extract items from paginated data
	const items = data.pages.flatMap(page => page.campaigns);
	
	// Get last selected item
	const lastSelectedItemId =
		selection === 'all' || !selection.size ?
			undefined
		:	Array.from(selection).pop()?.toString();
	const lastSelectedItem = items.find(item => item.id === lastSelectedItemId);
	
	// UI refs
	const gridListRef = useRef<HTMLDivElement>(null);
	const focusGridList = () => gridListRef.current?.focus();
	
	return {
		items,
		selection,
		lastSelectedItemId,
		lastSelectedItem,
		filters,
		setSelection,
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
		// UI refs
		gridListRef,
		focusGridList,
	};
}

// Export the old context hook name for backward compatibility
export const useCampaignContext = useCampaign;