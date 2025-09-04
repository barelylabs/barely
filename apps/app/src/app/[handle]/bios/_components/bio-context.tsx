'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for bio pages
interface BioPageData {
	bios: AppRouterOutputs['bio']['byWorkspace']['bios'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for bio pages
export const useBiosSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for bio pages that properly uses tRPC
export function useBios() {
	const trpc = useTRPC();
	const searchParams = useBiosSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['bio']['byWorkspace']['bios'][0],
		BioPageData
	>(
		{
			resourceName: 'bio-pages',
			getQueryOptions: (handle, filters) =>
				trpc.bio.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: BioPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.bios),
		},
		() => searchParams,
	);

	const dataHookResult = baseHook();

	// Merge search params and data hook results
	return {
		...dataHookResult,
		...searchParams,
	};
}
