'use client';

import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { BioRenderV2 } from '@barely/ui/bio';

export function BioPreview() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const router = useRouter();

	const { data: bio } = useSuspenseQuery({
		...trpc.bio.byHandleWithBlocks.queryOptions({
			handle,
			key: 'home', // Default to home for MVP
		}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return (
		<BioRenderV2
			bio={bio}
			isPreview={true}
			enableAnalytics={false}
			showPhoneFrame={true}
			className={'w-full max-w-[320px]'}
			// No callbacks in preview mode - links are not interactive
			onLinkClick={(_, __, blockId) => {
				router.push(`/${handle}/bio/home/links?blockId=${blockId}`);
			}}
			onEmailCapture={undefined}
			onPageView={undefined}
		/>
	);
}
