'use client';

import { forwardRef } from 'react';
import { cn } from '@barely/lib/utils/cn';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

export const Separator = forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
	<SeparatorPrimitive.Root
		ref={ref}
		decorative={decorative}
		orientation={orientation}
		className={cn(
			'shrink-0 bg-border',
			orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
			className,
		)}
		{...props}
	/>
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

/* usage

import { Separator } from "@/components/ui/separator"

<Separator />

*/
