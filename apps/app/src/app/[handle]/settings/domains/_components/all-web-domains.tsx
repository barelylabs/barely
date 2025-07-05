'use client';

import { useWorkspace } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';

import { AddDomainButton } from '~/app/[handle]/settings/domains/_components/add-web-domain-button';
import { DomainCard } from '~/app/[handle]/settings/domains/_components/web-domain-card';

export function AllDomains() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { data: domains } = useSuspenseQuery(
		trpc.webDomain.byWorkspace.queryOptions({ handle }),
	);

	if (!domains.length)
		return (
			<NoResultsPlaceholder
				icon='domain'
				title='No domains found.'
				subtitle='Add a new domain to get started.'
				button={<AddDomainButton />}
			/>
		);

	return (
		<ul className='grid grid-cols-1 gap-3'>
			{domains.map((domain, index) => (
				<li key={domain.domain}>
					<DomainCard key={index} domain={domain} />
				</li>
			))}
		</ul>
	);
}
