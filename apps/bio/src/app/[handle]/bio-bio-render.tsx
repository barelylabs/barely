'use client';

import type { BioLink, PublicBrandKit } from '@barely/validators';
import React, { Suspense, useCallback } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import {
	BioBlocksRender,
	BioProvider,
	BrandKitProvider,
	useBio,
} from '@barely/ui/src/bio';
import { BioContentAroundBlocks } from '@barely/ui/src/bio/bio-content-around-blocks';

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
	handle,
	bioKey,
	children,
}: {
	handle: string;
	bioKey: string;
	children: React.ReactNode;
}) {
	const trpc = useBioRenderTRPC();
	const { data: bio } = useSuspenseQuery(
		trpc.bio.byHandleAndKey.queryOptions({ handle, key: bioKey }),
	);

	const { mutate: log } = useMutation(trpc.bio.log.mutationOptions());

	const { mutateAsync: captureEmail } = useMutation(
		trpc.bio.captureEmail.mutationOptions(),
	);
	// Handle page view
	const handlePageView = useCallback(() => {
		log({
			bioId: bio.id,
			type: 'bio/view',
		});
	}, [log, bio.id]);

	// Handle link click
	const handleLinkClick = useCallback(
		(link: BioLink) => {
			log({
				bioId: bio.id,
				type: 'bio/buttonClick',
				linkId: link.id,
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
			onPageView={handlePageView}
		>
			{children}
		</BioProvider>
	);
}

function BioBioBlocks() {
	const trpc = useBioRenderTRPC();
	const { bio } = useBio();

	const { data: blocks } = useSuspenseQuery(
		trpc.bio.blocksByHandleAndKey.queryOptions({ handle: bio.handle, key: bio.key }),
	);

	return <BioBlocksRender blocks={blocks} />;
}

export function BioBioRender({
	handle,
	bioKey = 'home',
	brandKit,
}: {
	handle: string;
	bioKey: string;
	brandKit: PublicBrandKit;
}) {
	return (
		<div className={'mx-auto max-w-md'}>
			<BioBrandKitProvider brandKit={brandKit}>
				<Suspense fallback={<div className='min-h-screen animate-pulse bg-gray-100' />}>
					<BioBioProvider handle={handle} bioKey={bioKey}>
						<BioContentAroundBlocks>
							<BioBioBlocks />
						</BioContentAroundBlocks>
					</BioBioProvider>
				</Suspense>
			</BioBrandKitProvider>
		</div>
	);
}
