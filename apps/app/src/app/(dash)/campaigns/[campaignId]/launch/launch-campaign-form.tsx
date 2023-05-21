'use client';

import { Suspense, useEffect, useState } from 'react';

import { formAtom, useFieldInitialValue } from 'form-atoms';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

import { playlistPitchCostInDollars } from '@barely/api/campaign/campaign.edge.fns';
import { CampaignWithTrackAndMetadata } from '@barely/api/campaign/campaign.node.fns';
import { CampaignUpdateSchema } from '@barely/api/campaign/campaign.schema';
import { pageSessionAtom } from '@barely/atoms/session.atom';
import { useSubscribeToObject } from '@barely/hooks/use-subscribe-to-object';
import { useDebouncedFieldMutation } from '@barely/lib/hooks/use-debounced-mutation';

import { Badge } from '@barely/ui/elements/badge';
import { Button } from '@barely/ui/elements/button';
import { Form } from '@barely/ui/elements/form';
import { Icon } from '@barely/ui/elements/icon';
import { Skeleton } from '@barely/ui/elements/skeleton';

import {
	curatorReachFieldAtom,
	CuratorReachInput,
} from '~/app/(dash)/campaigns/[campaignId]/launch/curator-reach-input';
import {
	minReachAtom,
	selectedTrackGenresFieldAtom,
	TrackGenresInput,
} from '~/app/(dash)/components/track-genres-input';
import { campaignChannelAtom } from '~/atoms/channel.atoms';
import { api } from '~/client/trpc';

// ⚛️ atoms

const maxCuratorReachAtom = atom(0);
const maxPlaylistReachAtom = atom(0);
const estimatedPlaylistReachAtom = atom(get => {
	const curatorReach = get(get(curatorReachFieldAtom).value)[0];
	const estimatedPlaylists =
		(curatorReach * get(maxPlaylistReachAtom)) / get(maxCuratorReachAtom);
	return Math.ceil(estimatedPlaylists);
});

const campaignBudgetAtom = atom(get =>
	playlistPitchCostInDollars({ curatorReach: get(get(curatorReachFieldAtom).value)[0] }),
);

// const curatorReachAtom = atom(0);

const selectedGenresNamesAtom = atom(get =>
	get(get(selectedTrackGenresFieldAtom).value).map(g => g.name),
);

const launchCampaignFormAtom = formAtom({
	selectedGenres: selectedTrackGenresFieldAtom,
	curatorReach: curatorReachFieldAtom,
});

interface LaunchCampaignProps {
	initialCampaign: CampaignWithTrackAndMetadata;
}

