import type { Metadata } from 'next';

import { getServerSession } from 'next-auth/next';

import { Container } from '@barely/ui/elements/container';
import { H3 } from '@barely/ui/elements/typography';

import { ProviderAccountCard } from './provider-account-card';

export const metadata: Metadata = {
	title: 'Accounts',
};

const ExternalAccountsPage = async () => {
	const session = await getServerSession();

	console.log(session?.user);

	return (
		<Container>
			<H3>External Accounts</H3>
			<ProviderAccountCard provider='spotify' />
		</Container>
	);
};

export default ExternalAccountsPage;

// https://accounts.spotify.com/authorize?client_id=5d9e23aaa5f64bb3afa9cec529844d3d&scope=ugc-image-upload%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing%20app-remote-control%20streaming%20playlist-read-private%20playlist-read-collaborative%20playlist-modify-public%20playlist-modify-private%20user-read-email%20user-read-private&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fcallback%2Fspotify&show_dialog=true&state=ixZWRE2Krb_TjrHe9GO67UH2vJ2yc9y1j4ao56mcJvI
