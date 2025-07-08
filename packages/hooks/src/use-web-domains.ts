'use client';

import { useMemo } from 'react';
import { BARELY_SHORTLINK_DOMAIN } from '@barely/const';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

export function useWebDomains() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { data: domains, error } = useSuspenseQuery(
		trpc.webDomain.byWorkspace.queryOptions({ handle: handle }),
	);

	const linkDomains = useMemo(() => {
		const _linkDomains = domains.filter(d => d.type === 'link');
		return [..._linkDomains, BARELY_SHORTLINK_DOMAIN];
	}, [domains]);

	const primaryLinkDomain = useMemo(() => {
		return domains.find(d => d.isPrimaryLinkDomain) ?? BARELY_SHORTLINK_DOMAIN;
	}, [domains]);

	return {
		domains,
		linkDomains,
		primaryLinkDomain,
		error,
	};
}
