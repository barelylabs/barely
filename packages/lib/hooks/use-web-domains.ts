import { useMemo } from 'react';

import { api } from '../server/api/react';
import { BARELY_SHORTLINK_DOMAIN } from '../server/routes/link/link.constants';

export function useWebDomains() {
	const { data: domains, error, isLoading } = api.webDomain.byWorkspace.useQuery();

	const linkDomains = useMemo(() => {
		const _linkDomains = domains?.filter(d => d.type === 'link') ?? [];
		return [..._linkDomains, BARELY_SHORTLINK_DOMAIN];
	}, [domains]);

	const primaryLinkDomain = useMemo(() => {
		return domains?.find(d => d.isPrimaryLinkDomain) ?? BARELY_SHORTLINK_DOMAIN;
	}, [domains]);

	return {
		domains,
		linkDomains,
		primaryLinkDomain,
		error,
		isLoading,
	};
}
