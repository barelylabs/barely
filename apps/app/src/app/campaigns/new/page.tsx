'use client';

import { useMemo, useState } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { Combobox } from '@headlessui/react';
import { trpc } from '../../../utils/trpc';

import { useDebounce, useZodForm } from '@barely/hooks';
import { formSchema } from '@barely/schema';
import { cn } from '@barely/utils';

const NewCampaignPage = () => {
	// track
	const [trackQ, setTrackQ] = useState('');
	const trackQ_debounced = useDebounce(trackQ, 500);
	const trackQ_memo = useMemo(() => trackQ_debounced, [trackQ_debounced]);

	const trackQuery = trpc.spotify.findTrack.useQuery(trackQ_memo, {
		enabled: trackQ_memo.length > 2,
		// staleTime: 1000 * 60 * 5, // 5 minutes
		cacheTime: 1000 * 60 * 5, // 5 minutes
	});

	type SpotifyTrack = (typeof filteredTracks)[number];

	const filteredTracks = trackQuery.data ?? [];
	const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

	// artist
	const artistSpotifyId = selectedTrack?.artists[0]?.id ?? '';
	const { data: artist } = trpc.artist.findBySpotifyId.useQuery(artistSpotifyId, {
		enabled: !!selectedTrack,
		// staleTime: 1000 * 60 * 5, // 5 minutes
		cacheTime: 1000 * 60 * 5, // 5 minutes
	});

	// form
	const [formStage, setFormStage] = useState<'track' | 'details' | 'complete'>('track');

	const { handleSubmit } = useZodForm({
		schema: formSchema.createCampaign,
		defaultValues: {
			user: {
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
			},
			artist: { name: '', spotifyId: '', role: 'artist' },
			track: { name: '', spotifyId: '', released: true },
		},
	});

	return (
		<>
			<h1 className='py-2 text-3xl font-medium text-gray-900'>create new campaign</h1>

			{formStage === 'track' && (
				<>
					<div className='flex w-full flex-col space-y-2 rounded-lg border bg-purple p-4'>
						<div className='flex flex-row items-center space-x-2 text-gray-50'>
							<FaSpotify size='1.5rem' className='text-spotify' />
							<h1 className='text-2xl font-normal'>playlist.pitch</h1>
						</div>

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
										onClick={() => {
											setTrackQ('');
											setSelectedTrack(null);
										}}
										className='font-light text-gray-200 underline'
									>
										change track
									</button>
								</div>
							</div>
						)}

						{!selectedTrack && (
							<Combobox
								as='div'
								className='mt-1 flex w-full flex-col '
								value={selectedTrack}
								onChange={setSelectedTrack}
							>
								<Combobox.Input
									className='w-full rounded-lg bg-white py-3 px-5 shadow-md  sm:text-sm'
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
														cn(
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
																		className={cn(
																			'ml-3 truncate text-gray-800',
																			selected ? 'font-semibold' : '',
																		)}
																	>
																		{track.name}
																	</span>
																	<span
																		className={cn(
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
					</div>

					{selectedTrack && (
						<button
							onClick={() => setFormStage('details')}
							className='text-semibold my-6 w-full rounded-lg bg-spotify-500 px-5 py-3 text-white'
						>
							Submit campaign for review
						</button>
					)}
				</>
			)}

			{formStage === 'details' && (
				<form
					onSubmit={handleSubmit(async values => {
						// await
					})}
				>
					<h3 className='text-bold text-2xl'>Your contact info</h3>
					<div className='flex flex-col'>
						<label htmlFor='name'>Name</label>
						<input
							type='text'
							name='first-name'
							id='first-name'
							className='rounded-lg border-0 bg-white py-3 px-5 shadow-md  sm:text-sm'
						/>
					</div>
				</form>
			)}

			{<div>query : '{trackQ_memo}'</div>}
			{<div>selectedTrack : '{selectedTrack?.name}'</div>}
			{<div>selectedArtist : '{selectedTrack?.artists[0]?.name}'</div>}
		</>
	);
};

export default NewCampaignPage;
