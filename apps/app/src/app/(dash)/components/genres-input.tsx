'use client';

import { Suspense, useEffect } from 'react';

// import deepEqual from 'fast-deep-equal';
import { FieldAtom, fieldAtom, useFieldValue } from 'form-atoms';
import { Atom, atom, useAtom } from 'jotai';

// import { useHydrateAtoms } from 'jotai/utils';

// import { CampaignWithTrackAndMetadata } from '@barely/api/campaign/campaign.node.fns';
import { type GenreOption } from '@barely/api/genre/genre.schema';

// import { pageSessionAtom } from '@barely/atoms/session.atom';
// import { useDebouncedMutation } from '@barely/hooks/use-debounced-mutation';
// import { useSubscribeToObject } from '@barely/hooks/use-subscribe-to-object';

import { Combobox } from '@barely/ui/elements/combobox';

// import { trackChannelAtom } from '~/atoms/channel.atoms';
import { api } from '~/client/trpc';

// ⚛️ atoms
// const selectedGenresAtom = atom<GenreOption[]>([]);

const genreQueryAtom = atom<string>('');
const genreOptionsAtom = atom<GenreOption[]>([]);

// const filteredGenreOptionsAtom = atom<GenreOption[]>(get => {
// 	const genreQuery = get(genreQueryAtom);
// 	const genreOptions = get(genreOptionsAtom);
// 	return genreOptions.filter(
// 		genre =>
// 			(genreQuery === '' ||
// 				genre.name.toLowerCase().includes(genreQuery.toLowerCase())) &&
// 			!get(selectedGenresAtom)
// 				.map(g => g.name)
// 				.includes(genre.name),
// 	);
// });

// const selectedGenresFieldAtom = fieldAtom<GenreOption[]>({
// 	name: 'genres',
// 	value: [],
// 	validate: ({ get }) => {
// 		const maxReach = get(maxReachAtom);
// 		if (maxReach < 3) return ['Please choose more genres.'];
// 		return [];
// 	},
// });

// const maxReachAtom = atom(0);

interface GenresInputProps {
	selectedGenresFieldAtom: FieldAtom<GenreOption[]>;
	genreOptionsAtom: Atom<GenreOption[]>;
	onGenresChange: (genres: GenreOption[]) => void;
}

const GenresInput = ({ selectedGenresFieldAtom, onGenresChange }: GenresInputProps) => {
	const selectedGenres = useFieldValue(selectedGenresFieldAtom);
	const [, setGenreQuery] = useAtom(genreQueryAtom);
	const [, setGenreOptions] = useAtom(genreOptionsAtom);

	const [genreOptions, genreOptionsQuery] =
		api.node.genre.allByPlaylists.useSuspenseQuery(undefined, {
			staleTime: 1000 * 60 * 60 * 24, // 1 day
		});

	useEffect(() => {
		if (genreOptions && genreOptionsQuery.isSuccess) {
			setGenreOptions(genreOptions);
		}
	}, [genreOptions, genreOptionsQuery.isSuccess, setGenreOptions]);

	// const filteredGenreOptionsAtom = atom<GenreOption[]>(get => {
	// 	const genreQuery = get(genreQueryAtom);
	// 	const genreOptions = get(genreOptionsAtom);
	// 	return genreOptions.filter(
	// 		genre =>
	// 			(genreQuery === '' ||
	// 				genre.name.toLowerCase().includes(genreQuery.toLowerCase())) &&
	// 			!get(selectedGenresAtom)
	// 				.map(g => g.name)
	// 				.includes(genre.name),
	// 	);
	// });

	const handleRemoveGenre = (genre: GenreOption) => {
		const filteredGenres = selectedGenres.filter(g => g.name !== genre.name);
		return onGenresChange(filteredGenres);
	};

	const handleChange = (genres: GenreOption[]) => onGenresChange(genres);

	return (
		<div className='flex flex-row'>
			<Suspense fallback={<div>Loading inside genres input...</div>}>
				<Combobox<GenreOption>
					multi
					initMultiMode='display'
					inputOnChange={e => setGenreQuery(e.target.value)}
					fetchingOptions={genreOptionsQuery.isFetching}
					// options={filteredGenreOptions}
					fieldValuesAtom={selectedGenresFieldAtom}
					optionsAtom={filteredGenreOptionsAtom}
					optTitle={genre => genre.name}
					optInfo={genre =>
						genre._count?.playlistGenres ? `${genre._count.playlistGenres} playlists` : ''
					}
					valuesOnChange={handleChange}
					// value={selectedGenres}
					// valueOnChange={handleChange}
					displayValue={() => ''}
					placeholder='Search for a genre'
					label='Genres'
					onRemove={handleRemoveGenre}
					badgeDisplay={genre => genre.name}
				/>
			</Suspense>
		</div>
	);
};

