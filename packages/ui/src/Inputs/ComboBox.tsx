import { Combobox } from '@headlessui/react';
import { ChangeEvent } from 'react';

// interface ComboBoxProps {
// 	placeholder: string;
// 	displayValue: (value: any) => string;
//   onChange: (event: ChangeEvent<HTMLInputElement>) => void;
//   value
// }

// export function ComboBox() {
// 	return (
// 		<Combobox
// 			as='div'
// 			className='mt-1 flex w-full flex-col '
// 			value={selectedTrack}
// 			onChange={setSelectedTrack}
// 		>
// 			<Combobox.Input
// 				className='w-full rounded-lg bg-white py-3 px-5 shadow-md  sm:text-sm'
// 				onChange={event => setTrackQ(event.target.value)}
// 				displayValue={(track: SpotifyTrack) => track?.name}
// 				placeholder='type your track name or URL from Spotify'
// 			/>

// 			{filteredTracks && filteredTracks.length > 0 && (
// 				<Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
// 					<div>
// 						{filteredTracks.map((track, index) => (
// 							<Combobox.Option
// 								key={`track.${index}`}
// 								value={track}
// 								className={({ active }) =>
// 									cn(
// 										'relative cursor-default select-none py-2 pl-3 pr-9',
// 										active ? 'bg-indigo-600 text-white' : 'text-gray-900',
// 									)
// 								}
// 							>
// 								{({ active, selected }) => (
// 									<>
// 										<div className='flex items-center'>
// 											<img
// 												src={track.album.images[0]?.url}
// 												alt={track.name}
// 												className='h-10 w-10 flex-shrink-0 rounded-sm'
// 											/>
// 											<div className='flex flex-col'>
// 												<span
// 													className={cn(
// 														'ml-3 truncate text-gray-800',
// 														selected ? 'font-semibold' : '',
// 													)}
// 												>
// 													{track.name}
// 												</span>
// 												<span
// 													className={cn(
// 														'ml-3 truncate text-gray-600',
// 														selected ? 'font-semibold' : '',
// 													)}
// 												>
// 													{track.artists[0]?.name}
// 												</span>
// 											</div>
// 										</div>
// 									</>
// 								)}
// 							</Combobox.Option>
// 						))}
// 					</div>
// 				</Combobox.Options>
// 			)}
// 		</Combobox>
// 	);
// }
