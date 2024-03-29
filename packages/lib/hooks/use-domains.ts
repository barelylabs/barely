import { useMemo } from 'react';

import { api } from '../server/api/react';
import { BARELY_SHORTLINK_DOMAIN } from '../server/link.constants';

export function useDomains() {
	const { data: domains, error, isLoading } = api.domain.byWorkspace.useQuery();

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
