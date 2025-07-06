'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for email domains
interface EmailDomainPageData {
	domains: AppRouterOutputs['emailDomain']['byWorkspace']['domains'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for email domains
export const useEmailDomainSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for email domains that properly uses tRPC
export function useEmailDomain() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['emailDomain']['byWorkspace']['domains'][0],
		EmailDomainPageData
	>(
		{
			resourceName: 'email-domains',
			getQueryOptions: (handle, filters) =>
				trpc.emailDomain.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: EmailDomainPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.domains),
		},
		useEmailDomainSearchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useEmailDomainContext = useEmailDomain;
