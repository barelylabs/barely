'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { BioBlocksSkeleton } from './bio-blocks-skeleton';
import { BioBranding } from './bio-branding';
import { BioEmailCaptureRender } from './bio-email-capture-render';
import { BioHeaderRender } from './bio-header-render';
import { BioProfileRender } from './bio-profile-render';
import { useBio } from './contexts/bio-context';

export function BioContentAroundBlocks({ children }: { children: ReactNode }) {
	const { isPreview } = useBio();
	return (
		<>
			<BioHeaderRender />
			<BioProfileRender />
			<BioEmailCaptureRender />
			<Suspense fallback={<BioBlocksSkeleton />}>{children}</Suspense>
			<BioBranding isPreview={isPreview} />
		</>
	);
}
