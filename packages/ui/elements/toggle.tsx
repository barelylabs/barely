'use client';

import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva } from 'class-variance-authority';

const toggleVariants = cva(
	// 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors data-[state=on]:bg-slate-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-100 dark:data-[state=on]:bg-slate-700 dark:data-[state=on]:text-slate-100 dark:hover:bg-slate-800  dark:hover:text-slate-100 dark:focus:ring-offset-slate-900',
	// 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors data-[state=on]:bg-accent data-[state=on]:text-accent-foreground hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors data-[state=on]:bg-accent data-[state=on]:text-accent-foreground hover:bg-muted  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				outline:
					'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
			},
			size: {
				sm: 'h-9 px-2.5',
				md: 'h-10 px-3',
				lg: 'h-11 px-5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	},
);

const Toggle = React.forwardRef<
	React.ElementRef<typeof TogglePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
		VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
	<TogglePrimitive.Root
		ref={ref}
		className={cn(toggleVariants({ variant, size, className }))}
		{...props}
	/>
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
