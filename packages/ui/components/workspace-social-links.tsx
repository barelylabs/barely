import type { PublicWorkspace } from '@barely/lib/server/routes/workspace/workspace.schema';
import Link from 'next/link';

import { Icon } from '../elements/icon';

export function WorkspaceSocialLinks({
	workspace,
	show = {
		instagram: true,
		youtube: true,
		tiktok: true,
		spotify: true,
	},
}: {
	workspace: PublicWorkspace;
	show?: {
		instagram?: boolean;
		youtube?: boolean;
		tiktok?: boolean;
		spotify?: boolean;
	};
}) {
	const igLink =
		show?.instagram && workspace.instagramUsername
			? `https://instagram.com/${workspace.instagramUsername}`
			: null;
	const ytLink =
		show?.youtube && workspace.youtubeChannelId
			? `https://youtube.com/channel/${workspace.youtubeChannelId}`
			: null;
	const tiktokLink =
		show?.tiktok && workspace.tiktokUsername
			? `https://tiktok.com/@${workspace.tiktokUsername}`
			: null;
	const spotifyLink =
		show?.spotify && workspace.spotifyArtistId
			? `https://open.spotify.com/artist/${workspace.spotifyArtistId}`
			: null;
	return (
		<div className='flex flex-row items-center gap-2'>
			{igLink && (
				<Link href={igLink} target='_blank' passHref>
					<Icon.instagram className='h-6 w-6 text-white hover:text-pink-500' />
				</Link>
			)}
			{ytLink && (
				<Link href={ytLink} target='_blank' passHref>
					<Icon.youtube className='h-6 w-6 text-white hover:text-youtube-500' />
				</Link>
			)}
			{tiktokLink && (
				<Link href={tiktokLink} target='_blank' passHref>
					<Icon.tiktok className='h-6 w-6 text-white hover:text-tiktok-500' />
				</Link>
			)}
			{spotifyLink && (
				<Link href={spotifyLink} target='_blank' passHref>
					<Icon.spotify className='h-6 w-6 text-white hover:text-spotify-500' />
				</Link>
			)}
		</div>
	);
}
