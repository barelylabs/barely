import { getPublicPressKit } from '@barely/lib/server/routes/press-kit/press-kit.fns';

import type { SocialStat } from './_components/press-social-stats';
import { PressBio } from './_components/press-bio';
import { PressContact } from './_components/press-contact';
import { PressHero } from './_components/press-hero';
import { MusicPlayerBottomBar } from './_components/press-music-player';
import { PressPhotos } from './_components/press-photos';
import { PressQuotes } from './_components/press-quotes';
import { PressScrollArea } from './_components/press-scroll-area';
import { SocialStats } from './_components/press-social-stats';
import { TopPlayerBar } from './_components/press-top-player-bar';
import { PressVideos } from './_components/press-videos';

export default async function PressPage({ params }: { params: { handle: string } }) {
	const publicPressKit = await getPublicPressKit({ handle: params.handle });

	if (!publicPressKit) {
		return null;
	}

	const { workspace, mixtape, pressPhotos, ...pressKit } = publicPressKit;

	const {
		showBio,
		showBooking,
		showMixtape,
		showPressPhotos,
		showPressQuotes,
		overrideWorkspaceBio,
		pressQuotes,
		showVideos,
		showSocialStats,
		showFacebookFollowers,
		showInstagramFollowers,
		showSpotifyFollowers,
		showSpotifyMonthlyListeners,
		showTiktokFollowers,
		videos,
	} = pressKit;

	const bio =
		overrideWorkspaceBio && !!pressKit.bio?.length ? pressKit.bio : workspace.bio;

	const {
		facebookFollowers,
		instagramFollowers,
		spotifyFollowers,
		spotifyMonthlyListeners,
		tiktokFollowers,
	} = workspace;

	const socialStats: (SocialStat | false)[] = [
		showFacebookFollowers &&
			!!facebookFollowers && {
				icon: 'facebook',
				label: 'Facebook Followers',
				value: facebookFollowers,
			},
		showInstagramFollowers &&
			!!instagramFollowers && {
				icon: 'instagram',
				label: 'Instagram Followers',
				value: instagramFollowers,
			},
		showSpotifyFollowers &&
			!!spotifyFollowers && {
				icon: 'spotify',
				label: 'Spotify Followers',
				value: spotifyFollowers,
			},
		showSpotifyMonthlyListeners &&
			!!spotifyMonthlyListeners && {
				icon: 'spotify',
				label: 'Spotify Monthly Listeners',
				value: spotifyMonthlyListeners,
			},
		showTiktokFollowers &&
			!!tiktokFollowers && {
				icon: 'tiktok',
				label: 'Tiktok Followers',
				value: tiktokFollowers,
			},
	];

	const filteredSocialStats = socialStats.filter(v => !!v) as SocialStat[]; // i don't like this

	return (
		<>
			<main
				className={`mx-auto box-border w-full max-w-5xl flex-1 overflow-hidden`}
				style={{ height: 'calc(100dvh - 72px)' }}
			>
				<PressScrollArea>
					<PressHero {...publicPressKit} />

					{showMixtape && mixtape && <TopPlayerBar artistName={workspace.name} />}

					{showBio && bio && <PressBio bio={bio} />}

					{showPressQuotes && !!pressQuotes?.length && (
						<PressQuotes pressQuotes={pressQuotes} />
					)}

					{showSocialStats && !!filteredSocialStats.length && (
						<SocialStats stats={filteredSocialStats} />
					)}

					{showVideos && videos?.length && <PressVideos videos={videos} />}

					{showPressPhotos && !!pressPhotos.length && (
						<PressPhotos photos={pressPhotos} />
					)}

					{showBooking && workspace.bookingEmail && (
						<PressContact
							heading={workspace.bookingTitle}
							contactName={workspace.bookingName}
							email={workspace.bookingEmail}
						/>
					)}
				</PressScrollArea>
			</main>

			{showMixtape && !!mixtape?.tracks.length && (
				<MusicPlayerBottomBar tracklist={mixtape.tracks} />
			)}
		</>
	);
}
