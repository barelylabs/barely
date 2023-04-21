'use client';

import { signIn } from 'next-auth/react';
import { z } from 'zod';

import { oAuthProviderSchema } from '@barely/lib/api/account/account.schema';
import { onPromise } from '@barely/lib/utils/edge/on-promise';
import { toTitleCase } from '@barely/lib/utils/edge/text';
import { useToast } from '@barely/toast';

import { AlertDialog } from '@barely/ui/elements/alert-dialog';
import { Button } from '@barely/ui/elements/button';
import { Card } from '@barely/ui/elements/card';
import { H5 } from '@barely/ui/elements/typography';

import { api } from '~/client/trpc';

interface ExternalAccountCardProps {
	provider: z.infer<typeof oAuthProviderSchema>;
}

const ProviderAccountCard = (props: ExternalAccountCardProps) => {
	const { provider } = props;

	const { toast } = useToast();

	const utils = api.useContext();

	// const [syncing, setSyncing] = useState(true);

	const { data: providerAccounts } = api.node.account.byCurrentUser.useQuery({
		providers: [provider],
	});

	const deleteAccount = api.node.account.delete.useMutation();

	const addAccount = async () => {
		const signInRes = await signIn(provider);

		if (signInRes?.error) {
			toast({
				title: 'Error',
				description: signInRes.error,
				variant: 'destructive',
			});
		}

		return utils.node.account.byCurrentUser.invalidate();
	};

	const removeAccount = async (accountId: string) => {
		await deleteAccount.mutateAsync(accountId);
		return;
	};

	const platform = toTitleCase(provider);

	return (
		<Card>
			<H5>{platform}</H5>

			{!!providerAccounts?.length &&
				providerAccounts.map(account => {
					return (
						<div key={account.id} className='block w-full'>
							<div className='flex w-full flex-row'>
								<div className='flex flex-grow flex-col justify-end'>
									<p className='text-md'>{account.username ?? account.id}</p>
									<p className='text-sm text-gray-500'>{account.email}</p>
								</div>

								<AlertDialog
									triggerName='Remove Account'
									title='Confirm that you want to remove this account.'
									description={`This will remove this account and any associated accounts from our servers.`}
									actionName='Remove Account'
									action={onPromise(() => {
										console.log('removing account', account.id);
										return removeAccount(account.id);
									})}
								/>
							</div>
						</div>
					);
				})}
			<Button onClick={onPromise(() => addAccount())}>Add {platform} Account</Button>
			{/* {<pre>{JSON.stringify(providerAccounts, null, 2)}</pre>} */}
		</Card>
	);
};

export { ProviderAccountCard };
