'use client';

import { useState } from 'react';
import { useVipStatSearchParams, useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { MultiSelectNew } from '@barely/ui/multi-select-new';

export function VipSwapSelector() {
	const { handle } = useWorkspace();
	const { selectedIds, setSelection } = useVipStatSearchParams();
	const [search] = useState('');

	const trpc = useTRPC();
	const { data } = useSuspenseQuery(
		trpc.vipSwap.byWorkspace.queryOptions({
			handle,
			limit: 10,
			search,
		}),
	);

	const vipSwaps = data.vipSwaps;
	const selectedVipSwapIds =
		selectedIds === 'all' ? vipSwaps.map(s => s.id) : (selectedIds ?? []);

	const options = vipSwaps.map(swap => ({
		label: swap.name,
		value: swap.id,
	}));

	return (
		<MultiSelectNew
			className='w-full'
			options={options}
			placeholder='Select swaps to compare...'
			defaultValue={selectedVipSwapIds}
			maxCount={3}
			variant='inverted'
			onValueChange={v => setSelection(new Set(v))}
		/>
	);
}
