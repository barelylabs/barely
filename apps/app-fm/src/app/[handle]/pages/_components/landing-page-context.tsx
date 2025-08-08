'use client';

import type { LandingPage } from '@barely/validators';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for landing pages
interface LandingPageData {
	landingPages: LandingPage[];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for landing pages
export const useLandingPageSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for landing pages that properly uses tRPC
export function useLandingPage() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<LandingPage, LandingPageData>(
		{
			resourceName: 'landing-pages',
			getQueryOptions: (handle, filters) => {
				return trpc.landingPage.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: LandingPageData) => lastPage.nextCursor },
				);
			},
			getItemsFromPages: pages => pages.flatMap(page => page.landingPages),
		},
		useLandingPageSearchParams,
	);

	return baseHook();
}
