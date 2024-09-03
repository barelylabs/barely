import { api } from '../server/api/react';
import { useWorkspace } from './use-workspace';

export function useEmailDomains() {
	const { handle } = useWorkspace();
	const {
		data: infiniteDomainsFirstPage,
		error,
		isLoading,
	} = api.emailDomain.byWorkspace.useQuery({ handle });

	const domains = infiniteDomainsFirstPage?.domains ?? [];

	return {
		domains,
		error,
		isLoading,
	};
}
