'use client';

import type { z } from 'zod/v4';
import { useEffect } from 'react';
import { useSubscribe, useZodForm } from '@barely/hooks';
import { updatePlaylistPitchCampaign_ScreeningSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { InfoCard } from '@barely/ui/card';
import { Form } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { TrackGenresField } from '~/app/(dash)/track/components/track-genres-input';

export function PlaylistPitchScreenForm() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: campaigns } = useSuspenseQuery({
		...trpc.campaign.toScreen.queryOptions(undefined),
		staleTime: Infinity,
	});

	const campaign = campaigns[0];

	const { data: _genresCount } = useSuspenseQuery({
		...trpc.playlist.countByGenres.queryOptions({
			genreIds: campaign?.track.genres.map(g => g.id) ?? [],
		}),
	});

	const genresCount =
		campaign?.track.genres.length ?
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
			await queryClient.invalidateQueries({
				queryKey: trpc.campaign.toScreen.queryKey(),
			});
		},
	});

	const form = useZodForm({
		schema: updatePlaylistPitchCampaign_ScreeningSchema,
		values: {
			id: campaign?.id ?? '',
			stage: 'approved' as const,
			screeningMessage: campaign?.screeningMessage ?? '',
			genres: !campaign ? [] : campaign.track.genres,
		},
		resetOptions: { keepDirtyValues: true },
	});

	useEffect(() => {
		if (form.formState.errors.genres?.message) {
			form.trigger('genres').catch(err => console.error(err));
		}
	}, [genresCount.totalCurators, form]);

	const { mutate: updateCampaign } = useMutation({
		...trpc.campaign.update.mutationOptions({
			onMutate: async updatedCampaign => {
				await queryClient.cancelQueries({
					queryKey: trpc.campaign.toScreen.queryKey(),
				});

				const previousCampaigns = queryClient.getQueryData(
					trpc.campaign.toScreen.queryKey(),
				);

				queryClient.setQueryData(trpc.campaign.toScreen.queryKey(), old => {
					if (!old?.[0]) return old;

					const updatedCampaigns = [{ ...old[0], ...updatedCampaign }]; //, old?.[1]];
					if (old[1]) updatedCampaigns.push(old[1]);

					return updatedCampaigns;
				});

				return { previousCampaigns };
			},
		}),

		onError: (err, variables, context) => {
			if (context?.previousCampaigns) {
				queryClient.setQueryData(
					trpc.campaign.toScreen.queryKey(),
					context.previousCampaigns,
				);
			}
		},

		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: trpc.campaign.toScreen.queryKey(),
			});
		},
	});

	const { mutate: submitScreening } = useMutation({
		...trpc.campaign.submitPlaylistPitchScreening.mutationOptions({
			onMutate: async () => {
				await queryClient.cancelQueries({
					queryKey: trpc.campaign.toScreen.queryKey(),
				});

				const previousCampaigns = queryClient.getQueryData(
					trpc.campaign.toScreen.queryKey(),
				);
				const firstCampaign = previousCampaigns?.[0];

				// optimistically remove the first campaign from the list
				queryClient.setQueryData(trpc.campaign.toScreen.queryKey(), old => {
					if (!old || !firstCampaign) return old;
					return old.filter(c => c.id !== firstCampaign.id);
				});

				if (firstCampaign) {
					queryClient.setQueryData(trpc.campaign.toScreen.queryKey(), old => {
						if (!old) return old;
						return old.filter(c => c.id !== firstCampaign.id);
					});
				}

				form.reset();

				return { previousCampaigns };
			},

			onSuccess: () => {
				return queryClient.invalidateQueries({
					queryKey: trpc.campaign.toScreen.queryKey(),
				});
			},

			onError: (err, variables, context) => {
				if (context?.previousCampaigns) {
					queryClient.setQueryData(
						trpc.campaign.toScreen.queryKey(),
						context.previousCampaigns,
					);
				}
			},

			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.campaign.toScreen.queryKey(),
				});
			},
		}),
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
								{genresCount.totalPlaylists} curator
								{genresCount.totalCurators && genresCount.totalCurators > 1 && 's'}
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
							trackId={campaign.track.id}
							form={form}
						/>

						{/* <MultiSelectField
							name='genres'
							label={<div className='flex flex-row items-center gap-1'>
								<span>Genres</span>
							</div>}
							placeholder='Search for genres...'
							control={form.control}
							// control={control}
							options={playlistGenreOptions ?? []}
							isFetchingOptions={isFetchingOptions}
							getItemId={item => item.id}
							displayValue={item => item.name}
							optTitle={option => option.name}
							optSubtitle={option => `${option.totalPlaylists ?? '?'} playlists`}
							onValuesChangeDebounced={genres => {
								updateTrackGenres({
									trackId: campaign.track.id,
									genres,
								});
							}}
							debounce={500}
							displayMode={'select'}
						/> */}

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
