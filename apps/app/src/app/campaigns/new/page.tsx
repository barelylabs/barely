'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { Combobox } from '@headlessui/react';
import { trpc } from '../../../utils/trpc';

// https://usehooks.com/useDebounce
function useDebounce(value: string, delay: number) {
	// state and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay], // Only re-call effect if value or delay changes
	);
	return debouncedValue;
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(' ');
}

const NewCampaignPage = () => {
	const [trackQ, setTrackQ] = useState('');
	const debouncedSearchQ = useDebounce(trackQ, 500);
	const memoSearchQ = useMemo(() => debouncedSearchQ, [debouncedSearchQ]);

	const trackQuery = trpc.spotify.findTrack.useQuery(memoSearchQ, {
		enabled: memoSearchQ.length > 2,
		// staleTime: 1000 * 60 * 5, // 5 minutes
		cacheTime: 1000 * 60 * 5, // 5 minutes
	});

	const filteredTracks = trackQuery.data ?? [];
	type SpotifyTrack = typeof filteredTracks[number];
	const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

	return (
		<>
			<input className='w-full rounded-lg px-5 py-2' />
		</>
	);
};

export default NewCampaignPage;
