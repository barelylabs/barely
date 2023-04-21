import { fieldAtom } from 'form-atoms';
import { zodValidate, ZodValidateOn } from 'form-atoms/zod';
// import { atom } from 'jotai';
import { ZodError } from 'zod';

// import { EdgeRouterOutputs } from '../edge.router';
import { GenreOption } from '../genre/genre.schema';
import { campaignSchema } from './campaign.schema';

type ZodValidateWhen = 'dirty' | 'touched' | ('dirty' | 'touched')[] | undefined;

const stdZodValidateConfig = {
	on: ['blur', 'change'] satisfies ZodValidateOn[],
	when: ['touched'] satisfies ZodValidateWhen,
	formatError: (error: ZodError<unknown>) => error.issues.map(issue => issue.message),
};

// playlist.pitch initial submission

// type SpotifyTrackOption = EdgeRouterOutputs['spotify']['findTrack'][0] | null;

// const spotifyTrackFieldAtom = fieldAtom<SpotifyTrackOption>({
// 	name: 'spotifyTrack',
// 	value: null,
// });

// const campaignTrackAtom = atom(get => {
// 	const spotifyTrack = get(get(spotifyTrackFieldAtom).value);
// 	if (!spotifyTrack) return null;
// 	return {
// 		name: spotifyTrack.name,
// 		spotifyId: spotifyTrack.id,
// 		released: true,
// 		imageUrl: spotifyTrack.album.images[0]?.url ?? '',
// 	};
// });

// const campaignArtistAtom = atom(get => {
// 	const spotifyTrack = get(get(spotifyTrackFieldAtom).value);
// 	if (!spotifyTrack) return null;
// 	return {
// 		name: spotifyTrack.artists[0]?.name ?? '',
// 		handle: spotifyTrack.artists[0]?.name.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '',
// 		spotifyArtistId: spotifyTrack.artists[0]?.id ?? '',
// 	};
// });

// playlist.pitch screening

const screeningMessageFieldAtom = fieldAtom({
	name: 'screeningMessage',
	value: '',
	validate: zodValidate(campaignSchema.shape.screeningMessage, stdZodValidateConfig),
});

const trackGenresFieldAtom = fieldAtom<GenreOption[]>({
	name: 'trackGenres',
	value: [],
});

export {
	// initial submission
	// spotifyTrackFieldAtom,
	// type SpotifyTrackOption,
	// campaignTrackAtom,
	// campaignArtistAtom,
	// screening
	screeningMessageFieldAtom,
	trackGenresFieldAtom,
};
