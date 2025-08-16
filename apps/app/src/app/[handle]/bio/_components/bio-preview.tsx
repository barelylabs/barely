'use client';

import type { BioLink } from '@barely/validators';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { BioRender } from '@barely/ui/bio';

export function BioPreview() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const router = useRouter();

	const { data: bio } = useSuspenseQuery({
		...trpc.bio.byKey.queryOptions({
			handle,
			key: 'home', // Default to home for MVP
		}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return (
		<BioRender
			bio={bio}
			isPreview={true}
			enableAnalytics={false}
			showPhoneFrame={true}
			className={'w-full max-w-[320px]'}
			// open the link block to edit
			onLinkClick={(link: BioLink & { blockId: string; lexoRank: string }) => {
				router.push(`/${handle}/bio/home/links?blockId=${link.blockId}`);
			}}
			// No callbacks in preview mode - links are not interactive
			onEmailCapture={undefined}
			onPageView={undefined}
		/>
	);
}
