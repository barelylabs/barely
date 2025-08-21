'use client';

import type { BioRenderRouterOutputs } from '@barely/api/public/bio-render.router';
import type { BioLink, PublicBrandKit } from '@barely/validators';
import React, { useCallback } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import {
	BioBlocksRender,
	BioProvider,
	BrandKitProvider,
	useBioContext,
} from '@barely/ui/src/bio';
import { BioContentAroundBlocks } from '@barely/ui/src/bio/bio-content-around-blocks';

import { BioLogVisit } from '~/app/[handle]/bio-log-visit';

function BioBrandKitProvider({
	children,
	brandKit,
}: {
	children: React.ReactNode;
	brandKit: PublicBrandKit;
}) {
	return <BrandKitProvider brandKit={brandKit}>{children}</BrandKitProvider>;
}

function BioBioProvider({
	// handle,
	// bioKey,
	bio,
	children,
}: {
	// handle: string;
	// bioKey: string;
	bio: BioRenderRouterOutputs['bio']['byHandleAndKey'];
	children: React.ReactNode;
}) {
	const trpc = useBioRenderTRPC();

	const { mutate: log } = useMutation(trpc.bio.log.mutationOptions());

	const { mutateAsync: captureEmail } = useMutation(
		trpc.bio.captureEmail.mutationOptions(),
	);

	// Handle page view
	// const handlePageView = useCallback(() => {
	// 	log({
	// 		bioId: bio.id,
	// 		type: 'bio/view',
	// 	});
	// }, [log, bio.id]);

	// Handle link click with tracking parameters
	const handleLinkClick = useCallback(
		(
			link: BioLink & { blockId: string; lexoRank: string },
			context?: {
				blockId?: string;
				blockType?: 'links' | 'contactForm' | 'cart';
				blockIndex?: number;
				linkIndex?: number;
			},
		) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				linkId: link.id,
				blockId: context?.blockId ?? link.blockId,
				blockType: context?.blockType,
				blockIndex: context?.blockIndex,
				linkIndex: context?.linkIndex,
				linkAnimation: link.animate ?? undefined,
			});
		},
		[log, bio.id],
	);

	// Handle email capture
	const handleEmailCapture = useCallback(
		async (email: string, marketingConsent: boolean) => {
			const result = await captureEmail({
				bioId: bio.id,
				email,
				marketingConsent,
			});
			return result;
		},
		[captureEmail, bio.id],
	);

	return (
		<BioProvider
			bio={bio}
			isPreview={false}
			onLinkClick={handleLinkClick}
			onEmailCapture={handleEmailCapture}
		>
			{children}
		</BioProvider>
	);
}

function BioBioBlocks() {
	const trpc = useBioRenderTRPC();
	const { bio } = useBioContext();

	const { data: blocks } = useSuspenseQuery(
		trpc.bio.blocksByHandleAndKey.queryOptions(
			{ handle: bio.handle, key: bio.key },
			{
				staleTime: Infinity,
			},
		),
	);

	return <BioBlocksRender blocks={blocks} />;
}

// Helper function to convert hex to oklch and reduce lightness
function hexToOklchDarker(hex: string, lightnessReduction = 0.2): string {
	// This is a simplified approach - in production you might want to use a proper color library
	// For now, we'll use CSS's relative color syntax which is supported in modern browsers
	return `oklch(from ${hex} calc(l - ${lightnessReduction}) c h)`;
}

export function BioBioRender({
	// handle,
	bio,
	// bioKey = 'home',
	brandKit,
}: {
	// handle: string;
	// bioKey: string;
	bio: BioRenderRouterOutputs['bio']['byHandleAndKey'];
	brandKit: PublicBrandKit;
}) {
	// Get the background color from brandKit
	const bgColor =
		brandKit.colorScheme.colors[brandKit.colorScheme.mapping.backgroundColor];

	return (
		<div
			className={'min-h-screen'}
			style={{
				// Use oklch to reduce the lightness of the background color for desktop margins
				backgroundColor: hexToOklchDarker(bgColor, 0.3),
			}}
		>
			<div className='mx-auto max-w-xl px-0 py-0 sm:px-4 sm:py-12'>
				{/* <div className='flex min-h-screen flex-col overflow-hidden sm:min-h-[calc(100vh-96px)] sm:rounded-2xl sm:shadow-2xl'> */}
				<BioBrandKitProvider brandKit={brandKit}>
					{/* <Suspense
						fallback={
							<div className='h-full min-h-screen animate-pulse bg-gray-100 sm:min-h-full' />
						}
					> */}
					<BioBioProvider bio={bio}>
						<BioLogVisit />
						<BioContentAroundBlocks>
							<BioBioBlocks />
						</BioContentAroundBlocks>
					</BioBioProvider>
					{/* </Suspense> */}
				</BioBrandKitProvider>
				{/* </div> */}
			</div>
		</div>
	);
}
