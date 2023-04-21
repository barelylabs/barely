'use client';

import { Suspense } from 'react';

import Link from 'next/link';

import { Separator, TextField } from '@barely/ui';
import { formAtom, useFormActions, useFormValues } from 'form-atoms';
import { useHydrateAtoms } from 'jotai/utils';

import { screeningMessageFieldAtom } from '@barely/api/campaign/campaign.atoms';
import { type CampaignWithTrackAndMetadata } from '@barely/api/campaign/campaign.node.fns';

import { Button } from '@barely/ui/elements/button';
import { InfoCard } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';

import {
	minReachAtom,
	selectedTrackGenresFieldAtom,
	TrackGenresInput,
} from '~/app/(dash)/components/track-genres-input';
import { api } from '~/client/trpc';

const screeningFormAtom = formAtom({
	screeningMessage: screeningMessageFieldAtom,
	trackGenres: selectedTrackGenresFieldAtom,
});

const PitchScreenForm = (props: { initialCampaigns: CampaignWithTrackAndMetadata[] }) => {
	const utils = api.useContext();

	// 🌊 hydrate
	useHydrateAtoms(new Map([[minReachAtom, 3]]));

	// const initTrackGenres = props.initialCampaigns[0].track?.trackGenres;
	// const genres = initTrackGenres ? initTrackGenres.map(tg => tg.genre) : [];

	// useFieldInitialValue(selectedTrackGenresFieldAtom, genres);
	// useHydrateAtoms(new Map([[selectedTrackGenresFieldAtom, props.initialCampaigns[0].track?.trackGenres ?? []]]))

	const { data: campaigns, isLoading } = api.node.campaign.toScreen.useQuery(
		// const [campaigns, campaignsQuery] = api.node.campaign.toScreen.useSuspenseQuery(
		undefined,
		{
			initialData: props.initialCampaigns,
			staleTime: 1000 * 60 * 5,
		},
	);

	const formValues = useFormValues(screeningFormAtom);
	const formActions = useFormActions(screeningFormAtom);
	// const formActions = useFormActions(screeningFormAtom);
	// const screeningMessageActions = useFieldActions(screeningMessageFieldAtom);
	// const trackGenresActions = useFieldActions(selectedTrackGenresFieldAtom);

	// useEffect(() => {
	// 	if (campaigns.length) {
	// 		const trackGenres = campaigns[0].track?.trackGenres;
	// 		const genres = trackGenres ? trackGenres.map(tg => tg.genre) : [];
	// 		trackGenresActions.setValue(genres);
	// 		screeningMessageActions.setValue(campaigns[0].screeningMessage ?? '');
	// 	}
	// }, [campaigns, screeningMessageActions, trackGenresActions]);

	const updateCampaign = api.node.campaign.update.useMutation({
		onMutate: async () => {
			await utils.node.campaign.toScreen.cancel();

			const previousCampaigns = utils.node.campaign.toScreen.getData();
			const firstCampaign = previousCampaigns?.[0];

			// optimistically remove the first campaign from the list
			utils.node.campaign.toScreen.setData(undefined, old => {
				if (!old || !firstCampaign) return old;
				return old.filter(c => c.id !== firstCampaign.id);
			});

			formActions.reset();

			if (firstCampaign) {
				utils.node.campaign.toScreen.setData(undefined, old => {
					if (!old) return old;
					return old.filter(c => c.id !== firstCampaign.id);
				});

				return { previousCampaigns };
			}
		},

		onSuccess: () => {
			// todo
			// setSelectedGenres([]);
			// setScreeningMessage('');
			return utils.node.campaign.toScreen.invalidate();
		},

		onError: (err, variables, context) => {
			if (context?.previousCampaigns) {
				utils.node.campaign.toScreen.setData(undefined, context.previousCampaigns);
			}
		},
	});

	const campaign = campaigns?.[0];
	const track = campaigns?.[0]?.track;

	const handleScreenCampaign = (stageDecision: 'approved' | 'rejected') => {
		if (!campaign.id || !track) return;

		updateCampaign.mutate({
			id: campaign.id,
			screeningMessage: formValues.screeningMessage,
			stage: stageDecision,
		});
	};

	return (
		<div className='w-full'>
			{isLoading && <Text>Loading...</Text>}
			{!isLoading && !track && <Text>All done. 🌞</Text>}
			{!!campaign && !!track && (
				<Suspense fallback={<Text>Loading InfoCard...</Text>}>
					<InfoCard
						title={track.name}
						subtitle={track.team.name}
						imageUrl={track.imageUrl}
						imageAlt={`artwork for ${track.name}`}
						stats={
							<Link
								href={`https://open.spotify.com/track/${track.spotifyId ?? ''}`}
								target='_blank'
							>
								Listen
							</Link>
						}
					>
						<Separator />

						<TrackGenresInput initialTrack={track} />

						<TextField fieldAtom={screeningMessageFieldAtom} label='Quick message' />

						<div className='flex flow-row w-full space-x-4 pt-4'>
							<Button fullWidth onClick={() => handleScreenCampaign('approved')}>
								<Icon.thumbsUp />
							</Button>

							<Button
								variant='subtle'
								fullWidth
								onClick={() => handleScreenCampaign('rejected')}
							>
								<Icon.thumbsDown />
							</Button>
						</div>
					</InfoCard>
				</Suspense>
			)}
			{/* screening message: {formValues.screeningMessage}
			<br />
			genres:
			{formValues.trackGenres.map((g, index) => (
				<Text key={`${g.name}.${index}`}>{g.name}</Text>
			))} */}
		</div>
	);
};

export { PitchScreenForm };
