'use client';

import { useMutation } from '@tanstack/react-query';

import { useLandingPageRenderTRPC } from '@barely/api/public/landing-page.trpc.react';

import { LoadingLinkButton } from '@barely/ui/button';

export interface LandingPageLinkButtonProps {
	landingPageId: string;
	href: string;
	label: string;
	assetId?: string;
}

export const LandingPageLinkButton = ({
	href,
	landingPageId,
	assetId,
	label,
}: LandingPageLinkButtonProps) => {
	const trpc = useLandingPageRenderTRPC();
	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

	return (
		<LoadingLinkButton
			onClick={() =>
				logEvent({
					type: 'page/linkClick',
					landingPageId,
					linkClickDestinationAssetId: assetId,
					linkClickDestinationHref: href,
				})
			}
			href={href}
			look='brand'
			size='xl'
			pill
		>
			{label}
		</LoadingLinkButton>
	);
};
