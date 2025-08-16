'use client';

import type { BioLink } from '@barely/validators/schemas';
import { useCallback } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import { BioRender } from '@barely/ui/bio';

export function BioPageRender() {
	const trpc = useBioRenderTRPC();

	// get bio
	const { data: bio } = useSuspenseQuery(
		trpc.bio.byHandle.queryOptions({
			handle: 'test',
		}),
	);

	const { mutate: log } = useMutation(trpc.bio.log.mutationOptions());

	// Email capture mutation
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
				type: 'bio/linkClick',
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
		<BioRender
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
