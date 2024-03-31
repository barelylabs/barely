'use client';

import type { Domain } from '@barely/lib/server/routes/domain/domain.schema';
import Link from 'next/link';
import { api } from '@barely/lib/server/api/react';
import { useSetAtom } from 'jotai';

import { Badge } from '@barely/ui/elements/badge';
import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { LoadingSpinner } from '@barely/ui/elements/loading';
import { Text } from '@barely/ui/elements/typography';

import { punycode } from '@barely/utils/punycode';

import { DomainConfiguration } from '~/app/[handle]/settings/domains/domain-configuration';
import {
	editDomainAtom,
	showDomainModalAtom,
} from '~/app/[handle]/settings/domains/domain-modal';

export function DomainCard(props: { domain: Domain }) {
	const { data: domain } = api.domain.byDomain.useQuery(props.domain.domain, {
		initialData: props.domain,
	});

	const { data: domainVerification, isFetching: fetchingDomainVerification } =
		api.domain.verifyOnVercel.useQuery(props.domain.domain);

	const setEditDomain = useSetAtom(editDomainAtom);
	const showDomainModal = useSetAtom(showDomainModalAtom);

	if (!domain) return null;

	return (
		<div className='flex flex-col gap-2 rounded-lg border border-border px-5 py-8 sm:px-10'>
			<div className='flex flex-col justify-between md:flex-row'>
				<div className='flex flex-row items-center gap-3'>
					<Link
						href={`https://${domain.domain}`}
						passHref
						className='flex flex-row items-center gap-2'
					>
						<Text variant='2xl/semibold'>{punycode.toUnicode(props.domain.domain)}</Text>
						<Icon.externalLink className='h-5 w-5' />
					</Link>
					<Badge variant='solid' size='sm' className='flex flex-row gap-2'>
						{props.domain.type === 'link' ? (
							<>
								<Icon.link className='h-3 w-3' />
								{props.domain.isPrimaryLinkDomain ? 'Primary Link Domain' : 'Link'}
							</>
						) : (
							<Icon.bio className='h-3 w-3' />
						)}
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
							setEditDomain(domain);
							showDomainModal(true);
						}}
					>
						Edit
					</Button>
				</div>
			</div>

			<div className='flex h-10 flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-5 sm:space-y-0'>
				<div className='flex items-center space-x-2'>
					{!domain.verified && fetchingDomainVerification ? (
						<LoadingSpinner className='h-6 w-6' />
					) : domain.verified ? (
						<Icon.checkCircleFilled className='h-6 w-6 text-blue-500' />
					) : domainVerification?.status === 'Pending Verification' ? (
						<Icon.alertFilled className='h-6 w-6 text-warning' />
					) : (
						<Icon.xCircleFilled className='h-6 w-6 text-destructive' />
					)}

					<p className='text-sm text-muted-foreground'>
						{domainVerification ? domainVerification.status : 'Checking Domain Status'}
					</p>
				</div>

				{/* <div className='flex items-center space-x-2'>
					{domain.type !== 'link' ? null : domain.target ? (
						<Icon.checkCircleFilled className='h-6 w-6 text-blue-500' />
					) : (
						<Icon.xCircleFilled className='h-6 w-6 text-subtle-foreground' />
					)}
					<div className='flex space-x-1'>
						{domain.type === 'link' && (
							<p className='text-sm text-subtle-foreground'>
								{domain.target
									? `${capitalize(domain.type)}s to`
									: `No redirect configured`}
							</p>
						)}

						{domain.target && (
							<a
								href={domain.target}
								target='_blank'
								rel='noreferrer'
								className='text-sm font-medium text-gray-600'
							>
								{truncate(domain.target.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ''), 24)}
							</a>
						)}
					</div>
				</div> */}
			</div>
			{domainVerification && domainVerification.status !== 'Valid Configuration' && (
				<DomainConfiguration
					status={domainVerification.status}
					domainResponse={domainVerification.vercelDomainResponse}
					configResponse={domainVerification.vercelConfigResponse}
				/>
			)}
		</div>
	);
}
