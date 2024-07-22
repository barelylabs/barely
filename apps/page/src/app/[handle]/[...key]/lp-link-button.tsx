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
	landingPageId,
	assetId,
	label,
	...props
}: LandingPageLinkButtonProps) => {
	const { mutate: logEvent } = landingPageApi.log.useMutation();

	const url = new URL(props.href);
	url.searchParams.set('refererId', landingPageId);

	const href = url.toString();

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
