'use client';

import type { BioWithButtons } from '@barely/validators';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { BioRenderV2 } from '@barely/ui/bio';
import { LoadingSpinner } from '@barely/ui/loading';

import { BioDesignSectionV3 } from './bio-design-section-v3';

interface BioDesignPageProps {
	handle: string;
}

export function BioDesignPage({ handle }: BioDesignPageProps) {
	const trpc = useTRPC();
	const [liveFormData, setLiveFormData] = useState<any>(null);

	// Memoize the callback to prevent infinite loops
	const handleFormDataChange = useCallback((data: any) => {
		setLiveFormData(data);
	}, []);

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

	// Merge bio data with live form data for preview
	const previewBio = liveFormData ? { ...bio, ...liveFormData } : bio;

	return (
		<div className='grid gap-6 lg:grid-cols-2'>
			{/* Main content - Left side on large screens */}
			<div className='order-1'>
				<BioDesignSectionV3 bio={bio} onFormDataChange={handleFormDataChange} />
			</div>

			{/* Desktop Preview - Right side on large screens */}
			<div className='order-2 hidden w-full max-w-sm lg:block'>
				<div className='sticky top-6'>
					<div className='mb-4 flex flex-col items-center justify-between'>
						<h3 className='text-lg font-semibold'>Live Preview</h3>
					</div>
					<div className='relative overflow-hidden rounded-lg'>
						<div className='flex flex-col items-center gap-4'>
							<span className='text-sm text-muted-foreground'>barely.bio/{handle}</span>
							<BioRenderV2
								bio={previewBio}
								// Only pass the liveFormData overrides when they exist
								// Don't pass undefined values as props - let BioRenderV2 handle the brand kit fallback
								{...(liveFormData?.headerStyle !== undefined && {
									headerStyle: liveFormData.headerStyle,
								})}
								{...(liveFormData?.showShareButton !== undefined && {
									showShareButton: liveFormData.showShareButton,
								})}
								{...(liveFormData?.showSubscribeButton !== undefined && {
									showSubscribeButton: liveFormData.showSubscribeButton,
								})}
								isPreview={true}
								enableAnalytics={false}
								showPhoneFrame={true}
								onButtonClick={undefined}
								onEmailCapture={undefined}
								onPageView={undefined}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
