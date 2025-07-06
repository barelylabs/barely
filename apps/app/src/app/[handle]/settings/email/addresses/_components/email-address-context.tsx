'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for email addresses
interface EmailAddressPageData {
	emailAddresses: AppRouterOutputs['emailAddress']['byWorkspace']['emailAddresses'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for email addresses
export const useEmailAddressSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for email addresses that properly uses tRPC
export function useEmailAddress() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<AppRouterOutputs['emailAddress']['byWorkspace']['emailAddresses'][0], EmailAddressPageData>(
		{
			resourceName: 'email-addresses',
			getQueryOptions: (handle, filters) =>
				trpc.emailAddress.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: EmailAddressPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.emailAddresses),
		},
		useEmailAddressSearchParams,
	);
	
	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useEmailAddressContext = useEmailAddress;
