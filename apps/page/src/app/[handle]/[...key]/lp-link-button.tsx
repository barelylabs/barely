'use client';

import { landingPageApi } from '@barely/lib/server/routes/landing-page-render/landing-page-render.api.react';

import { LoadingLinkButton } from '@barely/ui/elements/button';

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
	// ...props
}: LandingPageLinkButtonProps) => {
	const { mutate: logEvent } = landingPageApi.log.useMutation();

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
