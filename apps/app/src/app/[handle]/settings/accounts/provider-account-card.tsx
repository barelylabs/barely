// 'use client';

// import { signIn } from '@barely/server/auth/auth.react';
// import type { ProviderAccount } from '@barely/server/provider-account.schema';
// import { useToast } from '@barely/toast';

// import { api } from '@barely/api/react';

// import { AlertDialog } from '@barely/ui/elements/alert-dialog';
// import { Button } from '@barely/ui/elements/button';
// import { Card } from '@barely/ui/elements/card';
// import { Icon } from '@barely/ui/elements/icon';
// import { H } from '@barely/ui/elements/typography';

// import { onPromise } from '@barely/utils/on-promise';
// import { toTitleCase } from '@barely/utils/text';

// interface ExternalAccountCardProps {
// 	provider: ProviderAccount['provider'];
// }

// const ProviderAccountCard = (props: ExternalAccountCardProps) => {
// 	const { toast } = useToast();

// 	const utils = api.useContext();

// 	const { data: providerAccounts } = api.providerAccount.byCurrentUser.useQuery({
// 		providers: [props.provider],
// 	});

// 	const deleteAccount = api.providerAccount.delete.useMutation();

// 	const addAccount = async () => {
// 		const signInRes = await signIn(props.provider, {});

// 		if (signInRes?.error) {
// 			toast({
// 				title: 'Error',
// 				description: signInRes.error,
// 				variant: 'destructive',
// 			});
// 		}

// 		return utils.providerAccount.byCurrentUser.invalidate();
// 	};

// 	const removeAccount = async (accountId: string) => {
// 		await deleteAccount.mutateAsync({
// 			provider: props.provider,
// 			providerAccountId: accountId,
// 		});
// 		return utils.providerAccount.byCurrentUser.invalidate();
// 	};

// 	const platform = toTitleCase(props.provider);

// 	return (
// 		<Card>
// 			<H size='5'>{platform}</H>

// 			{!!providerAccounts?.length &&
// 				providerAccounts.map(account => {
// 					return (
// 						<div
// 							key={`${account.provider}.${account.providerAccountId}`}
// 							className='block w-full'
// 						>
// 							<div className='flex w-full flex-row'>
// 								<div className='flex flex-grow flex-col justify-end'>
// 									<p className='text-md'>
// 										{account.username ?? account.providerAccountId}
// 									</p>
// 									<p className='text-sm text-muted-foreground'>{account.email}</p>
// 								</div>

// 								<AlertDialog
// 									triggerName={<Icon.trash className='h-4 w-4' />}
// 									triggerSize='sm'
// 									triggerVariant={'secondary'}
// 									title='Confirm that you want to remove this account.'
// 									description={`This will remove this account and any associated accounts from our servers.`}
// 									actionName='Remove Account'
// 									action={onPromise(async () => {
// 										console.log('removing account', account.providerAccountId);
// 										await removeAccount(account.providerAccountId);
// 										return;
// 									})}
// 								/>
// 							</div>
// 						</div>
// 					);
// 				})}
// 			<Button onClick={onPromise(() => addAccount())}>Add {platform} Account</Button>
// 			{/* {<pre>{JSON.stringify(providerAccounts, null, 2)}</pre>} */}
// 		</Card>
// 	);
// };

// export { ProviderAccountCard };
