'use client';

import type { z } from 'zod/v4';
import { useEffect } from 'react';
import { useTRPC } from '@barely/lib/server/api/react';
import { updatePlaylistPitchCampaign_ScreeningSchema } from '@barely/lib/server/routes/campaign/campaign.schema';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useSubscribe } from '@barely/hooks/use-subscribe';
import { useZodForm } from '@barely/hooks/use-zod-form';

import { Button } from '@barely/ui/elements/button';
import { InfoCard } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';
import { Form } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { TrackGenresField } from '~/app/(dash)/track/components/track-genres-input';

export function PlaylistPitchScreenForm() {
	const trpc = useTRPC();
	const utils = trpc.useUtils();

	const { data: campaigns } = useSuspenseQuery({
		...trpc.campaign.toScreen.queryOptions(undefined),
		staleTime: Infinity,
	});

	const campaign = campaigns?.[0];

	const { data: _genresCount } = useQuery({
		...trpc.playlist.countByGenres.queryOptions({
			genreIds: campaign?.track.genres.map(g => g.id) ?? [],
		}),
		enabled: !!campaign?.track.genres?.length,
	});

	const genresCount =
		campaign?.track.genres?.length ?
			_genresCount
		:	{
				totalPlaylists: 0,
				totalCurators: 0,
			};

	useSubscribe({
		subscribeTo: [
			{
				channel: 'campaign',
				ids: campaigns.map(c => c.id),
			},
			{
				channel: 'track',
				ids: campaigns.map(c => c.track.id),
			},
		],
		callback: async () => {
			await utils.campaign.toScreen.invalidate();
		},
	});

	const form = useZodForm({
		schema: updatePlaylistPitchCampaign_ScreeningSchema,
		values: {
			id: campaign?.id ?? '',
			stage: 'approved',
			screeningMessage: campaign?.screeningMessage ?? '',
			genres: !campaign ? [] : campaign.track.genres,
		},
	});

	useEffect(() => {
		if (form.formState.errors.genres?.message) {
			form.trigger('genres').catch(err => console.error(err));
		}
	}, [genresCount?.totalCurators, form]);

	const { mutate: updateCampaign } = useMutation({
		...trpc.campaign.update.mutationOptions(),
		onMutate: async updatedCampaign => {
			await utils.campaign.toScreen.cancel();

			const previousCampaigns = utils.campaign.toScreen.getData();

			utils.campaign.toScreen.setData(undefined, old => {
				if (!old?.[0]) return old;

				const updatedCampaigns = [{ ...old[0], ...updatedCampaign }]; //, old?.[1]];
				if (old?.[1]) updatedCampaigns.push(old?.[1]);

				return updatedCampaigns;
			});

			return { previousCampaigns };
		},

		onError: (err, variables, context) => {
			if (context?.previousCampaigns) {
				utils.campaign.toScreen.setData(undefined, context.previousCampaigns);
			}
		},

		onSettled: async () => {
			await utils.campaign.toScreen.invalidate();
		},
	});

	const { mutate: submitScreening } = useMutation({
		...trpc.campaign.submitPlaylistPitchScreening.mutationOptions(),
		onMutate: async () => {
			await utils.campaign.toScreen.cancel();

			const previousCampaigns = utils.campaign.toScreen.getData();
			const firstCampaign = previousCampaigns?.[0];

			// optimistically remove the first campaign from the list
			utils.campaign.toScreen.setData(undefined, old => {
				if (!old || !firstCampaign) return old;
				return old.filter(c => c.id !== firstCampaign.id);
			});

			if (firstCampaign) {
				utils.campaign.toScreen.setData(undefined, old => {
					if (!old) return old;
					return old.filter(c => c.id !== firstCampaign.id);
				});
			}

			form.reset();

			return { previousCampaigns };
		},

		onSuccess: () => {
			return utils.campaign.toScreen.invalidate();
		},

		onError: (err, variables, context) => {
			if (context?.previousCampaigns) {
				utils.campaign.toScreen.setData(undefined, context.previousCampaigns);
			}
		},
	});

	const handleScreenCampaign = (
		data: z.infer<typeof updatePlaylistPitchCampaign_ScreeningSchema>,
	) => {
		submitScreening({
			id: data.id,
			stage: data.stage,
			genres: data.genres,
			screeningMessage: data.screeningMessage,
		});
	};

	return (
		<div className='w-full'>
			{!campaign && <Text>All done. 🌞</Text>}

			{!!campaign && (
				<InfoCard
					title={campaign.track.name}
					subtitle={campaign.track.workspace.name}
					imageUrl={campaign.track.imageUrl}
					imageAlt={`artwork for ${campaign.track.name}`}
					stats={
						<div className='flex flex-col gap-2'>
							<Text variant='xs/normal' subtle>
								{genresCount?.totalPlaylists} curator
								{genresCount?.totalCurators && genresCount?.totalCurators > 1 && 's'}
							</Text>
							<Button
								variant='icon'
								href={`https://open.spotify.com/track/${campaign.track.spotifyId ?? ''}`}
								target='_blank'
								look='muted'
								size='md'
								pill
							>
								<Icon.spotify />
							</Button>
						</div>
					}
				>
					<Form form={form} onSubmit={handleScreenCampaign}>
						<TrackGenresField
							formType='playlist-pitch-screening'
							control={form.control}
							trackId={campaign.track.id}
						/>

						<TextField
							control={form.control}
							name='screeningMessage'
							label='Quick message'
							onChangeDebounced={e =>
								updateCampaign({
									id: campaign.id,
									screeningMessage: e.target.value,
								})
							}
						/>

						<div className='flow-row flex w-full space-x-4 pt-4'>
							<Button
								look='primary'
								fullWidth
								onClick={() => {
									form.setValue('stage', 'approved');
									form
										.handleSubmit(handleScreenCampaign)()
										.catch(err => console.error(err));
								}}
							>
								<Icon.thumbsUp />
							</Button>

							<Button
								look='outline'
								fullWidth
								onClick={() => {
									form.setValue('stage', 'rejected');
									form
										.handleSubmit(handleScreenCampaign)()
										.catch(err => console.error(err));
								}}
							>
								<Icon.thumbsDown />
							</Button>
						</div>
					</Form>
				</InfoCard>
			)}
			{/* <pre>{JSON.stringify(form.watch(), null, 2)}</pre> */}
		</div>
	);
}

