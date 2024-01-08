// https://ui.shadcn.com/docs/primitives/hover-card

'use client';

import * as React from 'react';

import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from '@barely/lib/utils/cn';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
	React.ElementRef<typeof HoverCardPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
	<HoverCardPrimitive.Content
		ref={ref}
		align={align}
		sideOffset={sideOffset}
		className={cn(
			'z-50 w-64 rounded-md border bg-popover text-popover-foreground p-4 shadow-md outline-none animate-in zoom-in-90 ',
			className,
		)}
		{...props}
	/>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

/* usage 

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">@nextjs</h4>
      <p className="text-sm">
        The React Framework – created and maintained by @vercel.
      </p>
    </div>
  </HoverCardContent>
</HoverCard>


*/
