'use client';

import type { BioOnLinkClick } from '@barely/ui/bio';
import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useWorkspace } from 'node_modules/@barely/hooks/src/use-workspace';
import { BioContentAroundBlocks } from 'node_modules/@barely/ui/src/bio/bio-content-around-blocks';

import { useTRPC } from '@barely/api/app/trpc.react';

import { BioBlocksRender, BioProvider, useBioContext } from '@barely/ui/bio';

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

	const handleLinkClick: BioOnLinkClick = link => {
		router.push(`/${bio.handle}/bio/${bio.key}/links?blockId=${link.blockId}`);
	};

	return (
		<BioProvider
			bio={bio}
			isPreview={true}
			onLinkClick={handleLinkClick}
			onEmailCapture={null}
			onPageView={null}
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

export function AppBioRender({ bioKey }: { bioKey: string }) {
	// Wrap in phone frame - we're in the app, so this is a preview.
	return (
		<div
			className={
				'relative mx-auto h-[700px] w-[380px] overflow-hidden rounded-2xl border-4 border-black shadow-md'
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
