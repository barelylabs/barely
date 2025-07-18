'use client';

import type {
	GenreWithPlaylistStats,
	updatePlaylistPitchCampaign_LaunchSchema,
	updatePlaylistPitchCampaign_ScreeningSchema,
} from '@barely/validators';
import type { Control, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod/v4';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import deepEqual from 'fast-deep-equal';

import { useTRPC } from '@barely/api/app/trpc.react';

import { MultiSelectField } from '@barely/ui/forms/multiselect-field';
import { MultiSelect } from '@barely/ui/multiselect';

export function TrackGenresInput(props: { trackId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// const utils = api.useUtils();

	const { data: trackGenres } = useSuspenseQuery(
		trpc.track.byId.queryOptions(
			{
				trackId: props.trackId,
			},
			{
				select: track => track?.genres,
			},
		),
	);

	const { data: playlistGenreOptions, isFetching: isFetchingOptions } = useQuery(
		trpc.genre.allInPitchPlaylists.queryOptions(),
	);

	const { mutate: updateTrackGenres } = useMutation(
		trpc.track.updateGenres.mutationOptions({
			async onMutate(track) {
				// await utils.track.byId.cancel(props.trackId);
				await queryClient.cancelQueries(
					trpc.track.byId.queryFilter({ trackId: props.trackId }),
				);
				const previousTrack = queryClient.getQueryData(
					trpc.track.byId.queryKey({ trackId: props.trackId }),
				);

				if (!previousTrack) return;

				queryClient.setQueryData(
					trpc.track.byId.queryKey({ trackId: props.trackId }),
					old => {
						if (!old || deepEqual(old.genres, track.genres)) return old;
						return {
							...previousTrack,
							genres: track.genres,
						};
					},
				);

				return { previousTrack };
			},

			onError: (err, variables, context) => {
				if (context?.previousTrack) {
					queryClient.setQueryData(
						trpc.track.byId.queryKey({ trackId: props.trackId }),
						context.previousTrack,
					);
				}
			},
		}),
	);

	const values: GenreWithPlaylistStats[] =
		trackGenres ?
			trackGenres.map(tg => ({
				...tg,
				totalPlaylists: 0,
				totalPitchReviewers: 0,
			}))
		:	[];
	const options = playlistGenreOptions ?? [];

	return (
		<>
			<MultiSelect
				values={values}
				placeholder='Search for genres...'
				options={options}
				getItemId={item => item.name}
				isFetchingOptions={isFetchingOptions}
				displayValue={option => option.name}
				optTitle={option => option.name}
				optSubtitle={option => `${option.totalPlaylists} playlists`}
				onValuesChange={genres => {
					if (trackGenres === undefined) return;
					updateTrackGenres({
						trackId: props.trackId,
						genres: genres,
					});
				}}
			/>
		</>
	);
}

type TrackGenresFieldProps = {
	trackId: string;
} & (
	| {
			formType: 'playlist-pitch-screening';
			form: UseFormReturn<z.infer<typeof updatePlaylistPitchCampaign_ScreeningSchema>>;
			// control: Control<z.infer<typeof updatePlaylistPitchCampaign_ScreeningSchema>, unknown>;
	  }
	| {
			formType: 'playlist-pitch-launch';
			control: Control<z.infer<typeof updatePlaylistPitchCampaign_LaunchSchema>, unknown>;
	  }
);

export function TrackGenresField(props: TrackGenresFieldProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: playlistGenreOptions, isFetching: isFetchingOptions } = useQuery(
		trpc.genre.allInPitchPlaylists.queryOptions(),
	);

	const { mutate: updateTrackGenres } = useMutation(
		trpc.track.updateGenres.mutationOptions({
			onMutate: async updatedTrack => {
				await queryClient.cancelQueries(trpc.campaign.toScreen.queryFilter());

				const previousCampaigns = queryClient.getQueryData(
					trpc.campaign.toScreen.queryKey(),
				);
				if (!previousCampaigns) return { previousCampaigns };

				queryClient.setQueryData(trpc.campaign.toScreen.queryKey(), old => {
					if (!old?.[0]) return old;

					const updatedCampaign = {
						...old[0],
						track: {
							...old[0].track,
							genres: updatedTrack.genres,
						},
					};

					const updatedCampaigns = [updatedCampaign];
					if (old[1]) updatedCampaigns.push(old[1]);

					return updatedCampaigns;
				});

				return { previousCampaigns };
			},

			onError: (err, variables, context) => {
				if (context?.previousCampaigns) {
					queryClient.setQueryData(
						trpc.campaign.toScreen.queryKey(),
						context.previousCampaigns,
					);
				}
			},
		}),
	);

	const label = (
		<div className='flex flex-row items-center gap-1'>
			<span>Genres</span>
		</div>
	);

	switch (props.formType) {
		case 'playlist-pitch-screening':
			return (
				<MultiSelectField
					name='genres'
					label={label}
					placeholder='Search for genres...'
					control={props.form.control}
					// control={control}
					options={playlistGenreOptions ?? []}
					isFetchingOptions={isFetchingOptions}
					getItemId={item => item.id}
					displayValue={item => item.name}
					optTitle={option => option.name}
					optSubtitle={option => `${option.totalPlaylists ?? '?'} playlists`}
					onValuesChangeDebounced={genres => {
						updateTrackGenres({
							trackId: props.trackId,
							genres,
						});
					}}
					debounce={500}
					displayMode={'select'}
				/>
			);

		case 'playlist-pitch-launch':
			return (
				<MultiSelectField
					name='genres'
					label={label}
					description='These are the genres that your track will be pitched to.'
					placeholder='Search for genres...'
					control={props.control}
					options={playlistGenreOptions ?? []}
					isFetchingOptions={isFetchingOptions}
					getItemId={item => item.name}
					displayValue={item => item.name}
					optTitle={option => option.name}
					optSubtitle={option => `${option.totalPlaylists ?? '?'} playlists`}
					onValuesChangeDebounced={genres => {
						updateTrackGenres({
							trackId: props.trackId,
							genres,
						});
					}}
					debounce={500}
					displayMode={'display'}
				/>
			);
	}
}
