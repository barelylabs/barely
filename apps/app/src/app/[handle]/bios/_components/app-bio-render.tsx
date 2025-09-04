'use client';

import type { BioBlockContext } from 'node_modules/@barely/ui/src/bio/contexts/bio-context';
import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import {
	BioBlocksRender,
	BioContentAroundBlocks,
	BioProvider,
	useBioContext,
} from '@barely/ui/bio';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

function AppBioProvider({
	bioKey,
	children,
}: {
	bioKey: string;
	children: React.ReactNode;
}) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const router = useRouter();

	const { data: bio } = useSuspenseQuery(
		trpc.bio.byKey.queryOptions({ handle, key: bioKey }),
	);

	const handleClick = (context: BioBlockContext | undefined) => {
		if (!context) return;
		// Navigate to appropriate edit page with query params
		const blockTypeToPath: Record<string, string> = {
			links: 'links',
			markdown: 'markdown',
			image: 'image',
			twoPanel: 'two-panel',
			cart: 'cart',
			contactForm: 'contact-form',
		};
		const path = blockTypeToPath[context.blockType] ?? 'blocks';
		router.push(
			`/${bio.handle}/bios/${path}?bioKey=${bio.key}&blockId=${context.blockId}`,
		);
	};

	return (
		<BioProvider
			bio={bio}
			isPreview={true}
			onLinkClick={(_, context) => handleClick(context)}
			onTargetBioClick={(_, context) => handleClick(context)}
			onTargetLinkClick={(_, context) => handleClick(context)}
			onTargetCartFunnelClick={(_, context) => handleClick(context)}
			onTargetFmClick={(_, context) => handleClick(context)}
			onTargetUrlClick={(_, context) => handleClick(context)}
			onEmailCapture={null}
		>
			{children}
		</BioProvider>
	);
}

function AppBioBlocks() {
	const trpc = useTRPC();
	const { bio } = useBioContext();

	const { data: blocks } = useSuspenseQuery(
		trpc.bio.blocksByHandleAndKey.queryOptions({ handle: bio.handle, key: bio.key }),
	);

	return <BioBlocksRender blocks={blocks} />;
}

export function AppBioRender({ bioKey: bioKeyProp }: { bioKey?: string }) {
	// Use query state if bioKey not provided as prop
	const { bioKey: bioKeyFromQuery } = useBioQueryState();
	const bioKey = bioKeyProp ?? bioKeyFromQuery;

	// Wrap in phone frame - we're in the app, so this is a preview.
	return (
		<div
			className={
				'relative mx-auto h-[700px] w-[380px] overflow-hidden rounded-2xl border-4 border-black bg-brandKit-bg shadow-md'
			}
		>
			<div className='h-full max-w-sm overflow-y-auto'>
				<Suspense fallback={<div className='h-full w-full animate-pulse bg-gray-100' />}>
					<AppBioProvider bioKey={bioKey}>
						<BioContentAroundBlocks>
							<AppBioBlocks />
						</BioContentAroundBlocks>
					</AppBioProvider>
				</Suspense>
			</div>
		</div>
	);
}
