'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for email template groups
interface EmailTemplateGroupPageData {
	emailTemplateGroups: AppRouterOutputs['emailTemplateGroup']['byWorkspace']['emailTemplateGroups'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for email template groups
export const useEmailTemplateGroupSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for email template groups that properly uses tRPC
export function useEmailTemplateGroup() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<AppRouterOutputs['emailTemplateGroup']['byWorkspace']['emailTemplateGroups'][0], EmailTemplateGroupPageData>(
		{
			resourceName: 'email-template-groups',
			getQueryOptions: (handle, filters) =>
				trpc.emailTemplateGroup.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: EmailTemplateGroupPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.emailTemplateGroups),
		},
		useEmailTemplateGroupSearchParams,
	);
	
	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useEmailTemplateGroupContext = useEmailTemplateGroup;
