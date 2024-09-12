import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { ReactNode } from 'react';
import React from 'react';
import { EmailButton, EmailLink } from '@barely/email/src/primitives';
import { Heading, Text } from '@react-email/components';
import { MDXRemote } from 'next-mdx-remote/rsc';

import type { CartFunnel } from '../cart-funnel/cart-funnel.schema';
import type { LandingPage } from '../landing-page/landing-page.schema';
import type { Link } from '../link/link.schema';
import type { PressKit } from '../press-kit/press-kit.schema';
import type { EmailTemplateVariableName } from './email-template.constants';
import { getAssetHref, getLinkHref } from '../../../utils/mdx';

export async function renderMarkdownToReactEmail({
	subject,
	body,
	variables,
	fanId,
	emailTemplateId,
	cartFunnels,
	landingPages,
	links,
	pressKits,
}: {
	subject: string;
	body: string;
	variables: Record<EmailTemplateVariableName, string>;
	// tracking
	emailTemplateId: string;
	fanId: string;
	// assets
	cartFunnels: CartFunnel[];
	landingPages: LandingPage[];
	links: Link[];
	pressKits: PressKit[];
}) {
	// Replace variables with values or empty string if not found
	const subjectWithVars = subject
		.replaceAll('{firstName}', variables.firstName)
		.replaceAll('{lastName}', variables.lastName);

	const bodyWithVars = body
		.replaceAll('\\{firstName}', variables.firstName)
		.replaceAll('\\{lastName}', variables.lastName);

	const components: MDXRemoteProps['components'] = {
		p: ({ children }: { children?: ReactNode }) => <Text>{children}</Text>,
		h1: ({ children }: { children?: ReactNode }) => <Heading as='h1'>{children}</Heading>,
		h2: ({ children }: { children?: ReactNode }) => <Heading as='h2'>{children}</Heading>,
		h3: ({ children }: { children?: ReactNode }) => <Heading as='h3'>{children}</Heading>,
		h4: ({ children }: { children?: ReactNode }) => <Heading as='h4'>{children}</Heading>,
		h5: ({ children }: { children?: ReactNode }) => <Heading as='h5'>{children}</Heading>,
		h6: ({ children }: { children?: ReactNode }) => <Heading as='h6'>{children}</Heading>,

		...mdxEmailLink({ fanId, emailTemplateId }),
		...mdxLinkButton({ fanId, emailTemplateId }),
		...mdxEmailAssetButton({
			fanId,
			emailTemplateId,
			cartFunnels,
			landingPages,
			links,
			pressKits,
		}),
	};

	const awaitedBody = await MDXRemote({
		source: bodyWithVars,
		components,
	});

	return {
		subject: subjectWithVars,
		reactBody: awaitedBody,
	};
}

function mdxEmailLink({
	fanId,
	emailTemplateId,
}: {
	fanId: string;
	emailTemplateId: string;
}) {
	const MdxEmailLink = ({ href, children }: { href?: string; children?: ReactNode }) => {
		const hrefWithQueryParams =
			href ? getLinkHref({ href, fanId, refererId: emailTemplateId }) : '';
		return <EmailLink href={hrefWithQueryParams}>{children}</EmailLink>;
	};

	return {
		a: MdxEmailLink,
	};
}
function mdxLinkButton({
	fanId,
	emailTemplateId,
}: {
	fanId: string;
	emailTemplateId: string;
}) {
	const LinkButton = ({ href, label }: { href: string; label: string }) => {
		const hrefWithQueryParams = getLinkHref({ href, fanId, refererId: emailTemplateId });

		return <EmailButton href={hrefWithQueryParams}>{label}</EmailButton>;
	};

	return {
		LinkButton,
	};
}

function mdxEmailAssetButton({
	emailTemplateId,
	cartFunnels,
	landingPages,
	links,
	pressKits,
	fanId,
}: {
	emailTemplateId: string;
	cartFunnels: CartFunnel[];
	landingPages: LandingPage[];
	links: Link[];
	pressKits: PressKit[];
	fanId: string;
}) {
	const AssetButton = ({ assetId, label }: { assetId: string; label: string }) => {
		const href = getAssetHref({
			assetId,
			cartFunnels,
			landingPages,
			links,
			pressKits,
			refererId: emailTemplateId,
			fanId,
		});

		return <EmailButton href={href}>{label}</EmailButton>;
	};

	return {
		AssetButton,
	};
}
