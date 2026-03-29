'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { EmailAddressSync } from './email-addresses.collection';
import type { EmailDomainSync } from './email-domains.collection';
import { useEmailAddressesCollection } from './email-addresses.collection';
import { useEmailDomainsCollection } from './email-domains.collection';

/**
 * Email address with its domain info for the join
 */
export type EmailAddressWithDomain = EmailAddressSync & {
	domain: EmailDomainSync | null;
};

interface UseEmailAddressesLiveQueryOptions {
	showArchived?: boolean;
}

interface UseEmailAddressesLiveQueryResult {
	data: EmailAddressWithDomain[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query EmailAddresses with their domains using TanStack DB live queries.
 * Handles SSR, collection readiness, and client-side joins EmailAddresses with EmailDomains.
 */
export function useEmailAddressesLiveQuery(
	options: UseEmailAddressesLiveQueryOptions = {},
): UseEmailAddressesLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collections
	const addressesCollection = useEmailAddressesCollection();
	const domainsCollection = useEmailDomainsCollection();

	// Determine if we can query
	const hasValidCollections = !!addressesCollection && !!domainsCollection;
	const shouldQuery = isClient && hasValidCollections;

	// Query EmailAddresses using the query builder syntax
	const addressesQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ addresses: addressesCollection });
		},
		[shouldQuery, addressesCollection],
	);

	// Query EmailDomains using the query builder syntax
	const domainsQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ domains: domainsCollection });
		},
		[shouldQuery, domainsCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[EmailAddresses Live Query] State:', {
			isClient,
			hasValidCollections,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			addressesStatus: addressesQueryResult.status,
			addressesDataLength: addressesQueryResult.data?.length ?? 0,
			domainsStatus: domainsQueryResult.status,
			domainsDataLength: domainsQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollections,
		shouldQuery,
		workspace.id,
		showArchived,
		addressesQueryResult.status,
		addressesQueryResult.data?.length,
		domainsQueryResult.status,
		domainsQueryResult.data?.length,
	]);

	// Join EmailAddresses with EmailDomains client-side
	const data = useMemo(() => {
		if (!addressesQueryResult.data) return undefined;

		const addresses = addressesQueryResult.data as EmailAddressSync[];
		const domains = (domainsQueryResult.data as EmailDomainSync[] | undefined) ?? [];

		// Create a map of domains by ID for fast lookup
		const domainsById = new Map(domains.map(domain => [domain.id, domain]));

		// Filter and join
		return addresses
			.filter(address => {
				// Filter by workspace
				if (address.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && address.archived_at !== null) return false;

				return true;
			})
			.map(address => ({
				...address,
				domain: domainsById.get(address.domainId) ?? null,
			}))
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [addressesQueryResult.data, domainsQueryResult.data, workspace.id, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading =
		addressesQueryResult.status === 'loading' || domainsQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}
