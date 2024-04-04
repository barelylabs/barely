'use client';

import { useState } from 'react';
import { updatePlaylistPitchCampaign_LaunchSchema } from '@barely/lib/server/routes/campaign/campaign.schema';
import { playlistPitchSettings } from '@barely/lib/server/routes/campaign/campaign.settings';
import { api } from '@barely/server/api/react';

import { useZodForm } from '@barely/hooks/use-zod-form';

import { Badge } from '@barely/ui/elements/badge';
import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';
import { Form } from '@barely/ui/forms';
import { SliderField } from '@barely/ui/forms/slider-field';

import { playlistPitchCostInDollars } from '@barely/utils/campaign';

import { TrackGenresField } from '~/app/(dash)/track/components/track-genres-input';

interface LaunchPlaylistPitchFormProps {
	campaignId: string;
}

export function LaunchPlaylistPitchForm(props: LaunchPlaylistPitchFormProps) {
	const utils = api.useContext();

	// 📡 todo: subscriptions

	// 💻 client state

	const [creatingCheckoutSession, setCreatingCheckoutSession] = useState(false);

	// 🔎 queries
	const [campaign] = api.campaign.byId.useSuspenseQuery(props.campaignId);

	const [maxReach] = api.playlist.countByGenres.useSuspenseQuery({
		genreIds: campaign.track.genres.map(g => g.id),
	});

	const minCuratorReach = playlistPitchSettings.minCuratorReach;
	const maxCuratorReach = maxReach.totalCurators;

	// 🧬 mutations
	const { mutate: updateCampaign } = api.campaign.update.useMutation({
		async onMutate(campaignUpdate) {
			await utils.campaign.byId.cancel();
			const previousCampaign = utils.campaign.byId.getData(props.campaignId);

			utils.campaign.byId.setData(props.campaignId, old => {
				if (!old) return;
				return {
					...old,
					curatorReach: campaignUpdate.curatorReach ?? null,
				};
			});

			return { previousCampaign };
		},

		onError(err, campaignUpdate, ctx) {
			ctx && utils.campaign.byId.setData('campaign.byId', ctx.previousCampaign);
		},

		async onSuccess() {
			await utils.campaign.byId.invalidate();
		},
	});

	const createCheckout = api.campaign.createPlaylistPitchCheckoutLink.useMutation({
		onMutate: () => setCreatingCheckoutSession(true),
		onSuccess: checkoutLink => {
			if (checkoutLink) window.location.replace(checkoutLink);
		},
	});

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
				<Badge rectangle size='lg' variant='outline' grow>
					<Icon.users className='h-5 w-5' />
					<span>{reach} curators</span>
				</Badge>

				<Badge rectangle size='lg' variant='outline' grow>
					<Icon.playlist className='h-5 w-5' />
					<span>{`~${estimatedPlaylists} playlists`}</span>
				</Badge>

				<Badge rectangle size='lg' variant='outline' grow>
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
