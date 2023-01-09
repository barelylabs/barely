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
			<h1 className='py-2 text-3xl font-medium text-gray-900'>create new campaign</h1>

			{!selectedTrack && (
				<Combobox
					as='div'
					className='mt-1 flex w-full flex-col bg-red'
					value={selectedTrack}
					onChange={setSelectedTrack}
				>
					<Combobox.Input
						// className='w-52 rounded-lg px-5 py-2'
						className='w-full rounded-md border-4 border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm'
						onChange={event => setTrackQ(event.target.value)}
						displayValue={(track: SpotifyTrack) => track?.name}
						placeholder='type your track name or URL from Spotify'
					/>
					{filteredTracks && filteredTracks.length > 0 && (
						<Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
							<div>
								{filteredTracks.map((track, index) => (
									<Combobox.Option
										key={`track.${index}`}
										value={track}
										className={({ active }) =>
											classNames(
												'relative cursor-default select-none py-2 pl-3 pr-9',
												active ? 'bg-indigo-600 text-white' : 'text-gray-900',
											)
										}
									>
										{({ active, selected }) => (
											<>
												<div className='flex items-center'>
													<img
														src={track.album.images[0]?.url}
														alt={track.name}
														className='h-10 w-10 flex-shrink-0 rounded-sm'
													/>
													<div className='flex flex-col'>
														<span
															className={classNames(
																'ml-3 truncate text-gray-800',
																selected ? 'font-semibold' : '',
															)}
														>
															{track.name}
														</span>
														<span
															className={classNames(
																'ml-3 truncate text-gray-600',
																selected ? 'font-semibold' : '',
															)}
														>
															{track.artists[0]?.name}
														</span>
													</div>
												</div>
											</>
										)}
									</Combobox.Option>
								))}
							</div>
						</Combobox.Options>
					)}
				</Combobox>
			)}

			<div className='flex w-full flex-col space-y-2 rounded-lg border bg-purple p-4'>
				<div className='flex flex-row items-center space-x-2 text-gray-50'>
					<FaSpotify size='1.5rem' className='text-spotify' />
					<h1 className='text-2xl font-normal'>playlist.pitch</h1>
				</div>
				<input
					className='w-full rounded-lg px-5 py-2'
					placeholder='type your track name or URL from Spotify'
				/>

				{selectedTrack && (
					<div className='mt-1 flex max-h-24 w-full flex-row justify-start py-1 text-base sm:text-sm'>
						<img
							src={selectedTrack.album.images[0]?.url}
							alt={`album cover: ${selectedTrack.name}`}
							className='object-fit max-h-20 rounded-lg'
						/>
						<div className='flex flex-row'>
							<div className='flex flex-col'>
								<span className='ml-3 truncate font-semibold text-gray-800'>
									{selectedTrack.name}
								</span>
								<span className='ml-3 truncate font-light text-gray-600'>
									{selectedTrack.artists[0]?.name}
								</span>
							</div>
							<button
								onClick={() => setSelectedTrack(null)}
								className='font-light text-gray-200 underline'
							>
								change track
							</button>
						</div>
					</div>
				)}

				{/* {!selectedTrack && (
					<Combobox value={selectedTrack} onChange={setSelectedTrack}>
						<div className='mt-1 flex w-full bg-red'>
							<Combobox.Input
								// className='w-52 rounded-lg px-5 py-2'
								className='w-full rounded-md border-4 border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm'
								onChange={event => setTrackQ(event.target.value)}
								displayValue={(track: SpotifyTrack) => track?.name}
								placeholder='type your track name or URL from Spotify'
							/>
							{filteredTracks && filteredTracks.length > 0 && (
								<Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
									<div>
										{filteredTracks.map((track, index) => (
											<Combobox.Option
												key={`track.${index}`}
												value={track}
												className={({ active }) =>
													classNames(
														'relative cursor-default select-none py-2 pl-3 pr-9',
														active ? 'bg-indigo-600 text-white' : 'text-gray-900',
													)
												}
											>
												{({ active, selected }) => (
													<>
														<div className='flex items-center'>
															<img
																src={track.album.images[0]?.url}
																alt={track.name}
																className='h-10 w-10 flex-shrink-0 rounded-sm'
															/>
															<div className='flex flex-col'>
																<span
																	className={classNames(
																		'ml-3 truncate text-gray-800',
																		selected ? 'font-semibold' : '',
																	)}
																>
																	{track.name}
																</span>
																<span
																	className={classNames(
																		'ml-3 truncate text-gray-600',
																		selected ? 'font-semibold' : '',
																	)}
																>
																	{track.artists[0]?.name}
																</span>
															</div>
														</div>
													</>
												)}
											</Combobox.Option>
										))}
									</div>
								</Combobox.Options>
							)}
						</div>
					</Combobox>
				)} */}
			</div>

			{/* {<div>query : '{memoSearchQ}'</div>}
			{<div>selectedTrack : '{selectedTrack?.name}'</div>} */}
		</>
	);
};

export default NewCampaignPage;
