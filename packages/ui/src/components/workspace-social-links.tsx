import type { PublicWorkspace } from '@barely/validators';
import Link from 'next/link';
import { cn } from '@barely/utils';

import { Icon } from '../elements/icon';

export function WorkspaceSocialLinks({
	workspace,
	show = {
		instagram: true,
		youtube: true,
		tiktok: true,
		spotify: true,
	},
	className,
}: {
	workspace: PublicWorkspace;
	show?: {
		instagram?: boolean;
		youtube?: boolean;
		tiktok?: boolean;
		spotify?: boolean;
	};
	className?: string;
}) {
	const igLink =
		show.instagram && workspace.instagramUsername ?
			`https://instagram.com/${workspace.instagramUsername}`
		:	null;
	const ytLink =
		show.youtube && workspace.youtubeChannelId ?
			`https://youtube.com/channel/${workspace.youtubeChannelId}`
		:	null;
	const tiktokLink =
		show.tiktok && workspace.tiktokUsername ?
			`https://tiktok.com/@${workspace.tiktokUsername}`
		:	null;
	const spotifyLink =
		show.spotify && workspace.spotifyArtistId ?
			`https://open.spotify.com/artist/${workspace.spotifyArtistId}`
		:	null;
	return (
		<div className='flex flex-row items-center gap-2'>
			{igLink && (
				<Link href={igLink} target='_blank' passHref>
					<Icon.instagram
						className={cn('h-6 w-6 text-white hover:text-pink-500', className)}
					/>
				</Link>
			)}
			{ytLink && (
				<Link href={ytLink} target='_blank' passHref>
					<Icon.youtube
						className={cn('h-6 w-6 text-white hover:text-youtube-500', className)}
					/>
				</Link>
			)}
			{tiktokLink && (
				<Link href={tiktokLink} target='_blank' passHref>
					<Icon.tiktok
						className={cn('h-6 w-6 text-white hover:text-tiktok-500', className)}
					/>
				</Link>
			)}
			{spotifyLink && (
				<Link href={spotifyLink} target='_blank' passHref>
					<Icon.spotify
						className={cn('h-6 w-6 text-white hover:text-spotify-500', className)}
					/>
				</Link>
			)}
		</div>
	);
}
