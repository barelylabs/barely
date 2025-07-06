'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for email broadcasts
interface EmailBroadcastPageData {
	emailBroadcasts: AppRouterOutputs['emailBroadcast']['byWorkspace']['emailBroadcasts'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for email broadcasts
export const useEmailBroadcastSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for email broadcasts that properly uses tRPC
export function useEmailBroadcast() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<AppRouterOutputs['emailBroadcast']['byWorkspace']['emailBroadcasts'][0], EmailBroadcastPageData>(
		{
			resourceName: 'email-broadcasts',
			getQueryOptions: (handle, filters) =>
				trpc.emailBroadcast.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: EmailBroadcastPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.emailBroadcasts),
		},
		useEmailBroadcastSearchParams,
	);
	
	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useEmailBroadcastsContext = useEmailBroadcast;
