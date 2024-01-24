'use client';

import { Button } from '@barely/ui/src/Button';
import { Card } from '@barely/ui/src/Card';
import { useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';

interface AddSpotifyButtonProps {
	strategy: 'oauth_spotify' | 'oauth_google' | 'oauth_facebook';
	baseUrl: string;
	redirectPath?: string;
}

export function AddSocialButton(props: AddSpotifyButtonProps) {
	const { strategy, redirectPath, baseUrl } = props;
	const path = usePathname();
	const { isLoaded, isSignedIn, user } = useUser();

	if (!isLoaded || !isSignedIn || !user) return null;

	// const redirectUrl = baseUrl + redirectPath ?? path ?? '/';
	const redirectUrl = `${baseUrl}${redirectPath ?? path ?? '/'}`;

	async function addExternalAccount() {
		const externalAccount = await user?.createExternalAccount({
			strategy,
			redirect_url: redirectUrl,
		});
		console.log('externalAccountRes => ', externalAccount);

		if (!externalAccount?.verification?.externalVerificationRedirectURL)
			return console.error('externalVerificationRedirectURL is null');

		console.log(
			'externalAccountRedirect => ',
			externalAccount?.verification?.externalVerificationRedirectURL.href,
		);
	}

	return (
		<div>
			<p>baseUrl = {baseUrl}</p>
			<p>current path = {path}</p>
			<button onClick={() => addExternalAccount()}>
				{`add ${strategy} account (redirect=${redirectUrl})`}{' '}
			</button>
		</div>
	);
}

// export function RemoveSocialButton() {
// 	const { isLoaded, isSignedIn, user } = useUser();
// 	if (!isLoaded || !isSignedIn || !user) return null;

// 	const account = user?.verifiedExternalAccounts?.find(account => {
// 		return account.provider === 'spotify';
// 	});

// 	async function removeExternalAccount() {
// 		const externalAccount = await account?.destroy();
// 		console.log('externalAccountRes => ', externalAccount);
// 	}

// 	return (
// 		<div>
// 			<button onClick={() => removeExternalAccount()}>remove spotify account</button>
// 		</div>
// 	);
// }

interface ExternalAccountCardProps {
	platform: 'spotify' | 'google' | 'facebook';
	baseUrl: string;
	redirectPath?: string;
}

export function ExternalAccountCard({
	platform,
	baseUrl,
	redirectPath,
}: ExternalAccountCardProps) {
	const { isLoaded, isSignedIn, user } = useUser();
	if (!isLoaded || !isSignedIn || !user) return null;

	const accounts = user?.verifiedExternalAccounts.filter(
		account => account.provider === platform,
	);

	const path = usePathname();
	const redirectUrl = `${baseUrl}${redirectPath ?? path ?? '/'}`;
	const strategy = `oauth_${platform}` as const;

	async function addExternalAccount() {
		const externalAccount = await user?.createExternalAccount({
			strategy,
			redirect_url: redirectUrl,
		});
		console.log('externalAccountRes => ', externalAccount);

		if (!externalAccount?.verification?.externalVerificationRedirectURL)
			return console.error('externalVerificationRedirectURL is null');

		console.log(
			'externalAccountRedirect => ',
			externalAccount?.verification?.externalVerificationRedirectURL.href,
		);

		window.location.href =
			externalAccount?.verification?.externalVerificationRedirectURL.href;
	}

	return (
		<Card>
			<h1 className='text-3xl font-semibold'>{platform}</h1>
			{!accounts?.length && (
				<Button onClick={() => addExternalAccount()}>Add {platform} account</Button>
			)}
			{accounts?.length > 0 &&
				accounts.map(account => {
					return (
						<div key={account.id} className='block w-full'>
							<div className='flex w-full flex-row'>
								<div className='flex flex-grow flex-col'>
									<p className='text-lg font-bold'>
										user: {account.username ?? account.providerUserId}
									</p>
									<p className='text-sm text-gray-500'>{account.emailAddress}</p>
								</div>
								<Button onClick={() => account?.destroy()}>Remove Account</Button>
							</div>
						</div>
					);
				})}
		</Card>
	);
}
