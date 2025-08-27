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

export function BioBioRender({
	bio,
	brandKit,
}: {
	// handle: string;
	// bioKey: string;
	bio: BioRenderRouterOutputs['bio']['byHandleAndKey'];
	brandKit: PublicBrandKit;
}) {
	// Get the background color from brandKit for oklch calculation
	const bgColor =
		brandKit.colorScheme.colors[brandKit.colorScheme.mapping.backgroundColor];

	return (
		<div
			className='min-h-screen'
			style={{
				// Use oklch relative color syntax to darken the background
				backgroundColor: `oklch(from ${bgColor} calc(l - 0.3) c h)`,
			}}
		>
			<div className='mx-auto max-w-xl px-0 py-0 sm:px-4 sm:py-12'>
				<BioBrandKitProvider brandKit={brandKit}>
					<BioBioProvider bio={bio}>
						<BioLogVisit />
						<BioContentAroundBlocks>
							<BioBioBlocks />
						</BioContentAroundBlocks>
					</BioBioProvider>
				</BioBrandKitProvider>
			</div>
		</div>
	);
}
