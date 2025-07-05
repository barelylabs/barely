// import { useEffect } from 'react';

// import { FieldAtom, useFieldActions } from 'form-atoms';
// import { atom, useAtom } from 'jotai';

// import { atomWithDebounce } from '@barely/atoms';
// import { SpotifyTrackOption } from '@barely/server/spotify/spotify.schema';
// import { TrackWithTeamAndGenres } from '@barely/server/track/track.schema';

// import { Combobox } from '@barely/ui/combobox';
// import { FieldWrapper } from '@barely/ui/field-wrapper';

// import { api } from '~/utils/api';

// // ⚛️ atoms
// const { debouncedValueAtom: trackQAtom } = atomWithDebounce('');

// const userTrackOptionsAtom = atom<TrackWithArtist[]>([]);

// const trackOptionsAtom = atom<(SpotifyTrackOption | TrackWithArtist)[]>([]);

// const allTrackOptionsAtom = atom(get => {
// 	const userTrackOptions = get(userTrackOptionsAtom);
// 	const spotifyTrackOptions = get(trackOptionsAtom).filter(
// 		t => !userTrackOptions.some(u => u.spotifyId === t.spotifyId),
// 	);
// 	return [...userTrackOptions, ...spotifyTrackOptions];
// });

// interface SpotifyTrackSearchProps {
// 	trackFieldAtom: FieldAtom<SpotifyTrackOption | TrackWithArtist | null>;
// }

// const SpotifyTrackSearch = (props: SpotifyTrackSearchProps) => {
// 	// query
// 	const [trackQ, setTrackQ] = useAtom(trackQAtom);

// 	// spotify options
// 	const { data: spotifyTrackOptions, isLoading: spotifyTrackIsLoading } =
// 		api.spotify.findTrack.useQuery(trackQ, {
// 			enabled: trackQ.length > 1,
// 			cacheTime: 1000 * 60 * 5, // 5 minutes
// 			staleTime: 1000 * 60 * 5, // 5 minutes
// 		});

// 	const [, setSpotifyTrackOptions] = useAtom(trackOptionsAtom);

// 	useEffect(() => {
// 		setSpotifyTrackOptions(spotifyTrackOptions ?? []);
// 	}, [spotifyTrackOptions, setSpotifyTrackOptions]);

// 	// select
// 	const spotifyTrackFieldActions = useFieldActions(props.trackFieldAtom);

// 	return (
// 		<FieldWrapper fieldAtom={props.trackFieldAtom}>
// 			<Combobox
// 				focusOnMount
// 				placeholder='track name or Spotify URL'
// 				inputOnChange={event => setTrackQ(event.target.value)}
// 				displayValue={() => trackQ}
// 				fieldValueAtom={props.trackFieldAtom}
// 				optionsAtom={allTrackOptionsAtom}
// 				valueOnChange={option => spotifyTrackFieldActions.setValue(option)}
// 				fetchingOptions={spotifyTrackIsLoading}
// 				optImgSrc={track => track.imageUrl ?? ''}
// 				optImgAlt={track => `album cover: ${track?.name ?? ``}`}
// 				optTitle={track => track?.name}
// 				optSubtitle={track => track?.artist.name}
// 			/>
// 		</FieldWrapper>
// 	);
// };

// export { SpotifyTrackSearch };
