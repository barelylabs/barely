import { getPublicPressKit } from '@barely/lib/server/routes/press-kit/press-kit.fns';

import type { SocialStat } from './_components/press-social-stats';
// const bio = `The second album by dream pop trio Proper Youth draws the bulk of its inspiration from all three members' biggest shared passion: 80's music. It was a singular decade full of chorused guitars, analog synths, saxophone, and plenty of reverb that welcomed listeners to escape into an aural arena replete with romanticism and earnesty. The new record modernizes this approach, incorporating themes about aging, loneliness, and narcissism into a dreamy soundscape that sounds best when played loud.

// Singers/songwriters Adam Barito and Amy Nesky and producer/drummer Bobb Barito went right back to work after releasing their debut album featuring the surprise hit, *Off My Mind*. Initially split between Ann Arbor and Brooklyn, they came together in Louisville for four months in 2020 to care for an ailing family member. It was in an apartment there that they channeled the anguish of that historic year into the groundwork of production. The intimate collaboration galvanized Amy and Adam to finally move to Brooklyn, where they spent two more years finishing the songs with Bobb in a Bedstuy studio.

// *Rusty Grand Am* is named after a car Adam and Bobb's dad owned when they were growing up. It stuck around well after its expiration date, resilient against the unstoppable threat of decay. Revisiting the old piece of junk served as a vehicle for the thrilling and never-ending road toward the heart of nostalgia--one which Proper Youth never plans on exiting.
//   `;

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
