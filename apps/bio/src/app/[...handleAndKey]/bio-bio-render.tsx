'use client';

import type { BioRenderRouterOutputs } from '@barely/api/public/bio-render.router';
import type { BioBlockContext } from '@barely/ui/src/bio/contexts/bio-context';
import type {
	Bio,
	BioLink,
	CartFunnel,
	FmPage,
	Link,
	PublicBrandKit,
} from '@barely/validators';
import type { BioTrackingData } from '@barely/validators/schemas';
import React, { useCallback } from 'react';
import { modifyOklch } from '@barely/utils';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import {
	BioBlocksRender,
	BioProvider,
	BrandKitProvider,
	useBioContext,
} from '@barely/ui/src/bio';
import { BioContentAroundBlocks } from '@barely/ui/src/bio/bio-content-around-blocks';

import { BioLogVisit } from './bio-log-visit';

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
	bio,
	tracking,
	children,
}: {
	bio: BioRenderRouterOutputs['bio']['byHandleAndKey'];
	tracking?: BioTrackingData;
	children: React.ReactNode;
}) {
	const trpc = useBioRenderTRPC();

	const { mutate: log } = useMutation(trpc.bio.log.mutationOptions());

	const { mutateAsync: captureEmail } = useMutation(
		trpc.bio.captureEmail.mutationOptions(),
	);

	// Handle link click with tracking parameters
	const handleLinkClick = useCallback(
		(link: BioLink, context?: BioBlockContext) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				linkId: link.id,
				blockId: context?.blockId,
				blockType: context?.blockType,
				blockIndex: context?.blockIndex,
				linkIndex: context?.linkIndex,
				linkAnimation: link.animate ?? undefined,
			});
		},
		[log, bio.id],
	);

	// handle target bio click
	const handleTargetBioClick = useCallback(
		(_targetBio: Bio, context?: BioBlockContext) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				blockId: context?.blockId,
				blockType: context?.blockType,
				blockIndex: context?.blockIndex,
				linkIndex: context?.linkIndex,
			});
		},
		[log, bio.id],
	);

	// handle target link click
	const handleTargetLinkClick = useCallback(
		(_targetLink: Link, context?: BioBlockContext) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				blockId: context?.blockId,
				blockType: context?.blockType,
				blockIndex: context?.blockIndex,
				linkIndex: context?.linkIndex,
			});
		},
		[log, bio.id],
	);

	// handle target cart funnel click
	const handleTargetCartFunnelClick = useCallback(
		(_targetCartFunnel: CartFunnel, context?: BioBlockContext) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				blockId: context?.blockId,
				blockType: context?.blockType,
				blockIndex: context?.blockIndex,
				linkIndex: context?.linkIndex,
			});
		},
		[log, bio.id],
	);

	// handle target fm click
	const handleTargetFmClick = useCallback(
		(_targetFm: FmPage, context?: BioBlockContext) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				blockId: context?.blockId,
				blockType: context?.blockType,
				blockIndex: context?.blockIndex,
				linkIndex: context?.linkIndex,
			});
		},
		[log, bio.id],
	);

	// handle target url click
	const handleTargetUrlClick = useCallback(
		(_targetUrl: string, context?: BioBlockContext) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				blockId: context?.blockId,
				blockType: context?.blockType,
				blockIndex: context?.blockIndex,
				linkIndex: context?.linkIndex,
			});
		},
		[log, bio.id],
	);

	// Handle email capture
	const handleEmailCapture = useCallback(
		async (data: { bioId: string; email: string; marketingConsent: boolean }) => {
			const result = await captureEmail(data);
			return result;
		},
		[captureEmail],
	);

	return (
		<BioProvider
			bio={bio}
			isPreview={false}
			tracking={tracking}
			onLinkClick={handleLinkClick}
			onTargetBioClick={handleTargetBioClick}
			onTargetLinkClick={handleTargetLinkClick}
			onTargetCartFunnelClick={handleTargetCartFunnelClick}
			onTargetFmClick={handleTargetFmClick}
			onTargetUrlClick={handleTargetUrlClick}
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
	tracking,
}: {
	// handle: string;
	// bioKey: string;
	bio: BioRenderRouterOutputs['bio']['byHandleAndKey'];
	brandKit: PublicBrandKit;
	tracking?: BioTrackingData;
}) {
	// Get the background color from brandKit using the new color system
	const bgColorIndex = brandKit.bioColorScheme.bgColor;
	const colors = [brandKit.color1, brandKit.color2, brandKit.color3];
	const bgColor = colors[bgColorIndex] ?? brandKit.color1;

	// Lighten the background color slightly for subtle contrast
	const backgroundColor = modifyOklch(bgColor, { alpha: 0.7 });

	return (
		<div
			className='min-h-screen'
			style={{
				backgroundColor,
			}}
		>
			<div
				className={`mx-auto px-0 py-0 sm:px-4 sm:py-12 ${
					bio.hasTwoPanel ? 'max-w-[750px]' : 'max-w-xl'
				}`}
			>
				<BioBrandKitProvider brandKit={brandKit}>
					<BioBioProvider bio={bio} tracking={tracking}>
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
