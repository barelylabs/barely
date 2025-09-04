/* eslint-disable @typescript-eslint/no-explicit-any */ // fixme once react 19 is supported

import type { EmailTemplateVariableName, MdxImageSize } from '@barely/const';
import type { MdxAssets } from '@barely/utils';
import type { EventTrackingProps } from '@barely/validators';
import type { MDXComponents } from 'mdx/types';
import React from 'react';
import { MDX_IMAGE_SIZE_TO_WIDTH } from '@barely/const';
import {
	Body,
	EmailButton,
	EmailContainer,
	EmailImage,
	EmailLink,
} from '@barely/email/primitives';
import { getAssetHref, getTrackingEnrichedHref } from '@barely/utils';
import { Heading, Html, Preview, Text } from '@react-email/components';
import { MDXRemote } from 'next-mdx-remote-client/rsc';

import { libEnv } from '../../env';

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

	const components: MDXComponents = {
		// ignore all these any types
		p: (props: { children?: any }) => <Text>{props.children}</Text>,
		h1: (props: { children?: any }) => <Heading as='h1'>{props.children}</Heading>,
		h2: (props: { children?: any }) => <Heading as='h2'>{props.children}</Heading>,
		h3: (props: { children?: any }) => <Heading as='h3'>{props.children}</Heading>,
		h4: (props: { children?: any }) => <Heading as='h4'>{props.children}</Heading>,
		h5: (props: { children?: any }) => <Heading as='h5'>{props.children}</Heading>,
		h6: (props: { children?: any }) => <Heading as='h6'>{props.children}</Heading>,

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

	return {
		subject: subjectWithVars,
		reactBody,
	};
}

function mdxEmailLink({ tracking }: { tracking: EventTrackingProps }) {
	const MdxEmailLink = (props: { href?: string; children?: any }) => {
		const hrefWithQueryParams =
			props.href ? getTrackingEnrichedHref({ href: props.href, tracking }) : '';
		// return <a href={hrefWithQueryParams}>{props.children}</a>;
		return <EmailLink href={hrefWithQueryParams}>{props.children}</EmailLink>;
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

		const src = `${libEnv.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN}/${s3Key}?format=auto&width=${Math.round(adjustedWidth * 1.5)}`;
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
		const hrefWithQueryParams = getTrackingEnrichedHref({ href, tracking });

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
