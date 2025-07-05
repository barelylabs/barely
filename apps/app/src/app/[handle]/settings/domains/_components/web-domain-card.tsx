'use client';

import type { Domain } from '@barely/validators';
import { Suspense } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { punycode } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import { Button } from '@barely/ui/button';
import { Badge } from '@barely/ui/badge';
import { Icon } from '@barely/ui/icon';
import { LoadingSpinner } from '@barely/ui/loading';
import { Skeleton } from '@barely/ui/skeleton';
import { Text } from '@barely/ui/typography';

import { DomainConfiguration } from '~/app/[handle]/settings/domains/_components/web-domain-configuration';
import {
	editDomainAtom,
	showDomainModalAtom,
} from '~/app/[handle]/settings/domains/_components/web-domain-modal';

// import { DomainConfiguration } from '~/app/[handle]/settings/domains/web/_components/web-domain-configuration';
// import {
// 	editDomainAtom,
// 	showDomainModalAtom,
// } from '~/app/[handle]/settings/domains/web/_components/web-domain-modal';

export function DomainCard(props: { domain: Domain }) {
	return (
		<div className='flex flex-col gap-2 rounded-lg border border-border px-5 py-8 sm:px-10'>
			<Suspense fallback={<DomainCardHeaderSkeleton domain={props.domain} />}>
				<DomainCardHeader domain={props.domain} />
			</Suspense>

			<Suspense fallback={<DomainVerificationSkeleton />}>
				<DomainVerificationStatus domain={props.domain} />
			</Suspense>
		</div>
	);
}

function DomainCardHeader({ domain }: { domain: Domain }) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data: domainData } = useSuspenseQuery(
		trpc.webDomain.byDomain.queryOptions({
			handle,
			domain: domain.domain,
		}),
	);

	const setEditDomain = useSetAtom(editDomainAtom);
	const showDomainModal = useSetAtom(showDomainModalAtom);

	// Domain is guaranteed to be defined with useSuspenseQuery
	if (!domainData) return null;

	return (
		<div className='flex flex-col justify-between md:flex-row'>
			<div className='flex flex-row items-center gap-3'>
				<Link
					href={`https://${domainData.domain}`}
					passHref
					className='flex flex-row items-center gap-2'
				>
					<Text variant='2xl/semibold'>{punycode(domain.domain)}</Text>
					<Icon.externalLink className='h-5 w-5' />
				</Link>
				<Badge variant='solid' size='sm' className='flex flex-row gap-2'>
					{domain.type === 'link' ?
						<>
							<Icon.link className='h-3 w-3' />
							{domain.isPrimaryLinkDomain ? 'Primary Link Domain' : 'Link'}
						</>
					:	<Icon.bio className='h-3 w-3' />}
				</Badge>
			</div>

			<div className='flex w-fit flex-row items-center justify-end gap-2'>
				<Button look='outline' size='sm'>
					Refresh
				</Button>
				<Button
					look='outline'
					size='sm'
					onClick={() => {
						setEditDomain(domainData);
						showDomainModal(true);
					}}
				>
					Edit
				</Button>
			</div>
		</div>
	);
}

function DomainVerificationStatus({ domain }: { domain: Domain }) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data: domainVerification, isFetching: fetchingDomainVerification } =
		useSuspenseQuery(
			trpc.webDomain.verifyOnVercel.queryOptions({
				handle,
				domain: domain.domain,
			}),
		);

	// Use the domain prop for verified status instead of fetching again
	const isVerified = domain.verified;

	return (
		<>
			<div className='flex h-10 flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-5 sm:space-y-0'>
				<div className='flex items-center space-x-2'>
					{!isVerified && fetchingDomainVerification ?
						<LoadingSpinner className='h-6 w-6' />
					: isVerified ?
						<Icon.checkCircleFilled className='h-6 w-6 text-blue-500' />
					: domainVerification.status === 'Pending Verification' ?
						<Icon.alertFilled className='h-6 w-6 text-warning' />
					:	<Icon.xCircleFilled className='h-6 w-6 text-destructive' />}

					<p className='text-sm text-muted-foreground'>{domainVerification.status}</p>
				</div>
			</div>
			{domainVerification.status !== 'Valid Configuration' && (
				<DomainConfiguration
					status={domainVerification.status}
					domainResponse={domainVerification.vercelDomainResponse}
					configResponse={domainVerification.vercelConfigResponse}
				/>
			)}
		</>
	);
}

function DomainCardHeaderSkeleton({ domain }: { domain: Domain }) {
	return (
		<div className='flex flex-col justify-between md:flex-row'>
			<div className='flex flex-row items-center gap-3'>
				<div className='flex flex-row items-center gap-2'>
					<Text variant='2xl/semibold'>{punycode(domain.domain)}</Text>
					<Icon.externalLink className='h-5 w-5' />
				</div>
				<Badge variant='solid' size='sm' className='flex flex-row gap-2'>
					{domain.type === 'link' ?
						<>
							<Icon.link className='h-3 w-3' />
							{domain.isPrimaryLinkDomain ? 'Primary Link Domain' : 'Link'}
						</>
					:	<Icon.bio className='h-3 w-3' />}
				</Badge>
			</div>

			<div className='flex w-fit flex-row items-center justify-end gap-2'>
				<Button look='outline' size='sm' disabled>
					Refresh
				</Button>
				<Button look='outline' size='sm' disabled>
					Edit
				</Button>
			</div>
		</div>
	);
}

function DomainVerificationSkeleton() {
	return (
		<div className='flex h-10 flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-5 sm:space-y-0'>
			<div className='flex items-center space-x-2'>
				<Skeleton className='h-6 w-6 rounded-full' />
				<Skeleton className='h-4 w-32' />
			</div>
		</div>
	);
}
