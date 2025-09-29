'use client';

import { useParams } from 'next/navigation';
import { useCopy } from '@barely/hooks';
import { getAbsoluteUrl } from '@barely/utils';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
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
	const { copyToClipboard } = useCopy();

	const trpc = useTRPC();

	// Fetch all bios for the workspace
	const { data } = useQuery({
		...trpc.bio.byWorkspace.queryOptions({
			handle,
			limit: 100, // Get all bios
		}),
	});

	// Construct the bio URL
	const bioUrl = getAbsoluteUrl(
		'bio',
		bioKey === 'home' ? handle : `${handle}/${bioKey}`,
	);

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

			<Button
				variant='icon'
				look='ghost'
				size='sm'
				href={bioUrl}
				target='_blank'
				title='Open bio in new window'
			>
				<Icon.externalLink className='h-4 w-4' />
			</Button>

			<Button
				variant='icon'
				look='ghost'
				size='sm'
				onClick={() => copyToClipboard(bioUrl)}
				title='Copy bio link'
			>
				<Icon.copy className='h-4 w-4' />
			</Button>
		</div>
	);
}
