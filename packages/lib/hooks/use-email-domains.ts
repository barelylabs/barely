import { api } from '../server/api/react';

export function useEmailDomains() {
	const { data: domains, error, isLoading } = api.emailDomain.byWorkspace.useQuery();

	return {
		domains,
		error,
		isLoading,
	};
}
