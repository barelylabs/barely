'use client';

import type { LinkMetaTags } from '@barely/validators';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import Image from 'next/image';
import { getDomainWithoutWWW } from '@barely/utils';

import { AspectRatio } from '@barely/ui/aspect-ratio';
import { BlurImage } from '@barely/ui/blur-image';
import { Icon } from '@barely/ui/icon';
import { LoadingSpinner } from '@barely/ui/loading';
import { ScrollArea } from '@barely/ui/scroll-area';
import { H } from '@barely/ui/typography';

interface SocialPreviewProps {
	hostname?: string | null;
	title?: string | null;
	description?: string | null;
	previewImage?: ReactNode;
}

export function TwitterPreview(props: SocialPreviewProps) {
	return (
		<div>
			<div className='relative mb-2'>
				<div className='absolute inset-0 flex items-center' aria-hidden='true'>
					<div className='w-full border-t border-border' />
				</div>
				<div className='relative flex justify-center'>
					<div className='flex items-center space-x-2 bg-white px-3'>
						<Icon.twitter className='h-4 w-4 text-[#1DA1F2]' />
						<p className='text-sm text-gray-400'>Twitter</p>
					</div>
				</div>
			</div>
			<div className='overflow-hidden rounded-md border border-border'>
				{props.previewImage}
				<div className='grid gap-1 p-3'>
					{props.hostname ?
						<p className='text-sm text-[#536471]'>{props.hostname}</p>
					:	<div className='mb-1 h-4 w-24 rounded-md bg-gray-100' />}
					{props.title ?
						<h3 className='truncate text-sm text-[#0f1419]'>{props.title}</h3>
					:	<div className='mb-1 h-4 w-full rounded-md bg-gray-100' />}
					{props.description ?
						<p className='line-clamp-2 text-sm text-[#536471]'>{props.description}</p>
					:	<div className='grid gap-2'>
							<div className='h-4 w-full rounded-md bg-gray-100' />
							<div className='h-4 w-48 rounded-md bg-gray-100' />
						</div>
					}
				</div>
			</div>
		</div>
	);
}

export function FacebookPreview(props: SocialPreviewProps) {
	return (
		<div>
			<div className='relative mb-2'>
				<div className='absolute inset-0 flex items-center' aria-hidden='true'>
					<div className='w-full border-t border-border' />
				</div>
				<div className='relative flex justify-center'>
					<div className='flex items-center space-x-2 bg-white px-3'>
						<Icon.facebook className='h-4 w-4 text-facebook' />
						<p className='text-sm text-gray-400'>Facebook</p>
					</div>
				</div>
			</div>
			<div className='overflow-hidden border border-border'>
				{props.previewImage}
				<div className='grid gap-1 bg-[#f2f3f5] p-3'>
					{props.hostname ?
						<p className='text-[0.8rem] uppercase text-[#606770]'>{props.hostname}</p>
					:	<div className='mb-1 h-4 w-24 rounded-md bg-gray-200' />}
					{props.title ?
						<h3 className='truncate font-semibold text-[#1d2129]'>{props.title}</h3>
					:	<div className='mb-1 h-5 w-full rounded-md bg-gray-200' />}
					{props.description ?
						<p className='line-clamp-2 text-sm text-[#606770]'>{props.description}</p>
					:	<div className='grid gap-2'>
							<div className='h-4 w-full rounded-md bg-gray-200' />
							<div className='h-4 w-48 rounded-md bg-gray-200' />
						</div>
					}
				</div>
			</div>
		</div>
	);
}

export function LinkedinPreview(props: SocialPreviewProps) {
	return (
		<div>
			<div className='relative mb-2'>
				<div className='absolute inset-0 flex items-center' aria-hidden='true'>
					<div className='w-full border-t border-border' />
				</div>
				<div className='relative flex justify-center'>
					<div className='flex items-center space-x-2 bg-white px-3'>
						<Icon.linkedin className='h-4 w-4' />
						<p className='text-sm text-gray-400'>LinkedIn</p>
					</div>
				</div>
			</div>
			<div className='overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_2px_3px_rgba(0,0,0,0.2)]'>
				{props.previewImage}
				<div className='grid gap-1 bg-white p-3'>
					{props.title ?
						<h3 className='truncate font-semibold text-[#000000E6]'>{props.title}</h3>
					:	<div className='mb-1 h-5 w-full rounded-md bg-gray-200' />}
					{props.hostname ?
						<p className='text-xs text-[#00000099]'>{props.hostname}</p>
					:	<div className='mb-1 h-4 w-24 rounded-md bg-gray-200' />}
				</div>
			</div>
		</div>
	);
}

interface SocialLinkPreviewsProps {
	url: string;
	metaTags?: LinkMetaTags;
	generatingMetaTags: boolean;
	closeModal: () => Promise<void>;
}

export function SocialLinkPreviews({
	url,
	metaTags,
	generatingMetaTags,
}: SocialLinkPreviewsProps) {
	const hostname = useMemo(() => {
		return getDomainWithoutWWW(url);
	}, [url]);

	const previewImage = useMemo(() => {
		if (generatingMetaTags) {
			return (
				<div className='flex h-[250px] w-full flex-col items-center justify-center space-y-4 border-b border-border bg-gray-100'>
					<LoadingSpinner color='muted' />
				</div>
			);
		}

		if (metaTags?.image) {
			if (metaTags.image.startsWith('https://res.cloudinary.com')) {
				return (
					<BlurImage
						src={metaTags.image}
						alt='Preview'
						width={1200}
						height={627}
						className='h-[250px] w-full border-b border-border object-cover'
					/>
				);
			} else {
				return (
					<AspectRatio
						id='aspect'
						ratio={572 / 300}
						className='items-center justify-center rounded-none border-b border-border'
					>
						<Image
							src={metaTags.image}
							alt='Preview'
							className='w-full object-cover'
							fill
							unoptimized
						/>
					</AspectRatio>
				);
			}
		}
		return (
			<div className='flex h-[250px] w-full flex-col items-center justify-center space-y-4 border-b border-border bg-gray-100'>
				<Icon.image strokeWidth={1} className='h-8 w-8 text-gray-400' />
				<p className='text-sm text-gray-400'>Enter a link to generate a preview.</p>
			</div>
		);
	}, [metaTags?.image, generatingMetaTags]);

	const socialPreviewProps = {
		hostname,
		title: metaTags?.title,
		description: metaTags?.description,
		previewImage,
	};

	return (
		<ScrollArea hideScrollbar className='md:max-h-[90vh]'>
			<div className='flex flex-col'>
				<div className='relative z-10 flex flex-col gap-2 border-b border-border bg-background p-4 text-center md:sticky md:top-0'>
					<Icon.share className='mx-auto h-6 w-6' />
					<H size='5' muted>
						Social Previews
					</H>
				</div>

				{/* <pre>{JSON.stringify(linkForm.watch(), null, 2)}</pre> */}

				<div className='flex w-full flex-col gap-10 px-6 py-6'>
					<TwitterPreview {...socialPreviewProps} />
					<FacebookPreview {...socialPreviewProps} />
					<LinkedinPreview {...socialPreviewProps} />
				</div>
			</div>
		</ScrollArea>
	);
}
