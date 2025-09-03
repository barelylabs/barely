'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

export function BioKeySwitcher() {
	const params = useParams();
	const handle = params.handle as string;
	const { bioKey, setBioKey } = useBioQueryState();

	const trpc = useTRPC();

	// Fetch all bios for the workspace
	const { data } = useQuery({
		...trpc.bio.byWorkspace.queryOptions({
			handle,
			limit: 100, // Get all bios
		}),
	});

	if (!data?.bios || data.bios.length <= 1) {
		return null; // Don't show switcher if there's only one bio
	}

	return (
		<div className='flex items-center gap-2'>
			<span className='text-sm text-muted-foreground'>Preview Bio:</span>
			<Select value={bioKey} onValueChange={setBioKey}>
				<SelectTrigger className='w-[200px]'>
					<SelectValue placeholder='Select bio page' />
				</SelectTrigger>
				<SelectContent>
					{data.bios.map(bio => (
						<SelectItem key={bio.id} value={bio.key}>
							{bio.key}
							{bio.key === 'home' && ' (default)'}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
