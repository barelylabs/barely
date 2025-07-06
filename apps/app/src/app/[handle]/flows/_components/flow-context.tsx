'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for flows
interface FlowPageData {
	flows: AppRouterOutputs['flow']['byWorkspace']['flows'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for flows
// Note: Flows don't have create/update modals, only archive/delete
export const useFlowSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for flows that properly uses tRPC
export function useFlow() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<AppRouterOutputs['flow']['byWorkspace']['flows'][0], FlowPageData>(
		{
			resourceName: 'flows',
			getQueryOptions: (handle, filters) =>
				trpc.flow.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: FlowPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.flows),
		},
		useFlowSearchParams,
	);
	
	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useFlowContext = useFlow;