// function TrackGenresField(props: {
// 	trackId: string;
// 	control: Control<UpdatePlaylistPitchCampaign_ScreeningSchema, unknown>;
// }) {
// 	const utils = api.useContext();

// 	const { data: playlistGenreOptions, isFetching: isFetchingOptions } =
// 		api.genre.allInPitchPlaylists.useQuery();

// 	const { mutate: updateTrackGenres, status } = api.track.updateGenres.useMutation({
// 		async onMutate() {
// 			await utils.campaign.toScreen.cancel();

// 			const previousCampaigns = utils.campaign.toScreen.getData();
// 			if (!previousCampaigns) return { previousCampaigns };

// 			utils.campaign.toScreen.setData(undefined, old => {
// 				if (!old || !old?.[0]) return old;

// 				const updatedCampaigns = [{ ...old[0] }];
// 				if (old?.[1]) updatedCampaigns.push(old?.[1]);

// 				return updatedCampaigns;
// 			});

// 			return { previousCampaigns };
// 		},

// 		onError: (err, variables, context) => {
// 			if (context?.previousCampaigns) {
// 				utils.campaign.toScreen.setData(undefined, context.previousCampaigns);
// 			}
// 		},

// 		onSettled: (err, variables, context) => {
// 			console.log('status => ', status);
// 			// utils.campaign.toScreen.invalidate();
// 		},
// 	});

// 	const label = (
// 		<div className='flex flex-row items-center gap-1'>
// 			<span>Genres</span>
// 		</div>
// 	);

// 	return (
// 		<MultiSelectField
// 			name='genres'
// 			label={label}
// 			placeholder='Search for genres...'
// 			control={props.control}
// 			options={playlistGenreOptions ?? []}
// 			isFetchingOptions={isFetchingOptions}
// 			getItemId={item => item.name}
// 			displayValue={item => item.name}
// 			optTitle={option => option.name}
// 			optSubtitle={option => `${option.totalPlaylists ?? '?'} playlists`}
// 			valuesOnChangeDebounced={genres => {
// 				updateTrackGenres({
// 					trackId: props.trackId,
// 					genres: genres.map(genre => genre.name),
// 				});
// 			}}
// 			debounce={500}
// 			displayMode={'select'}
// 		/>
// 	);
// }
