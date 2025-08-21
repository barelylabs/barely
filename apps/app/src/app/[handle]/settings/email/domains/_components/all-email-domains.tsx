'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { IconKey } from '@barely/ui/icon';
import { useCallback, useState } from 'react';
import { useCopy, useWorkspace } from '@barely/hooks';
import { punycode, toTitleCase } from '@barely/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@barely/ui/table';
import { Text } from '@barely/ui/typography';

import { CreateEmailDomainButton } from '~/app/[handle]/settings/email/domains/_components/create-email-domain-button';
import {
	useEmailDomain,
	useEmailDomainSearchParams,
} from '~/app/[handle]/settings/email/domains/_components/email-domain-context';

type EmailDomain = AppRouterOutputs['emailDomain']['byWorkspace']['domains'][number];

export function AllEmailDomains() {
	const {
		items: emailDomains,
		selection: emailDomainSelection,
		setSelection: setEmailDomainSelection,
	} = useEmailDomain();

	return (
		<>
			<GridList
				data-grid-list='email-domains'
				className='flex flex-col gap-2'
				aria-label='Email domains'
				selectionMode='none'
				items={emailDomains}
				selectedKeys={emailDomainSelection}
				setSelectedKeys={setEmailDomainSelection}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='domain'
						title='No email domains'
						subtitle='Add a domain to get started'
						button={<CreateEmailDomainButton />}
					/>
				)}
			>
				{emailDomain => <EmailDomainCard emailDomain={emailDomain} />}
			</GridList>
		</>
	);
}

function EmailDomainCard({ emailDomain }: { emailDomain: EmailDomain }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	const { name, records } = emailDomain;
	const [isVerifying, setIsVerifying] = useState(false);
	const { copyToClipboard } = useCopy();
	const { setShowUpdateModal, setSelection } = useEmailDomainSearchParams();

	const { mutate: verifyDomain } = useMutation(
		trpc.emailDomain.verifyOnResend.mutationOptions({
			onMutate: () => {
				setIsVerifying(true);

				return undefined;
			},

			onSettled: async () => {
				// Always refetch after error or success
				await queryClient.invalidateQueries({
					queryKey: trpc.emailDomain.byWorkspace.queryKey(),
				});
				setIsVerifying(false);
			},
		}),
	);

	const handleVerifyDomain = useCallback(() => {
		setIsVerifying(true);
		verifyDomain({ id: emailDomain.id, handle });
	}, [emailDomain.id, handle, verifyDomain]);

	return (
		<GridListCard id={emailDomain.id} key={emailDomain.id} textValue={emailDomain.name}>
			<div className='flex w-full flex-col gap-4 p-4'>
				<div className='flex flex-row items-center justify-between'>
					<div className='flex flex-row items-center gap-4'>
						<Text variant='2xl/semibold'>{punycode(name)}</Text>
						<EmailDomainStatusBadge status={emailDomain.status} />
					</div>

					<div className='flex flex-row items-center gap-4'>
						<Button
							look='outline'
							size='sm'
							loading={isVerifying}
							loadingText='Verifying...'
							onClick={handleVerifyDomain}
						>
							Verify DNS Records
						</Button>

						<Button
							look='ghost'
							size='sm'
							startIcon='dots'
							onClick={() => {
								void setSelection(new Set([emailDomain.id]));
								void setShowUpdateModal(true);
							}}
						/>
					</div>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Type</TableHead>
							<TableHead>Hostname</TableHead>
							<TableHead className='w-[200px]'>Data</TableHead>
							<TableHead>Priority</TableHead>
							<TableHead>TTL</TableHead>
							<TableHead className='text-right'>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{records.map((record, index) => (
							<TableRow key={index}>
								<TableCell>{record.type}</TableCell>
								<TableCell>
									<div className='group/hostname flex flex-row items-center gap-1'>
										<span>{record.name}</span>
										<Button
											variant='icon'
											look='ghost'
											size='2xs'
											startIcon='copy'
											className='opacity-0 transition-opacity duration-200 group-hover/hostname:opacity-100'
											onClick={e => {
												e.stopPropagation();
												copyToClipboard(record.name, {
													successMessage: 'Copied hostname to clipboard.',
												});
											}}
										/>
									</div>
								</TableCell>
								<TableCell
									className='w-full max-w-0 overflow-hidden'
									title={record.value}
								>
									<div className='group/data flex flex-row items-center gap-1'>
										<div className='truncate'>{record.value}</div>
										<Button
											variant='icon'
											look='ghost'
											size='2xs'
											startIcon='copy'
											className='opacity-0 transition-opacity duration-200 group-hover/data:opacity-100'
											onClick={e => {
												e.stopPropagation();
												copyToClipboard(record.value, {
													successMessage: 'Copied data to clipboard.',
												});
											}}
										/>
									</div>
								</TableCell>
								<TableCell>{record.priority ?? ''}</TableCell>
								<TableCell>{record.ttl}</TableCell>
								<TableCell className='text-right'>
									<div className='flex justify-end'>
										<RecordStatusBadge status={record.status} />
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</GridListCard>
	);
}

function EmailDomainStatusBadge({ status }: { status: EmailDomain['status'] }) {
	const formattedStatus = status
		.replaceAll('_', ' ')
		.replace(/\b\w/g, c => c.toUpperCase());
	const icon: IconKey =
		status === 'not_started' ? 'domain'
		: status === 'verified' ? 'checkCircle'
		: 'warning';
	return (
		<Badge
			variant={
				status === 'not_started' ? 'secondary'
				: status === 'verified' ?
					'success'
				:	'warning'
			}
			icon={icon}
			className='flex flex-row items-center gap-1'
		>
			{formattedStatus}
		</Badge>
	);
}

function RecordStatusBadge({ status }: { status: string }) {
	const formattedStatus = toTitleCase(status.replaceAll('_', ' '));

	return (
		<Badge
			size='sm'
			variant={
				status === 'not_started' ? 'secondary'
				: status === 'verified' ?
					'success'
				:	'warning'
			}
			className='flex flex-row items-center gap-1'
		>
			{formattedStatus}
		</Badge>
	);
}
