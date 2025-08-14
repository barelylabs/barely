'use client';

import type { BioWithBlocks } from '@barely/validators';
import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import { BioRenderV2 } from '@barely/ui/bio';

interface BioPageProps {
	bio: BioWithBlocks;
}

export function BioPage({ bio }: BioPageProps) {
	const trpc = useBioRenderTRPC();

	// Record page view mutation
	const { mutate: recordView } = useMutation(trpc.bio.log.mutationOptions());

	// Log button click mutation
	const { mutate: logButtonClick } = useMutation(trpc.bio.log.mutationOptions());

	// Email capture mutation
	const { mutateAsync: captureEmail } = useMutation({
		...trpc.bio.captureEmail.mutationOptions(),
	});

	// Handle page view
	const handlePageView = React.useCallback(() => {
		recordView({ bioId: bio.id, type: 'bio/view' as const });
	}, [recordView, bio.id]);

	// Handle link click
	const handleLinkClick = React.useCallback(
		(link: BioWithBlocks['blocks'][0]['links'][0], position: number, blockId: string) => {
			logButtonClick({
				bioId: bio.id,
				type: 'bio/buttonClick' as const,
				buttonId: link.id,
				buttonPosition: position,
			});
		},
		[logButtonClick, bio.id],
	);

	// Handle email capture
	const handleEmailCapture = React.useCallback(
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
		<BioRenderV2
			bio={bio}
			isPreview={false}
			enableAnalytics={true}
			showPhoneFrame={false}
			onPageView={handlePageView}
			onLinkClick={handleLinkClick}
			onEmailCapture={handleEmailCapture}
		/>
	);
}
