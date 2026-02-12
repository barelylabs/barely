// https://ui.shadcn.com/docs/primitives/avatar

'use client';

import * as React from 'react';
import { cn } from '@barely/utils';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { Img } from './img';

const AvatarRoot = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn(
			'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
			className,
		)}
		{...props}
	/>
));
AvatarRoot.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn('aspect-square h-full w-full', className)}
		{...props}
	/>
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			'flex h-full w-full items-center justify-center rounded-full bg-muted',
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const Avatar = (props: {
	size?: string;
	imageWidth: number;
	imageHeight: number;
	imageBlurDataUrl?: string;
	imageS3Key?: string;
	imageUrl?: string;
	displayName?: string;
	initials?: string;
	className?: string;
	sizes?: string;
	priority?: boolean;
	notification?: boolean;
}) => {
	return (
		<div className='relative inline-flex'>
			{props.notification && (
				<div className='absolute -right-0.5 -top-0.5 z-10 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900' />
			)}
			<AvatarRoot className={props.className}>
				{props.imageS3Key?.length ?
					<>
						<Img
							s3Key={props.imageS3Key}
							alt={props.displayName ?? ''}
							className={cn('aspect-square h-full w-full', props.className)}
							sizes={props.sizes}
							priority={props.priority}
							width={props.imageWidth}
							height={props.imageHeight}
							blurDataURL={props.imageBlurDataUrl}
							// fill
						/>
					</>
				: props.imageUrl ?
					<Img
						src={props.imageUrl}
						alt={props.displayName ?? ''}
						className={cn('aspect-square h-full w-full', props.className)}
						sizes={props.sizes}
						priority={props.priority}
						width={props.imageWidth}
						height={props.imageHeight}
						// fill
					/>
				:	<AvatarFallback>{props.initials}</AvatarFallback>}
			</AvatarRoot>
		</div>
	);
};

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback };

/* usage

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

*/
