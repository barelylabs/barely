'use client';

import type { BioWithButtons } from '@barely/validators';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { LoadingSpinner } from '@barely/ui/loading';

import { BioButtonsSection } from './bio-buttons-section';
import { BioPreview } from './bio-preview';

interface BioButtonsPageProps {
	handle: string;
}

export function BioButtonsPage({ handle }: BioButtonsPageProps) {
	const trpc = useTRPC();

	// Get the workspace's bio (or create one if it doesn't exist)
	const { data: bio, isLoading } = useQuery({
		...trpc.bio.byHandle.queryOptions({ handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	}) as { data: BioWithButtons | undefined; isLoading: boolean };

	if (isLoading) {
		return (
			<div className='flex min-h-[400px] items-center justify-center'>
				<LoadingSpinner />
			</div>
		);
	}

	if (!bio) {
		return (
			<div className='flex min-h-[400px] flex-col items-center justify-center gap-4'>
				<p className='text-muted-foreground'>
					Unable to load bio. Please try refreshing.
				</p>
			</div>
		);
	}

	return (
		<div className='grid gap-6 lg:grid-cols-2'>
			{/* Main content - Left side on large screens */}
			<div className='order-1'>
				<BioButtonsSection />
			</div>

			{/* Desktop Preview - Right side on large screens */}
			<div className='order-2 hidden lg:block'>
				<div className='sticky top-6'>
					{/* <h3 className='mb-4 text-lg font-semibold'>Live Preview</h3> */}
					<BioPreview bio={bio} />
				</div>
			</div>
		</div>
	);
}
