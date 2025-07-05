'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

export function useEmailDomains() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const {
		data: infiniteDomainsFirstPage,
		error,
		isLoading,
	} = useSuspenseQuery(trpc.emailDomain.byWorkspace.queryOptions({ handle }));

	const domains = infiniteDomainsFirstPage.domains;

	return {
		domains,
		error,
		isLoading,
	};
}
