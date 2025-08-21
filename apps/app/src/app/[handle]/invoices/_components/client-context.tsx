'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for clients
interface ClientPageData {
	clients: AppRouterOutputs['invoiceClient']['byWorkspace']['clients'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for clients
export const useClientSearchParams = createResourceSearchParamsHook({});

// Create a custom data hook for clients that properly uses tRPC
export function useClient() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['invoiceClient']['byWorkspace']['clients'][0],
		ClientPageData
	>(
		{
			resourceName: 'clients',
			getQueryOptions: (handle, filters) =>
				trpc.invoiceClient.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: ClientPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.clients),
		},
		useClientSearchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useClientContext = useClient;