// const TrackGenresInput = ({
// 	initialTrack,
// }: {
// 	initialTrack: CampaignWithTrackAndMetadata['track'];
// }) => {
// 	const utils = api.useContext();

// 	// 📡 subscriptions

// 	useSubscribeToObject({
// 		channelAtom: trackChannelAtom,
// 		id: initialTrack.id,
// 		pageSessionAtom: pageSessionAtom,
// 		callback: async () => await utils.node.track.byId.invalidate(initialTrack.id),
// 	});

// 	// 🌊 hydrate

// 	// useHydrateAtoms(
// 	// 	new Map([[selectedGenresAtom, initialTrack.trackGenres.map(tg => tg.genre) ?? []]]),
// 	// );

// 	// 🔎 queries

// 	api.node.track.byId.useQuery(initialTrack.id, {
// 		initialData: initialTrack,
// 		onSuccess: track => {
// 			track && setSelectedGenres(track.trackGenres.map(tg => tg.genre));
// 		},
// 		staleTime: Infinity,
// 	});

// 	const trackMutation = api.node.track.update.useMutation({
// 		async onMutate(track) {
// 			await utils.node.track.byId.cancel(initialTrack.id);

// 			const previousTrack = utils.node.track.byId.getData(initialTrack.id);

// 			if (!previousTrack) return;

// 			const prevGenres = previousTrack.trackGenres.map(tg => tg.genre.name);
// 			const newGenres = track.genreNames;

// 			console.log('prevTrack deepEqual newTrack', deepEqual(prevGenres, newGenres));

// 			if (!deepEqual(prevGenres, newGenres)) {
// 				console.log('updating track', initialTrack.id);
// 				utils.node.track.byId.setData(initialTrack.id, () => {
// 					return {
// 						...previousTrack,
// 						trackGenres: track.genreNames
// 							? track.genreNames.map(name => ({
// 									trackId: previousTrack.id,
// 									genre: {
// 										name,
// 										_count: {
// 											// fixme: this is a hack to get the genres-input to update
// 											playlistGenres: 0,
// 										},
// 									},
// 							  }))
// 							: previousTrack.trackGenres,
// 					};
// 				});
// 			}
// 		},
// 	});

// 	const [selectedGenres, setSelectedGenres] = useDebouncedMutation({
// 		atom: selectedGenresAtom,
// 		currentQueryValue: () => {
// 			const track = utils.node.track.byId.getData(initialTrack.id);
// 			return track?.trackGenres.map(tg => tg.genre) ?? [];
// 		},
// 		mutate: trackMutation.mutate,
// 		mutateInput: genres => ({
// 			id: initialTrack.id,
// 			genreNames: genres.map(g => g.name),
// 		}),
// 	});

// 	return (
// 		<Suspense fallback={<span>... loading genres</span>}>
// 			<GenresInput selectedGenres={selectedGenres} onGenresChange={setSelectedGenres} />
// 		</Suspense>
// 	);
// };

export { GenresInput };
