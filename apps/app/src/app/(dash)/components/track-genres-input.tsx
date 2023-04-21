'use client';

import { useEffect } from 'react';

import deepEqual from 'fast-deep-equal';
import { fieldAtom, useFieldInitialValue } from 'form-atoms';
import { atom, useAtom } from 'jotai';

// import { useHydrateAtoms } from 'jotai/utils';

import { CampaignWithTrackAndMetadata } from '@barely/api/campaign/campaign.node.fns';
import { type GenreOption } from '@barely/api/genre/genre.schema';
import { pageSessionAtom } from '@barely/atoms/session.atom';
import { useDebouncedFieldMutation } from '@barely/hooks/use-debounced-mutation';
import { useSubscribeToObject } from '@barely/hooks/use-subscribe-to-object';

import { Combobox } from '@barely/ui/elements/combobox';

import { trackChannelAtom } from '~/atoms/channel.atoms';
import { api } from '~/client/trpc';

// ⚛️ atoms
const minReachAtom = atom(0);
const maxReachAtom = atom(0);

const selectedTrackGenresFieldAtom = fieldAtom<GenreOption[]>({
	name: 'genres',
	value: [],
	validate: ({ get }) => {
		const minReach = get(minReachAtom);
		const maxReach = get(maxReachAtom);
		if (maxReach < minReach) return ['Please choose more genres.'];
		return [];
	},
});

const genreQueryAtom = atom<string>('');
const allGenreOptionsAtom = atom<GenreOption[]>([]);
const filteredGenreOptionsAtom = atom<GenreOption[]>(get => {
	const genreQuery = get(genreQueryAtom);
	const genreOptions = get(allGenreOptionsAtom);

	const selectedGenresAtom = get(selectedTrackGenresFieldAtom).value;
	const selectedGenres = get(selectedGenresAtom);

	return genreOptions.filter(
		genre =>
			(genreQuery === '' ||
				genre.name.toLowerCase().includes(genreQuery.toLowerCase())) &&
			!selectedGenres.map(g => g.name).includes(genre.name),
	);
});

const TrackGenresInput = ({
	initialTrack,
	initEdit,
}: {
	initialTrack: CampaignWithTrackAndMetadata['track'];
	initEdit?: true;
}) => {
	const utils = api.useContext();

	// 📡 subscriptions

	useSubscribeToObject({
		channelAtom: trackChannelAtom,
		id: initialTrack.id,
		pageSessionAtom,
		callback: async () => await utils.node.track.byId.invalidate(initialTrack.id),
	});

	// 🌊 hydrate
	useFieldInitialValue(
		selectedTrackGenresFieldAtom,
		initialTrack.trackGenres.map(tg => tg.genre),
	);

	// 🔎 queries

	const { data: track } = api.node.track.byId.useQuery(initialTrack.id, {
		// initialData: initialTrack,
		// onSuccess: track => {
		// 	track && setSelectedGenres(track.trackGenres.map(tg => tg.genre));
		// },
		staleTime: Infinity,
	});

	const [, setGenreQuery] = useAtom(genreQueryAtom);
	const [, setGenreOptions] = useAtom(allGenreOptionsAtom);

	// const [allGenreOptions, genreOptionsQuery] =
	// 	api.node.genre.allByPlaylists.useSuspenseQuery(undefined, {
	const { data: allGenreOptions, isFetching } = api.node.genre.allByPlaylists.useQuery(
		undefined,
		{
			staleTime: 1000 * 60 * 60 * 24, // 1 day
		},
	);

	useEffect(
		() => allGenreOptions && setGenreOptions(allGenreOptions),
		[allGenreOptions, setGenreOptions],
	);

	// 🧬 mutations

	const trackMutation = api.node.track.update.useMutation({
		async onMutate(track) {
			await utils.node.track.byId.cancel(initialTrack.id);

			const previousTrack = utils.node.track.byId.getData(initialTrack.id);

			if (!previousTrack) return;

			const prevGenres = previousTrack.trackGenres.map(tg => tg.genre.name);
			const newGenres = track.genreNames;

			console.log('prevTrack deepEqual newTrack', deepEqual(prevGenres, newGenres));

			if (!deepEqual(prevGenres, newGenres)) {
				console.log('updating track', initialTrack.id);

				utils.node.track.byId.setData(initialTrack.id, () => {
					return {
						...previousTrack,
						trackGenres: track.genreNames
							? track.genreNames.map(name => ({
									trackId: previousTrack.id,
									genre: {
										name,
										_count: {
											// fixme: this is a hack to get the genres-input to update
											playlistGenres: 0,
										},
									},
							  }))
							: previousTrack.trackGenres,
					};
				});
			}
		},
	});

	const [selectedGenres, setSelectedGenres] = useDebouncedFieldMutation({
		atom: selectedTrackGenresFieldAtom,
		currentQueryValue: () => {
			const track = utils.node.track.byId.getData(initialTrack.id);
			return track?.trackGenres.map(tg => tg.genre) ?? [];
		},
		mutate: trackMutation.mutate,
		mutateInput: genres => ({
			id: initialTrack.id,
			genreNames: genres.map(g => g.name),
		}),
	});

	useEffect(() => {
		if (track) setSelectedGenres(track.trackGenres.map(tg => tg.genre));
	}, [track, setSelectedGenres]);

	const handleChange = (genres: GenreOption[]) => {
		setSelectedGenres(genres);
	};

	const handleRemoveGenre = (genre: GenreOption) => {
		setSelectedGenres(selectedGenres.filter(g => g.name !== genre.name));
	};

	return (
		// <Suspense fallback={<span>... loading genres</span>}>
		<Combobox<GenreOption>
			multi
			initMultiMode={initEdit ? 'select' : 'display'}
			inputOnChange={e => setGenreQuery(e.target.value)}
			fetchingOptions={isFetching}
			// options={filteredGenreOptions}
			fieldValuesAtom={selectedTrackGenresFieldAtom}
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
		// </Suspense>
	);
};

export { TrackGenresInput, selectedTrackGenresFieldAtom, minReachAtom, maxReachAtom };
