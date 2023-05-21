'use client';

import { Suspense, useEffect, useMemo } from 'react';

import Link from 'next/link';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { fieldAtom, useForm, useFormActions, useFormValues } from 'form-atoms';
import { atom, useAtomValue } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import * as r from 'remeda';

import {
	playlistPitchPlaceFieldAtom,
	playlistPitchRatingFieldAtom,
	playlistPitchReviewFieldAtom,
	playlistPitchReviewFormAtom,
} from '@barely/api/playlist-pitch-review/playlist-pitch-review-atoms';
import { type GetPlaylistsByUserId } from '@barely/api/playlist/playlist.node.fns';

import { InfoCard } from '@barely/ui/elements/card';
import { CheckboxField } from '@barely/ui/elements/checkbox';
import { Form, SubmitButton } from '@barely/ui/elements/form';
import { NumberField } from '@barely/ui/elements/number-field';
import { RatingField } from '@barely/ui/elements/rating';
import { SwitchField } from '@barely/ui/elements/switch';
import { TextField } from '@barely/ui/elements/text-field';

import { wait } from '@barely/utils/edge/wait';

import { api } from '~/client/trpc';

const playlistsAtom = atom<GetPlaylistsByUserId>([]);

const today = new Date();
const twoWeeks = new Date();
twoWeeks.setDate(twoWeeks.getDate() + 14);

const PlaylistPitchReviewForm = (props: { playlists: GetPlaylistsByUserId }) => {
	const utils = api.useContext();

	// 🌊 hydrate
	useHydrateAtoms(new Map([[playlistsAtom, props.playlists]]));

	const [parent] = useAutoAnimate();

	// 🔎 queries

	const [reviews] = api.node.playlistPitchReview.toReview.useSuspenseQuery(undefined);
	// const [userPlaylists] = api.node.playlist.byCurrentUser.useSuspenseQuery(undefined);

	const reviewId = useMemo(() => (reviews.length ? reviews[0].id : null), [reviews]);

	// 📝 form

	const form = useForm(playlistPitchReviewFormAtom);
	const formValues = useFormValues(playlistPitchReviewFormAtom);
	const formActions = useFormActions(playlistPitchReviewFormAtom);

	const playlists = useAtomValue(playlistsAtom);

	useEffect(() => {
		formActions.reset();
		formActions.updateFields(current => {
			return {
				...current,
				id: fieldAtom({ value: reviewId }),
				placements: playlists.map(p => ({
					playlistId: fieldAtom({ value: p.id }),
					playlistName: fieldAtom({ value: p.name }),
					place: fieldAtom({ value: false }),
					playlistPosition: fieldAtom({ value: 10 }),
					addDate: fieldAtom({ value: today }),
					removeDate: fieldAtom({ value: twoWeeks }),
				})),
			};
		});
	}, [formActions, playlists, reviewId]);

	// 🧬 mutations

	const submitReview = api.node.playlistPitchReview.submitReview.useMutation({
		onMutate: async () => {
			await utils.node.playlistPitchReview.toReview.cancel();
			const prevReviews = utils.node.playlistPitchReview.toReview.getData();
			const firstReview = prevReviews?.[0];

			// optimistically remove the first review from the list
			utils.node.playlistPitchReview.toReview.setData(undefined, old => {
				if (!old || !firstReview) return old;
				return old.filter(r => r.id !== firstReview.id);
			});

			if (firstReview) {
				utils.node.playlistPitchReview.toReview.setData(undefined, old => {
					if (!old) return old;
					return old.filter(r => r.id !== firstReview.id);
				});
				return { prevReviews };
			}
		},
		onError: (err, variables, context) => {
			if (context?.prevReviews) {
				utils.node.playlistPitchReview.toReview.setData(undefined, context.prevReviews);
			}
		},
	});

	const review = reviews?.[0];
	const track = reviews?.[0]?.campaign.track;

	const handleSubmitReview = async (values: typeof formValues) => {
		console.log('submitting');
		await wait(1000);
		const placements = values.placements
			.filter(p => p.place)
			.map(p => ({
				...r.omit(p, ['place', 'playlistName']),
				trackId: track.id,
				playlistId: p.playlistId,
				pitchReviewId: review.id,
			}));

		const stage: 'placed' | 'rejected' = values.place ? 'placed' : 'rejected';

		const formattedReview = {
			...r.omit(values, ['placements']),
			id: review.id,
			stage,
			placements,
		};
		console.log(`review data for ${review.id}`, formattedReview);

		submitReview.mutate(formattedReview);
	};

	return (
		<Form formAtom={playlistPitchReviewFormAtom} onSubmit={v => handleSubmitReview(v)}>
			<Suspense fallback={<div>Loading...</div>}>
				{reviewId ? (
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
						<RatingField fieldAtom={playlistPitchRatingFieldAtom} label='Rating' />
						<TextField fieldAtom={playlistPitchReviewFieldAtom} label='Review' />
						{<SwitchField fieldAtom={playlistPitchPlaceFieldAtom} label='Place' />}

						<ul ref={parent} className='flex flex-col space-y-3 items-start w-full'>
							{formValues.place &&
								formValues.placements.length &&
								formValues.placements.map((p, i) => {
									const placementField = form.fieldAtoms.placements[i];

									return (
										<div className='flex flex-row space-x-2' key={`playlist.${i}`}>
											<CheckboxField
												fieldAtom={placementField.place}
												id={`playlist.${i}`}
												label={p.playlistName}
											/>
											{p.place && (
												<NumberField
													size='sm'
													fieldAtom={placementField.playlistPosition}
													className='w-16'
												/>
											)}
										</div>
									);
								})}
						</ul>
						<SubmitButton formAtom={playlistPitchReviewFormAtom}>Submit</SubmitButton>
					</InfoCard>
				) : (
					<div>All done 🌞</div>
				)}

				{/* <pre> {JSON.stringify(formValues, null, 2)}</pre> */}
			</Suspense>
		</Form>
	);
};

export { PlaylistPitchReviewForm };
