'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for email templates
interface EmailTemplatePageData {
	emailTemplates: AppRouterOutputs['emailTemplate']['byWorkspace']['emailTemplates'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for email templates
export const useEmailTemplateSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for email templates that properly uses tRPC
export function useEmailTemplate() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['emailTemplate']['byWorkspace']['emailTemplates'][0],
		EmailTemplatePageData
	>(
		{
			resourceName: 'email-templates',
			getQueryOptions: (handle, filters) =>
				trpc.emailTemplate.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: EmailTemplatePageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.emailTemplates),
		},
		useEmailTemplateSearchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useEmailTemplateContext = useEmailTemplate;
