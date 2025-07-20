'use client';

import type { BaseResourceFilters } from '@barely/hooks';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Label } from '@barely/ui/label';
import { MultiSelect } from '@barely/ui/multiselect';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Switch } from '@barely/ui/switch';

import { Filters } from '~/app/[handle]/_components/filters';
import { useTrackSearchParams } from '~/app/[handle]/tracks/_components/track-context';

interface TrackFilters extends BaseResourceFilters {
	genres: string[];
	released?: boolean;
}

export function TrackFilters() {
	const trpc = useTRPC();

	const {
		filters,
		setSearch,
		toggleArchived,
		clearAllFilters,
		toggleReleased,
		setGenres,
	} = useTrackSearchParams();

	const { data: genreOptions, isFetching: isFetchingGenres } = useQuery(
		trpc.genre.allInPitchPlaylists.queryOptions(),
	);

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex flex-row items-center gap-2'>
				{/* Genre Filter */}
				<Popover>
					<PopoverTrigger asChild>
						<Button look='outline' size='md'>
							<div className='flex flex-row items-center gap-2'>
								Genres
								{filters.genres.length > 0 && (
									<Badge variant='info' size='xs'>
										{filters.genres.length}
									</Badge>
								)}
							</div>
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-80'>
						<div className='flex flex-col gap-2'>
							<Label>Filter by genres</Label>
							<MultiSelect
								values={genreOptions?.filter(g => filters.genres.includes(g.id)) ?? []}
								placeholder='Search for genres...'
								options={genreOptions ?? []}
								getItemId={item => item.id}
								isFetchingOptions={isFetchingGenres}
								displayValue={option => option.name}
								optTitle={option => option.name}
								optSubtitle={option => `${option.totalPlaylists} playlists`}
								onValuesChange={genres => {
									void setGenres(genres.map(g => g.id));
								}}
							/>
						</div>
					</PopoverContent>
				</Popover>

				{/* Released Filter */}
				<Popover>
					<PopoverTrigger asChild>
						<Button look='outline' size='md'>
							<div className='flex flex-row items-center gap-2'>
								Released
								<Badge variant={filters.released ? 'success' : 'info'} size='xs'>
									{filters.released ? 'Yes' : 'No'}
								</Badge>
							</div>
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-64'>
						<div className='flex flex-row items-center justify-between gap-4'>
							<Label htmlFor='releasedSwitch'>Show released tracks only</Label>
							<Switch
								id='releasedSwitch'
								checked={!!filters.released}
								onClick={() => toggleReleased()}
								size='sm'
							/>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			<Filters
				search={filters.search}
				setSearch={setSearch}
				searchPlaceholder='Search tracks...'
				showArchived={filters.showArchived}
				toggleArchived={toggleArchived}
				clearAllFilters={clearAllFilters}
			/>
		</div>
	);
}
