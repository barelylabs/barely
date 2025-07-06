'use client';

import { useState } from 'react';
import { PLAYLIST_PITCH_SETTINGS } from '@barely/const';
import { useZodForm } from '@barely/hooks';
import { playlistPitchCostInDollars } from '@barely/utils';
import { updatePlaylistPitchCampaign_LaunchSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
// import { api } from '@barely/server/api/react';

import { Form } from '@barely/ui/forms/form';
import { SliderField } from '@barely/ui/forms/slider-field';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { TrackGenresField } from '~/app/(dash)/track/components/track-genres-input';

interface LaunchPlaylistPitchFormProps {
	campaignId: string;
}

export function LaunchPlaylistPitchForm(props: LaunchPlaylistPitchFormProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// 📡 todo: subscriptions

	// 💻 client state

	const [creatingCheckoutSession, setCreatingCheckoutSession] = useState(false);

	// 🔎 queries
	const { data: campaign } = useSuspenseQuery(
		trpc.campaign.byId.queryOptions({ campaignId: props.campaignId }),
	);

	const { data: maxReach } = useSuspenseQuery(
		trpc.playlist.countByGenres.queryOptions({
			genreIds: campaign.track.genres.map(g => g.id),
		}),
	);

	const minCuratorReach = PLAYLIST_PITCH_SETTINGS.minCuratorReach;
	const maxCuratorReach = maxReach.totalCurators;

	// 🧬 mutations
	const { mutate: updateCampaign } = useMutation(
		trpc.campaign.update.mutationOptions({
			async onMutate(campaignUpdate) {
				await queryClient.cancelQueries(
					trpc.campaign.byId.queryFilter({ campaignId: props.campaignId }),
				);

				const previousCampaign = queryClient.getQueryData(
					trpc.campaign.byId.queryKey({ campaignId: props.campaignId }),
				);
				if (!previousCampaign) return;

				queryClient.setQueryData(
					trpc.campaign.byId.queryKey({ campaignId: props.campaignId }),
					old => {
						if (!old) return;
						return {
							...old,
							curatorReach: campaignUpdate.curatorReach ?? null,
						};
					},
				);

				return { previousCampaign };
			},

			onError(err, campaignUpdate, ctx) {
				if (ctx) {
					queryClient.setQueryData(
						trpc.campaign.byId.queryKey({ campaignId: props.campaignId }),
						ctx.previousCampaign,
					);
				}
			},

			async onSuccess() {
				await queryClient.invalidateQueries(
					trpc.campaign.byId.queryFilter({ campaignId: props.campaignId }),
				);
			},
		}),
	);

	const createCheckout = useMutation(
		trpc.campaign.createPlaylistPitchCheckoutLink.mutationOptions({
			onMutate: () => setCreatingCheckoutSession(true),
			onSuccess: checkoutLink => {
				if (checkoutLink) window.location.replace(checkoutLink);
			},
		}),
	);

	// form
	const form = useZodForm({
		schema: updatePlaylistPitchCampaign_LaunchSchema,
		values: {
			id: props.campaignId,
			genres: campaign.track.genres,
			reach: campaign.curatorReach ?? minCuratorReach,
		},
	});

	function handleCheckout() {
		return createCheckout.mutate({
			campaignId: props.campaignId,
		});
	}

	// derived state
	const reach = form.watch('reach');
	const estimatedPlaylists = reach * maxReach.averagePlaylistsPerCurator;
	const campaignBudget = playlistPitchCostInDollars({
		curatorReach: reach,
	});

	return (
		<Form form={form} onSubmit={handleCheckout}>
			<TrackGenresField
				formType='playlist-pitch-launch'
				control={form.control}
				trackId={campaign.trackId}
			/>

			<SliderField
				control={form.control}
				name='reach'
				label='Curator Reach'
				description='How many curators do you want to pitch your track to?'
				min={minCuratorReach}
				max={maxCuratorReach}
				step={1}
				onValueChangeDebounced={reach =>
					updateCampaign({
						id: props.campaignId,
						curatorReach: reach,
					})
				}
			/>

			<div className='flex flex-row gap-3 pb-3 pt-4'>
				<Badge shape='rectangle' size='lg' variant='outline' grow>
					<Icon.users className='h-5 w-5' />
					<span>{reach} curators</span>
				</Badge>

				<Badge shape='rectangle' size='lg' variant='outline' grow>
					<Icon.playlist className='h-5 w-5' />
					<span>{`~${estimatedPlaylists} playlists`}</span>
				</Badge>

				<Badge shape='rectangle' size='lg' variant='outline' grow>
					<Icon.coins className='h-5 w-5' />
					<span>${campaignBudget} budget</span>
				</Badge>
			</div>

			<Button
				// variant='success'
				onClick={handleCheckout}
				loading={creatingCheckoutSession}
				fullWidth
			>
				Launch my campaign 🚀
			</Button>

			<div className='-top-10 flex flex-row items-start gap-1 text-muted-foreground'>
				<Icon.shield className='h-fit stroke-1 py-[1px]' />
				<Text variant='xs/light' muted>
					While you are never guaranteed placements, you will always receive feedback. At
					the end of your campaign, you will receive a full refund for any incomplete
					reviews.
				</Text>
			</div>

			{/* <pre>{JSON.stringify(form.watch(), null, 2)}</pre> */}
		</Form>
	);
}
