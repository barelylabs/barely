'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { api } from '@barely/server/api/react';

import { useWorkspace } from '@barely/hooks/use-workspace';

import { InfoCard } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';

const AllPlaylists = () => {
	const utils = api.useContext();

	const workspace = useWorkspace();

	const [playlistsMap] = api.playlist.byWorkspaceId.useSuspenseQuery({
		workspaceId: workspace.id,
	});

	const playlists = playlistsMap ? Array.from(playlistsMap.values()) : [];

	const [, setSyncingSpotify] = useState(false);

	api.spotify.syncCurrentUser.useMutation({
		onMutate: () => {
			setSyncingSpotify(true);
		},
		onSuccess: async () => {
			await utils.playlist.byCurrentUser.invalidate();
			setSyncingSpotify(false);
		},
	});

	return (
		<div className='flex w-full flex-col space-y-4'>
			{Array.from(playlists).map((playlist, playlistIndex) => {
				const stats = <span className='flex flex-row'>{playlist.totalTracks} songs</span>;

				const buttons = (
					<Link href={`/${workspace.handle}/playlists/${playlist.id}`}>
						<Icon.edit className='h-3 w-3 ' />
					</Link>
				);

				return (
					<Fragment key={`${playlist.id}.${playlistIndex}}`}>
						<InfoCard
							title={playlist.name}
							subtitle={playlist.providerAccounts[0]?.username}
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
