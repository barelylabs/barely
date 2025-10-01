'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { cn, getComputedStyles } from '@barely/utils';

import { BioBlocksSkeleton } from './bio-blocks-skeleton';
import { BioBranding } from './bio-branding';
import { BioEmailCaptureRender } from './bio-email-capture-render';
import { BioHeaderRender } from './bio-header-render';
import { BioProfileRender } from './bio-profile-render';
import { useBioContext } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

export function BioContentAroundBlocks({ children }: { children: ReactNode }) {
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);
	const { isPreview } = useBioContext();

	return (
		<div
			className={cn(
				'flex h-full flex-col justify-between gap-4 py-5',
				'bg-brandKit-bg text-brandKit-text', // Add brandKit classes
				brandKit.blockStyle !== 'full-width' && 'px-6 sm:px-8',
				!isPreview ?
					'min-h-screen sm:min-h-[calc(100vh-96px)] sm:rounded-2xl sm:shadow-2xl'
				:	'min-h-[700px]',
			)}
			style={{
				fontFamily: computedStyles.fonts.bodyFont,
			}}
		>
			<div className='flex flex-col gap-4'>
				<BioHeaderRender />
				<BioProfileRender />
				<BioEmailCaptureRender />
				<Suspense
					fallback={
						<BioBlocksSkeleton
							computedStyles={computedStyles}
							blockStyle={brandKit.blockStyle}
						/>
					}
				>
					{children}
				</Suspense>
			</div>
			<BioBranding isPreview={isPreview} />
		</div>
	);
}
