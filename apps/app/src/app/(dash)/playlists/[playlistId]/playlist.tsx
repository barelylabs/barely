'use client';

import { type UserGetPlaylistById } from '@barely/api/playlist/playlist.fns';
import { onPromise } from '@barely/lib/utils/edge/on-promise';

import { Badge } from '@barely/ui/elements/badge';
import { Button } from '@barely/ui/elements/button';
import { Card } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';
import { H2, H4, Text } from '@barely/ui/elements/typography';

import { api } from '~/client/trpc';

const Playlist = ({
	initPlaylist,
}: {
	initPlaylist: NonNullable<UserGetPlaylistById>;
}) => {
	const utils = api.useContext();
	const playlistQuery = api.node.playlist.byId.useQuery(initPlaylist.id, {
		initialData: initPlaylist,
		staleTime: 1000 * 60 * 10, // 10 min
		cacheTime: 1000 * 60 * 60 * 24, // 1 hr
	});

	const estimateGenres = api.node.playlist.estimateGenresById.useMutation({
		onSuccess: async () => {
			await utils.node.playlist.byId.invalidate(initPlaylist.id);
		},
	});

	const playlist = playlistQuery.data ?? initPlaylist;

	return (
		<Card>
			<H2>{playlist.name}</H2>
			<H4>{playlist.spotifyAccount?.username}</H4>
			<div className='flex flex-row gap-2 items-center'>
				<Text variant='md/medium'>Genres</Text>
				<Button
					loading={estimateGenres.isLoading}
					onClick={onPromise(() => estimateGenres.mutateAsync(initPlaylist.id))}
					variant='ghost'
					icon
					pill
				>
					<Icon.magic className='w-3 h-3 text-orange-300' />
				</Button>
			</div>
			<div className='flex flex-row flex-wrap gap-2 items-center'>
				{playlist.playlistGenres.map((genre, index) => (
					<Badge key={`${genre.genreName}.${index}`} size='sm' variant='subtle'>
						{genre.genreName}
					</Badge>
				))}
			</div>
		</Card>
	);
};

export { Playlist };