const LaunchCampaignForm = ({ initialCampaign }: LaunchCampaignProps) => {
	const utils = api.useContext();

	// 📡 subscriptions

	useSubscribeToObject({
		channelAtom: campaignChannelAtom,
		id: initialCampaign.id,
		pageSessionAtom,
		callback: async () => await utils.node.campaign.byId.invalidate(initialCampaign.id),
	});

	// 🌊 hydrate

	useHydrateAtoms(new Map([[minReachAtom, 3]]));

	useFieldInitialValue(curatorReachFieldAtom, [initialCampaign.curatorReach ?? 3]);
	// useFieldInitialValue(curatorReachFieldAtom, [initialCampaign.curatorReach])
	// useHydrateAtoms(new Map([[curatorReachAtom, initialCampaign.curatorReach]]));

	// 💻 client state

	const [creatingCheckoutSession, setCreatingCheckoutSession] = useState(false);

	// 🔎 queries

	const [campaign] = api.node.campaign.byId.useSuspenseQuery(initialCampaign.id, {
		initialData: initialCampaign,
		staleTime: Infinity,
		onSuccess: campaign => {
			if (campaign.curatorReach && campaign.curatorReach !== curatorReach[0])
				setCuratorReach([campaign.curatorReach]);

			console.log('selectedGenres => ', selectedGenresNames);
			console.log(
				'campaign.track?.trackGenres.map(tg => tg.genre) => ',
				campaign.track?.trackGenres.map(tg => tg.genre),
			);
		},
	});

	const selectedGenresNames = useAtomValue(selectedGenresNamesAtom);

	const [maxReach] = api.node.playlist.countByGenres.useSuspenseQuery(
		selectedGenresNames,
		{
			staleTime: 1000 * 60 * 5,
			keepPreviousData: true,
		},
	);

	const minCuratorReach = useAtomValue(minReachAtom);
	const maxCuratorReach = useAtomValue(maxCuratorReachAtom);
	const [, setMaxCuratorReach] = useAtom(maxCuratorReachAtom);
	const [, setMaxPlaylistReach] = useAtom(maxPlaylistReachAtom);

	useEffect(() => {
		if (maxReach) {
			setMaxCuratorReach(maxReach.totalCurators);
			setMaxPlaylistReach(maxReach.totalPlaylists);
		}
	}, [maxReach, setMaxCuratorReach, setMaxPlaylistReach]);

	// 🧬 mutations

	const campaignMutation = api.node.campaign.update.useMutation({
		async onMutate(campaignUpdate) {
			await utils.node.campaign.byId.cancel();
			const previousCampaign = utils.node.campaign.byId.getData(initialCampaign.id);

			utils.node.campaign.byId.setData(initialCampaign.id, old => {
				if (!old) return;
				return {
					...old,
					curatorReach: campaignUpdate.curatorReach ?? null,
				};
			});

			return { previousCampaign };
		},

		onError(err, campaignUpdate, ctx) {
			ctx && utils.node.campaign.byId.setData('campaign.byId', ctx.previousCampaign);
		},
	});

	const [curatorReach, setCuratorReach] = useDebouncedFieldMutation({
		atom: curatorReachFieldAtom,
		currentQueryValue: () => {
			const campaign = utils.node.campaign.byId.getData(initialCampaign.id);
			if (campaign === undefined) return [minCuratorReach];
			if (campaign?.curatorReach === null) return [minCuratorReach];
			return [campaign.curatorReach];
		},
		mutate: campaignMutation.mutate,
		mutateInput: (reach: number[]) => {
			const updateCampignInput: CampaignUpdateSchema = {
				id: initialCampaign.id,
				curatorReach: reach[0],
			};
			return updateCampignInput;
		},
	});
	// const [curatorReach, setCuratorReach] = useDebouncedMutation({
	// 	atom: curatorReachAtom,
	// 	currentQueryValue: () => {
	// 		const campaign = utils.node.campaign.byId.getData(initialCampaign.id);
	// 		if (campaign === undefined) return minCuratorReach;
	// 		if (campaign?.curatorReach === null) return minCuratorReach;
	// 		return campaign.curatorReach;
	// 	},
	// 	mutate: campaignMutation.mutate,
	// 	mutateInput: (reach: number) => {
	// 		const updateCampignInput: CampaignUpdateSchema = {
	// 			id: initialCampaign.id,
	// 			curatorReach: reach,
	// 		};
	// 		return updateCampignInput;
	// 	},
	// });

	// campaignMutation.mutate({
	// 	id: initialCampaign.id,
	// 	curatorReach: 10,
	// });

	const createCheckout = api.node.campaign.createPlaylistPitchCheckoutLink.useMutation({
		onMutate: () => setCreatingCheckoutSession(true),
		onSuccess: checkoutLink => {
			console.log('checkoutLink', checkoutLink);
			if (checkoutLink) window.location.replace(checkoutLink);
		},
	});

	// 🚀 handle changes

	const handleCheckout = () => {
		if (!campaign?.id) return;
		return createCheckout.mutate({
			campaignId: campaign.id,
		});
	};

	// 🧮 computed values

	const estimatedPlaylists = useAtomValue(estimatedPlaylistReachAtom);
	const campaignBudget = useAtomValue(campaignBudgetAtom);

	return (
		<Form formAtom={launchCampaignFormAtom} onSubmit={() => console.log('submitting')}>
			<TrackGenresInput initialTrack={initialCampaign.track} />

			<CuratorReachInput
				minCurators={minCuratorReach}
				maxCurators={maxCuratorReach}
				// curatorReach={curatorReach}
				// onCuratorReachChange={reach => {
				// 	return setCuratorReach(reach);
				// }}
			/>

			<div className='flex flex-row gap-3 pt-4 pb-3'>
				<Badge rectangle size='lg' variant='outline' grow>
					<Icon.users className='w-5 h-5' />
					<span>{curatorReach} curators</span>
				</Badge>

				<Badge rectangle size='lg' variant='outline' grow>
					<Icon.playlist className='w-5 h-5' />
					<Suspense fallback={<span>...</span>}>
						<span className='flex flex-row items-center'>
							{isNaN(estimatedPlaylists) ? (
								<Skeleton className='h-[15px] w-[100px]' />
							) : (
								`~${estimatedPlaylists} playlists`
							)}
						</span>
					</Suspense>
				</Badge>

				<Badge rectangle size='lg' variant='outline' grow>
					<Icon.coins className='w-5 h-5' />
					<span>${campaignBudget} budget</span>
				</Badge>
			</div>
			<Button
				variant='success'
				onClick={handleCheckout}
				loading={creatingCheckoutSession}
			>
				Launch my campaign 🚀
			</Button>
		</Form>
	);
};

export { LaunchCampaignForm };
