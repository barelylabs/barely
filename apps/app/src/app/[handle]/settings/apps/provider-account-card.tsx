'use client';

import type { ProviderAccount } from '@barely/validators';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { onPromise, toTitleCase } from '@barely/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { AlertDialog } from '@barely/ui/alert-dialog';
import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

interface ExternalAccountCardProps {
	provider: ProviderAccount['provider'];
}

export const ProviderAccountCard = ({ provider }: ExternalAccountCardProps) => {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();

	const { data: providerAccounts } = useSuspenseQuery(
		trpc.providerAccount.byWorkspace.queryOptions({
			handle: workspace.handle,
			providers: [provider],
		}),
	);

	const { mutate: authorize } = useMutation(
		trpc.providerAccount.authorize.mutationOptions({
			onSuccess: url => {
				if (url) {
					router.push(url);
				}
			},
		}),
	);

	const { mutateAsync: deleteAccount } = useMutation(
		trpc.providerAccount.delete.mutationOptions(),
	);

	const addAccount = () => {
		authorize({ provider, handle: workspace.handle });
		return queryClient.invalidateQueries({
			queryKey: trpc.providerAccount.byCurrentUser.queryKey(),
		});
	};

	const removeAccount = async (accountId: string) => {
		await deleteAccount({
			provider,
			providerAccountId: accountId,
		});
		return queryClient.invalidateQueries(
			trpc.providerAccount.byWorkspace.queryFilter({
				handle: workspace.handle,
				providers: [provider],
			}),
		);
	};

	const platform = toTitleCase(provider);

	return (
		<Card>
			<H size='5'>{platform}</H>

			{providerAccounts.length > 0 &&
				providerAccounts.map(account => {
					return (
						<div
							key={`${account.provider}.${account.providerAccountId}`}
							className='block w-full'
						>
							<div className='flex w-full flex-row'>
								<div className='flex flex-grow flex-col justify-end'>
									<p className='text-md'>
										{account.username ?? account.providerAccountId}
									</p>
									<p className='text-sm text-muted-foreground'>{account.email}</p>
									<p className='text-sm text-muted-foreground'>
										{account.providerAccountId}
									</p>
								</div>

								<AlertDialog
									triggerName={<Icon.trash className='h-4 w-4' />}
									triggerSize='sm'
									triggerVariant={'secondary'}
									title='Confirm that you want to remove this account.'
									description={`This will remove this account and any associated accounts from our servers.`}
									actionName='Remove Account'
									action={onPromise(async () => {
										console.log('removing account', account.providerAccountId);
										await removeAccount(account.providerAccountId);
										return;
									})}
								/>
							</div>
						</div>
					);
				})}
			<Button look='secondary' onClick={onPromise(() => addAccount())} fullWidth>
				Add {platform} Account
			</Button>
			{/* {<pre>{JSON.stringify(providerAccounts, null, 2)}</pre>} */}
		</Card>
	);
};
