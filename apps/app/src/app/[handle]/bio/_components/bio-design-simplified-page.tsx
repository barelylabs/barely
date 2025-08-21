'use client';

import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { Text } from '@barely/ui/typography';

import { BioDesignSection } from '../design/bio-design-section';

interface BioDesignSimplifiedPageProps {
	handle: string;
}

export function BioDesignSimplifiedPage({ handle }: BioDesignSimplifiedPageProps) {
	const trpc = useTRPC();

	const { data: bio } = useQuery({
		...trpc.bio.byKey.queryOptions({
			handle,
			key: 'home',
		}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	if (!bio) {
		return (
			<div className='flex items-center justify-center p-8'>
				<Text variant='sm/normal' className='text-gray-500'>
					Loading design settings...
				</Text>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Main design settings */}
			<Card className='p-6'>
				<BioDesignSection />
			</Card>

			{/* Additional settings */}
			<Card className='p-6'>
				<div className='space-y-4'>
					<div>
						<Text variant='lg/semibold'>Share Settings</Text>
						<Text variant='sm/normal' className='mt-1 text-gray-600'>
							Toggle the share button visibility in the preview to see how it looks
						</Text>
					</div>

					<div>
						<Text variant='lg/semibold'>Subscribe Settings</Text>
						<Text variant='sm/normal' className='mt-1 text-gray-600'>
							Toggle the subscribe button visibility in the preview to see how it looks
						</Text>
					</div>
				</div>
			</Card>

			{/* Note about removed features */}
			<Card className='border-blue-200 bg-blue-50 p-4'>
				<Text variant='sm/normal' className='text-blue-800'>
					<strong>Tip:</strong> Use the preview panel on the right to see your changes in
					real-time. The share preview has been moved to the preview panel for a better
					editing experience.
				</Text>
			</Card>
		</div>
	);
}
