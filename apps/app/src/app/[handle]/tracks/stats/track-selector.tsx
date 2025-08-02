'use client';

// import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useState } from 'react';
import { useTrackStatSearchParams, useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { MultiSelectNew } from '@barely/ui/multi-select-new';

export function TrackSelector() {
	const { handle } = useWorkspace();
	const { selectedIds, setSelection } = useTrackStatSearchParams();
	const [search] = useState('');

	const trpc = useTRPC();
	const { data } = useSuspenseQuery(
		trpc.track.byWorkspace.queryOptions({
			handle,
			limit: 10,
			search,
		}),
	);

	const tracks = data.tracks;
	const selectedTrackIds =
		selectedIds === 'all' ? tracks.map(t => t.id) : (selectedIds ?? []);

	const options = tracks.map(track => ({
		label: track.name,
		value: track.id,
	}));

	return (
		<MultiSelectNew
			className='w-full'
			options={options}
			placeholder='Select tracks to compare...'
			defaultValue={selectedTrackIds}
			maxCount={3}
			variant='inverted'
			onValueChange={v => setSelection(new Set(v))}
		/>
	);
}
