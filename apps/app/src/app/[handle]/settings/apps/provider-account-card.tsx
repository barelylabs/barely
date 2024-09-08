'use client';

import type { ProviderAccount } from '@barely/lib/server/routes/provider-account/provider-account.schema';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';

import { api } from '@barely/api/react';

import { AlertDialog } from '@barely/ui/elements/alert-dialog';
import { Button } from '@barely/ui/elements/button';
import { Card } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';
import { H } from '@barely/ui/elements/typography';

import { onPromise } from '@barely/utils/on-promise';
import { toTitleCase } from '@barely/utils/text';

interface ExternalAccountCardProps {
	provider: ProviderAccount['provider'];
}

export const ProviderAccountCard = ({ provider }: ExternalAccountCardProps) => {
	const router = useRouter();
	const utils = api.useUtils();
	const workspace = useWorkspace();

	const { data: providerAccounts } = api.providerAccount.byWorkspace.useQuery({
		handle: workspace.handle,
		providers: [provider],
	});

	const { mutate: authorize } = api.providerAccount.authorize.useMutation({
		onSuccess: url => {
			if (url) {
				router.push(url);
			}
		},
	});

	const { mutateAsync: deleteAccount } = api.providerAccount.delete.useMutation();

	const addAccount = () => {
		authorize({ provider });
		return utils.providerAccount.byCurrentUser.invalidate();
	};

	const removeAccount = async (accountId: string) => {
		await deleteAccount({
			provider,
			providerAccountId: accountId,
		});
		return utils.providerAccount.invalidate();
	};

	const platform = toTitleCase(provider);

	return (
		<Card>
			<H size='5'>{platform}</H>

			{!!providerAccounts?.length &&
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
