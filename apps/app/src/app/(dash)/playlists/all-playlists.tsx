'use client';

import { Fragment, useState } from 'react';

import Link from 'next/link';

import type { Playlist } from '@barely/db';

import { InfoCard } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';

import { api } from '~/client/trpc';

interface AllPlaylistsProps {
	initialPlaylists: Playlist[];
}

const AllPlaylists = ({ initialPlaylists }: AllPlaylistsProps) => {
	const utils = api.useContext();

	const { data: queriedPlaylists } = api.node.playlist.byCurrentUser.useQuery(undefined, {
		initialData: initialPlaylists,
	});

	const playlists = queriedPlaylists; // ?? initialPlaylists;

	const [, setSyncingSpotify] = useState(false);

	api.node.spotify.syncCurrentUser.useMutation({
		onMutate: () => {
			console.log('syncing spotify');
			setSyncingSpotify(true);
		},
		onSuccess: async () => {
			console.log('synced spotify');
			await utils.node.playlist.byCurrentUser.invalidate();
			setSyncingSpotify(false);
		},
	});

	return (
		<div className='flex flex-col space-y-4 w-full'>
			{!!playlists &&
				playlists.map((playlist, playlistIndex) => {
					const stats = (
						<span className='flex flex-row'>{playlist.totalTracks} songs</span>
					);

					const buttons = (
						<Link href={`/playlists/${playlist.id}`}>
							<Icon.edit className='w-3 h-3 dark:text-slate-400' />
						</Link>
					);

					return (
						<Fragment key={`${playlist.id}.${playlistIndex}}`}>
							<InfoCard
								title={playlist.name}
								subtitle={playlist.spotifyAccount?.username}
								imageUrl={playlist.imageUrl}
								stats={stats}
								buttons={buttons}
							/>
						</Fragment>
					);
				})}
		</div>
	);
};

export { AllPlaylists };
