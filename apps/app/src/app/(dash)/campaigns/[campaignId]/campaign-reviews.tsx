'use client';

import { H4, H5, Progress, Text } from '@barely/ui/elements';
import { Review } from '@barely/ui/elements/review-card';

import { fullName } from '@barely/utils/edge/name';

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
			<Text variant='lg/normal'>Reviews</Text>
			<Progress
				value={(totalPlaylistPitchReviews / props.reach) * 100}
				className='mb-6'
			/>

			{flatPlaylistPitchReviews.map(review => {
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
					/>
				);
			})}
		</>
	);
};

export { CampaignReviews };
