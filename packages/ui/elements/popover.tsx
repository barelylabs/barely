'use client';

import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';
import * as PopoverPrimitive from '@radix-ui/react-popover';

export const Popover = PopoverPrimitive.Root;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverArrow = PopoverPrimitive.Arrow;

export const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
		container?: HTMLElement | null;
	}
>(({ className, align = 'center', sideOffset = 4, container, ...props }, ref) => (
	<PopoverPrimitive.Portal container={container}>
		<PopoverPrimitive.Content
			id='popover-backdrop'
			ref={ref}
			align={align}
			sideOffset={sideOffset}
			className={cn(
				'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ',
				className,
			)}
			onEscapeKeyDown={e => {
				// e.preventDefault();
				e.stopPropagation();
			}}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// export { Popover, PopoverTrigger, PopoverContent };

/* usage 

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Place content for the popover here.</PopoverContent>
</Popover>


*/
