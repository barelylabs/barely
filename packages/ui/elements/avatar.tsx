// https://ui.shadcn.com/docs/primitives/avatar

'use client';

import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';
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
			'flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700',
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const Avatar = (props: {
	size?: string;
	imageUrl?: string;
	displayName?: string;
	initials?: string;
	className?: string;
	sizes?: string;
	priority?: boolean;
}) => {
	return (
		<AvatarRoot className={props.className}>
			{props.imageUrl?.length ? (
				<Img
					src={props.imageUrl}
					alt={props.displayName ?? ''}
					className={cn('aspect-square h-full w-full', props.className)}
					sizes={props.sizes}
					priority={props.priority}
					fill
				/>
			) : (
				<AvatarFallback>{props.initials}</AvatarFallback>
			)}
		</AvatarRoot>
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
