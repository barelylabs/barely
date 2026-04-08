'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { onPromise } from '@barely/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { AlertDialog } from '@barely/ui/alert-dialog';
import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import { H } from '@barely/ui/typography';

export const ShopifyAccountCard = () => {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();
	const [shopDomain, setShopDomain] = useState('');
	const [showDomainInput, setShowDomainInput] = useState(false);

	const { data: providerAccounts } = useSuspenseQuery(
		trpc.providerAccount.byWorkspace.queryOptions({
			handle: workspace.handle,
			providers: ['shopify'],
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

	const connectShopify = () => {
		if (!shopDomain) return Promise.resolve();

		// Normalize domain: add .myshopify.com if not present
		const normalizedDomain =
			shopDomain.includes('.myshopify.com') ? shopDomain : (
				`${shopDomain.replace(/\.myshopify\.com$/, '')}.myshopify.com`
			);

		authorize({
			provider: 'shopify',
			handle: workspace.handle,
			shopDomain: normalizedDomain,
		});

		return queryClient.invalidateQueries({
			queryKey: trpc.providerAccount.byCurrentUser.queryKey(),
		});
	};

	const removeAccount = async (accountId: string) => {
		await deleteAccount({
			provider: 'shopify',
			providerAccountId: accountId,
		});
		return queryClient.invalidateQueries(
			trpc.providerAccount.byWorkspace.queryFilter({
				handle: workspace.handle,
				providers: ['shopify'],
			}),
		);
	};

	const isConnected = providerAccounts.length > 0;

	return (
		<Card>
			<H size='5'>Shopify</H>

			{isConnected &&
				providerAccounts.map(account => (
					<div
						key={`${account.provider}.${account.providerAccountId}`}
						className='block w-full'
					>
						<div className='flex w-full flex-row items-center'>
							<div className='flex flex-grow flex-col'>
								<p className='text-md'>{account.username ?? 'Shopify Store'}</p>
								<p className='text-sm text-muted-foreground'>{account.server}</p>
							</div>

							<AlertDialog
								triggerName={<Icon.trash className='h-4 w-4' />}
								triggerSize='sm'
								triggerVariant='secondary'
								title='Disconnect Shopify store?'
								description='This will disconnect your Shopify store. Existing orders will not be affected, but new orders will no longer sync to Shopify.'
								actionName='Disconnect'
								action={onPromise(async () => {
									await removeAccount(account.providerAccountId);
								})}
							/>
						</div>
					</div>
				))}

			{!isConnected && !showDomainInput && (
				<Button look='secondary' onClick={() => setShowDomainInput(true)} fullWidth>
					Connect Shopify Store
				</Button>
			)}

			{!isConnected && showDomainInput && (
				<div className='flex flex-col gap-2'>
					<p className='text-sm text-muted-foreground'>
						Enter your Shopify store domain:
					</p>
					<div className='flex flex-row gap-2'>
						<Input
							value={shopDomain}
							onChange={e => setShopDomain(e.target.value)}
							placeholder='mystore.myshopify.com'
							className='flex-grow'
						/>
						<Button
							look='primary'
							onClick={onPromise(() => connectShopify())}
							disabled={!shopDomain}
						>
							Connect
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
};
