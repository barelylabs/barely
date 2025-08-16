'use client';

import { useParams } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { useTRPC } from '@barely/lib/trpc/app.react';
import { onPromise } from '@barely/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

const Playlist = () => {
	const trpc = useTRPC();

	const queryClient = useQueryClient();
	const params = useParams<{ handle: string; playlistId: string }>();

	const { handle } = useWorkspace();

	const { data: playlist } = useSuspenseQuery(
		trpc.playlist.byId.queryOptions({
			handle: params.handle,
			playlistId: params.playlistId,
		}),
	);

	const { mutateAsync: estimateGenres, isPending } = useMutation(
		trpc.playlist.estimateGenresById.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.playlist.byId.queryFilter({
						handle: params.handle,
						playlistId: params.playlistId,
					}),
				);
			},
		}),
	);

	return (
		<Card>
			<H size='2'>{playlist.name}</H>
			<H size='4'>{playlist.providerAccounts[0]?.username}</H>
			<div className='flex flex-row items-center gap-2'>
				<Text variant='md/medium'>Genres</Text>
				<Button
					variant='icon'
					loading={isPending}
					onClick={onPromise(() =>
						estimateGenres({
							handle,
							playlistId: params.playlistId,
						}),
					)}
					look='ghost'
					pill
				>
					<Icon.magic className='h-3 w-3 text-orange-300' />
				</Button>
			</div>
			<div className='flex flex-row flex-wrap items-center gap-2'>
				{playlist.genres.map((genre, index) => (
					<Badge key={`${genre.id}.${index}`} size='sm' variant='subtle'>
						{genre.name}
					</Badge>
				))}
			</div>
			{/* <pre>{JSON.stringify(playlist.genres, null, 2)}</pre> */}
		</Card>
	);
};

export { Playlist };
