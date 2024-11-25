import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { ReactNode } from 'react';
import React from 'react';
import {
	Body,
	EmailButton,
	EmailContainer,
	EmailImage,
	EmailLink,
} from '@barely/email/src/primitives';
import { Heading, Html, Preview, Text } from '@react-email/components';
import { MDXRemote } from 'next-mdx-remote/rsc';

import type { MdxAssets } from '../../../utils/mdx';
import type { MdxImageSize } from '../../mdx/mdx.constants';
import type { EventTrackingProps } from '../event/event-report.schema';
import type { EmailTemplateVariableName } from './email-template.constants';
import { env } from '../../../env';
import { getAssetHref, getLinkHref } from '../../../utils/mdx';
import { MDX_IMAGE_SIZE_TO_WIDTH } from '../../mdx/mdx.constants';

export async function renderMarkdownToReactEmail({
	subject,
	previewText,
	body,
	variables,
	tracking,
	assets,
	listUnsubscribeUrl,
}: {
	subject: string;
	previewText?: string | null;
	body: string;
	variables: Record<EmailTemplateVariableName, string>;
	tracking: EventTrackingProps;
	assets: MdxAssets;
	listUnsubscribeUrl?: string;
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

		...mdxEmailLink({ tracking }),
		...mdxEmailImageFile(),
		...mdxLinkButton({ tracking }),
		...mdxEmailAssetButton({
			tracking,
			assets,
		}),
	};

	const awaitedBody = await MDXRemote({
		source: bodyWithVars,
		components,
	});

	const unsubscribeLink =
		listUnsubscribeUrl ?
			<div
				style={{ marginTop: '1.25rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}
			>
				<EmailLink href={listUnsubscribeUrl}>unsubscribe</EmailLink>
			</div>
		:	null;

	const reactBody = (
		<Html>
			{previewText && <Preview>{previewText}</Preview>}
			<Body>
				<EmailContainer>
					{awaitedBody}
					{unsubscribeLink}
				</EmailContainer>
			</Body>
		</Html>
	);

	// if (previewText && previewText.length > 0) {
	// 	reactBody = (
	// 		<>
	// 			<Body>{reactBody}</Body>
	// 		</>
	// 	);
	// }

	// if (listUnsubscribeUrl) {
	// 	const unsubscribeLink = (
	// 		<div
	// 			style={{ marginTop: '1.25rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}
	// 		>
	// 			<EmailLink href={listUnsubscribeUrl}>unsubscribe</EmailLink>
	// 		</div>
	// 	);
	// 	reactBody = (
	// 		<>
	// 			{reactBody}
	// 			{unsubscribeLink}
	// 		</>
	// 	);
	// }

	return {
		subject: subjectWithVars,
		reactBody,
	};
}

function mdxEmailLink({ tracking }: { tracking: EventTrackingProps }) {
	const MdxEmailLink = ({ href, children }: { href?: string; children?: ReactNode }) => {
		const hrefWithQueryParams = href ? getLinkHref({ href, tracking }) : '';
		return <EmailLink href={hrefWithQueryParams}>{children}</EmailLink>;
	};

	return {
		a: MdxEmailLink,
	};
}

function mdxEmailImageFile() {
	const MdxEmailImageFile = ({
		s3Key,
		alt,
		width,
		height,
		size = 'md',
	}: {
		s3Key: string;
		size: MdxImageSize;
		alt: string;
		width: number;
		height: number;
	}) => {
		const adjustedWidth = MDX_IMAGE_SIZE_TO_WIDTH[size];
		const aspectRatio = width / height;
		const adjustedHeight = Math.round(adjustedWidth / aspectRatio);

		const src = `${env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN}/${s3Key}?format=auto&width=${Math.round(adjustedWidth * 1.5)}`;
		return (
			<EmailImage
				src={src}
				alt={alt}
				width={adjustedWidth}
				height={adjustedHeight}
				style={{
					borderRadius: '6px',
					margin: '16px 0',
				}}
			/>
		);
	};

	return {
		ImageFile: MdxEmailImageFile,
	};
}

function mdxLinkButton({ tracking }: { tracking: EventTrackingProps }) {
	const LinkButton = ({ href, label }: { href: string; label: string }) => {
		const hrefWithQueryParams = getLinkHref({ href, tracking });

		return <EmailButton href={hrefWithQueryParams}>{label}</EmailButton>;
	};

	return {
		LinkButton,
	};
}

function mdxEmailAssetButton({
	tracking,
	assets,
}: {
	tracking: EventTrackingProps;
	assets: MdxAssets;
}) {
	const AssetButton = ({ assetId, label }: { assetId: string; label: string }) => {
		const href = getAssetHref({
			assetId,
			assets,
			tracking,
		});

		return <EmailButton href={href}>{label}</EmailButton>;
	};

	return {
		AssetButton,
	};
}
