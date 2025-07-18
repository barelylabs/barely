'use client';

import * as React from 'react';
import { cn } from '@barely/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

function ScrollArea({
	className,
	children,
	hideScrollbar = false,
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
	hideScrollbar?: boolean;
}) {
	return (
		<ScrollAreaPrimitive.Root
			data-slot='scroll-area'
			className={cn('relative', className)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				data-slot='scroll-area-viewport'
				className='size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50'
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar className={cn(hideScrollbar && 'hidden')} />
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	);
}

function ScrollBar({
	className,
	orientation = 'vertical',
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			data-slot='scroll-area-scrollbar'
			orientation={orientation}
			className={cn(
				'flex touch-none select-none p-px transition-colors',
				orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
				orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot='scroll-area-thumb'
				className='relative flex-1 rounded-full bg-border'
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	);
}

export { ScrollArea, ScrollBar };

// 'use client';

// import * as React from 'react';
// import { cn } from '@barely/utils';
// import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

// // export const ScrollAreaViewportContext =
// //   React.createContext<React.RefObject<HTMLDivElement> | null>(null);

// const ScrollArea = React.forwardRef<
// 	React.ElementRef<typeof ScrollAreaPrimitive.Root>,
// 	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
// 		hideScrollbar?: boolean;
// 		viewportRef?: React.Ref<HTMLDivElement>;
// 	}
// >(({ className, viewportRef, hideScrollbar = false, children, ...props }, ref) => {
// 	return (
// 		<ScrollAreaPrimitive.Root
// 			ref={ref}
// 			className={cn('relative overflow-hidden', className)}
// 			{...props}
// 		>
// 			<ScrollAreaPrimitive.Viewport
// 				ref={viewportRef}
// 				className='h-full w-full rounded-[inherit] [&>div]:!block'
// 			>
// 				{children}
// 			</ScrollAreaPrimitive.Viewport>
// 			<ScrollBar className={cn(hideScrollbar && 'hidden')} />
// 			<ScrollAreaPrimitive.Corner />
// 		</ScrollAreaPrimitive.Root>
// 	);
// });
// ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// const ScrollBar = React.forwardRef<
// 	React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
// 	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
// >(({ className, orientation = 'vertical', hidden, ...props }, ref) => (
// 	<ScrollAreaPrimitive.ScrollAreaScrollbar
// 		ref={ref}
// 		orientation={orientation}
// 		className={cn(
// 			'flex touch-none select-none transition-colors',
// 			hidden && 'hidden',
// 			orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
// 			orientation === 'horizontal' && 'h-2.5 border-t border-t-transparent p-[1px]',
// 			className,
// 		)}
// 		{...props}
// 	>
// 		<ScrollAreaPrimitive.ScrollAreaThumb className='relative flex-1 rounded-full bg-slate-300 dark:bg-slate-700' />
// 	</ScrollAreaPrimitive.ScrollAreaScrollbar>
// ));
// ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// export { ScrollArea, ScrollBar };

// /* usage

// import { ScrollArea } from "@/components/ui/scroll-area"

// <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
//   Jokester began sneaking into the castle in the middle of the night and leaving
//   jokes all over the place: under the king's pillow, in his soup, even in the
//   royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
//   then, one day, the people of the kingdom discovered that the jokes left by
//   Jokester were so funny that they couldn't help but laugh. And once they
//   started laughing, they couldn't stop.
// </ScrollArea>

// */
