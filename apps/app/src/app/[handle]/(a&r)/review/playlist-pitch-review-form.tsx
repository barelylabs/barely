// 'use client';

// import { Suspense, useMemo } from 'react';
// import Link from 'next/link';
// import { submitPlaylistPitchReviewSchema } from '@barely/server/playlist-pitch-review-schema';
// import { useAutoAnimate } from '@formkit/auto-animate/react';
// import { useFieldArray } from 'react-hook-form';
// import * as r from 'remeda';

// import { api } from '@barely/api/react';

// import { useZodForm } from '@barely/hooks/use-zod-form';

// import { InfoCard } from '@barely/ui/elements/card';
// import { Form, SubmitButton } from '@barely/ui/forms';
// import { CheckboxField } from '@barely/ui/forms/checkbox-field';
// import { NumberField } from '@barely/ui/forms/number-field';
// import { RatingField } from '@barely/ui/forms/rating-field';
// import { TextField } from '@barely/ui/forms/text-field';
// import { ToggleField } from '@barely/ui/forms/toggle-field';

// // import { TextField } from '@barely/ui/forms/text-field';

// // const playlistsAtom = atom<GetPlaylistsByUserId>([]);

// const twoWeeks = new Date();
// twoWeeks.setDate(twoWeeks.getDate() + 14);

// const PlaylistPitchReviewForm = () => {
// 	const utils = api.useContext();

// 	const [parent] = useAutoAnimate();

// 	// 🔎 queries

// 	// const [playlists] = api.playlist.byWork

// 	const [reviews] = api.playlistPitchReview.toReview.useSuspenseQuery(undefined);
// 	const reviewId = useMemo(() => (reviews.length ? reviews[0]?.id : null), [reviews]);

// 	// 📝 form
// 	const form = useZodForm({
// 		schema: submitPlaylistPitchReviewSchema,
// 		defaultValues: {
// 			id: '',
// 			rating: 0,
// 			stage: 'rejected',
// 			review: '',
// 			placements: [],
// 		},
// 	});

// 	const placementsArray = useFieldArray({
// 		control: form.control,
// 		name: 'placements',
// 	});

// 	// 🧬 mutations

// 	const { mutate: submitReview } = api.playlistPitchReview.submitReview.useMutation({
// 		onMutate: async () => {
// 			await utils.playlistPitchReview.toReview.cancel();
// 			const prevReviews = utils.playlistPitchReview.toReview.getData();
// 			const firstReview = prevReviews?.[0];

// 			// optimistically remove the first review from the list
// 			utils.playlistPitchReview.toReview.setData(undefined, old => {
// 				if (!old || !firstReview) return old;
// 				return old.filter(r => r.id !== firstReview.id);
// 			});

// 			if (firstReview) {
// 				utils.playlistPitchReview.toReview.setData(undefined, old => {
// 					if (!old) return old;
// 					return old.filter(r => r.id !== firstReview.id);
// 				});
// 				return { prevReviews };
// 			}
// 		},
// 		onError: (err, variables, context) => {
// 			if (context?.prevReviews) {
// 				utils.playlistPitchReview.toReview.setData(undefined, context.prevReviews);
// 			}
// 		},
// 	});

// 	const review = reviews?.[0];
// 	const track = review?.campaign.track;

// 	const handleSubmitReview = (data: z.infer<typeof submitPlaylistPitchReviewSchema>) => {
// 		console.log('submitting');

// 		if (!track) throw new Error('no track');

// 		const placements = data.placements
// 			.filter(p => p.place)
// 			.map(p => ({
// 				...p,
// 				trackId: track.id,
// 				pitchReviewId: review.id,
// 			}));

// 		const stage: 'placed' | 'rejected' = data.stage ? 'placed' : 'rejected';

// 		const formattedReview = {
// 			...r.omit(data, ['placements']),
// 			id: review.id,
// 			stage,
// 			placements,
// 		};
// 		console.log(`review data for ${review.id}`, formattedReview);

// 		submitReview(formattedReview);
// 	};

// 	const place = form.watch('stage') === 'placed';

// 	return (
// 		<Form form={form} onSubmit={v => handleSubmitReview(v)}>
// 			<Suspense fallback={<div>Loading...</div>}>
// 				{reviewId && track ? (
// 					<InfoCard
// 						title={track.name}
// 						subtitle={track.workspace.name}
// 						imageUrl={track.imageUrl}
// 						imageAlt={`artwork for ${track.name}`}
// 						stats={
// 							<Link
// 								href={`https://open.spotify.com/track/${track.spotifyId ?? ''}`}
// 								target='_blank'
// 							>
// 								Listen
// 							</Link>
// 						}
// 					>
// 						<TextField label='Review' control={form.control} name='review' />
// 						<RatingField label='Rating' control={form.control} name='rating' />
// 						<ToggleField label='Place' control={form.control} name='stage' />
// 						{/* <RatingField fieldAtom={playlistPitchRatingFieldAtom} label='Rating' />
// 						<TextField fieldAtom={playlistPitchReviewFieldAtom} label='Review' />
// 						<SwitchField fieldAtom={playlistPitchPlaceFieldAtom} label='Place' /> */}

// 						<ul ref={parent} className='flex w-full flex-col items-start space-y-3'>
// 							{place &&
// 								placementsArray.fields.length &&
// 								placementsArray.fields.map((p, i) => {
// 									return (
// 										<div className='flex flex-row space-x-2' key={`playlist.${i}`}>
// 											<CheckboxField
// 												control={form.control}
// 												name={`placements.${i}.place`}
// 												label={p.playlistId}
// 											/>
// 											{p.place && (
// 												<NumberField
// 													control={form.control}
// 													name={`placements.${i}.playlistPosition`}
// 													className='w-16'
// 												/>
// 											)}
// 										</div>
// 									);
// 								})}
// 						</ul>
// 						<SubmitButton>Submit</SubmitButton>
// 					</InfoCard>
// 				) : (
// 					<div>All done 🌞</div>
// 				)}

// 				{/* <pre> {JSON.stringify(formValues, null, 2)}</pre> */}
// 			</Suspense>
// 		</Form>
// 	);
// };

// export { PlaylistPitchReviewForm };
