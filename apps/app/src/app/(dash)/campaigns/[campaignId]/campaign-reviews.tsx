'use client';

import { Progress } from '@barely/ui/elements/progress';
import { Review } from '@barely/ui/elements/review-card';
import { Text } from '@barely/ui/elements/typography';

import { fullName } from '@barely/utils/edge/name';
import Link from 'next/link';

import { api } from '~/client/trpc';

const CampaignReviews = (props: { campaignId: string; reach: number }) => {
	const [totalPlaylistPitchReviews] =
		api.node.playlistPitchReview.countByCampaignId.useSuspenseQuery({
			campaignId: props.campaignId,
			complete: true,
		});

	const [playlistPitchReviews] =
		api.node.playlistPitchReview.byCampaignId.useSuspenseInfiniteQuery(
			{
				campaignId: props.campaignId,
				complete: true,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
				refetchOnMount: false,
				staleTime: Infinity,
			},
		);

	const flatPlaylistPitchReviews = playlistPitchReviews.pages.flatMap(
		page => page.reviews,
	);

	return (
		<>
			<Text variant='lg/normal'>Completed Reviews ({totalPlaylistPitchReviews} / {props.reach})</Text>
			<Progress
				value={(totalPlaylistPitchReviews / props.reach) * 100}
				className='mb-6'
			/>

			{flatPlaylistPitchReviews.map((review) => {
				const reviewerDisplayName =
					review.reviewer?.username ??
					fullName(review.reviewer?.firstName, review.reviewer?.lastName);

				return (
					<Review
						key={review.id}
						rating={review.rating}
						reviewer={{
							displayName: reviewerDisplayName,
						}}
						review={review.review}					
					>
						{review.placements.length > 0 && (
							<>
							<Text variant='xs/normal' className='my-4 mb-1 dark:text-slate-400'>Placements:</Text>
							{review.placements.map(placement => (
								<div key={placement.id}>
									<Link href={`https://open.spotify.com/playlist/${placement.playlist.spotifyId ?? ''}`} target='_blank'>
									<Text variant='xs/normal' className='dark:text-blue-600'>{placement.playlist.name}</Text>
									</Link>
									{/* <Text variant='xs/normal'>{placement.playlist.owner.displayName}</Text> */}
								</div>
							))}
							</>
						)}
					</Review>
				);
			})}
		</>
	);
};

export { CampaignReviews };
