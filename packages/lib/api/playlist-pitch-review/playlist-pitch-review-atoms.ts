import { FieldAtom, fieldAtom, formAtom } from 'form-atoms';
import { zodValidate } from 'form-atoms/zod';

import {
	pitchReviewSchema,
	submitPitchReviewSchema,
} from './playlist-pitch-review-schema';

// const playlistPitchReviewIdFieldAtom = fieldAtom({
// 	name: 'rating',
// 	value: 0,
// });

const playlistPitchRatingFieldAtom = fieldAtom({
	name: 'rating',
	value: 0,
	validate: zodValidate(
		pitchReviewSchema.shape.rating.min(1, 'Please choose a rating between 1-5').max(5),
		{
			on: 'change',
		},
	),
});

const playlistPitchReviewFieldAtom = fieldAtom({
	name: 'review',
	value: '',
	validate: zodValidate(
		pitchReviewSchema.shape.review.min(15, 'Please write a longer review'),
		{
			on: ['change'],
			when: 'dirty',
		},
	),
});

const playlistPitchPlaceFieldAtom = fieldAtom({
	name: 'place',
	value: false,
	validate({ value, get, event }) {
		const placements = get(get(playlistPitchReviewFormAtom).fields).placements.filter(p =>
			get(get(p.place).value),
		);

		if (event === 'submit' && value && placements.length === 0) {
			return ['You must select at least one playlist to place your track'];
		}

		return [];
	},
});

const playlistPitchReviewFormAtom = formAtom<{
	rating: typeof playlistPitchRatingFieldAtom;
	review: typeof playlistPitchReviewFieldAtom;
	place: typeof playlistPitchPlaceFieldAtom;
	placements: Array<{
		playlistName: FieldAtom<string>;
		playlistId: FieldAtom<string>;
		playlistPosition: FieldAtom<number>;
		addDate: FieldAtom<Date>;
		removeDate: FieldAtom<Date>;
		place: FieldAtom<boolean>;
	}>;
}>({
	rating: playlistPitchRatingFieldAtom,
	review: playlistPitchReviewFieldAtom,
	place: playlistPitchPlaceFieldAtom,
	placements: [],
});

export {
	playlistPitchReviewFormAtom,
	playlistPitchRatingFieldAtom,
	playlistPitchReviewFieldAtom,
	playlistPitchPlaceFieldAtom,
};
