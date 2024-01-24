import { currentUser } from '@clerk/nextjs/app-beta';
import { AddSocialButton, ExternalAccountCard } from './SocialButton';
import env from '~/env';

async function ExternalAccountsPage() {
	const user = await currentUser();

	const spotify = user?.externalAccounts.find(
		account => account.provider === 'oauth_spotify',
	);

	return (
		<>
			{user?.firstName}
			<pre>{JSON.stringify(user?.externalAccounts, null, 2)}</pre>

			<p>server baseUrl = {env.NEXT_PUBLIC_APP_BASE_URL}</p>

			<h1>spotify</h1>
			{/* {spotify && <div>{spotify.username}</div>} */}
			<ExternalAccountCard platform='spotify' baseUrl={env.NEXT_PUBLIC_APP_BASE_URL} />
			{/* <AddSocialButton strategy='oauth_spotify' baseUrl={baseUrl} /> */}
			{/* <button onClick={() => user?.deleteExternalAccount(spotify?.id)}> */}

			{/* <h1>accounts for user {user?.id}</h1>
			{accounts?.length &&
				accounts.map(account => {
					return (
						<div key={account.id}>
							provider: {account.provider}
							<br />
							userId: {account.username}
						</div>
					);
				})}
			<button className='bg-spotify' onClick={() => signIn('spotify')}>
				add spotify account
			</button> */}
			{/* <button onClick >add spotify account</button> */}
		</>
	);
}

export default ExternalAccountsPage;

// https://accounts.spotify.com/authorize?client_id=5d9e23aaa5f64bb3afa9cec529844d3d&scope=ugc-image-upload%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing%20app-remote-control%20streaming%20playlist-read-private%20playlist-read-collaborative%20playlist-modify-public%20playlist-modify-private%20user-read-email%20user-read-private&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fcallback%2Fspotify&show_dialog=true&state=ixZWRE2Krb_TjrHe9GO67UH2vJ2yc9y1j4ao56mcJvI
