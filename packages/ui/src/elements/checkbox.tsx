'use client';

import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@barely/utils';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';

const checkboxVariants = cva(
	'peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			look: {
				primary:
					'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
				brand:
					'data-[state=checked]:text-brand-foreground border-brand data-[state=checked]:border-brand data-[state=checked]:bg-brand',
			},
			size: {
				sm: 'h-4 w-4',
				md: 'h-[17px] w-[17px]',
				lg: 'h-6 w-6',
			},
		},
	},
);

export type CheckboxProps = React.ComponentPropsWithoutRef<
	typeof CheckboxPrimitive.Root
> &
	VariantProps<typeof checkboxVariants>;

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, look = 'primary', size = 'md', ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(checkboxVariants({ look, size }), className)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn('flex items-center justify-center text-current')}
		>
			<Check
				strokeWidth={3.6}
				className={cn(
					'-mt-[1px]',
					size === 'sm' && 'h-3 w-3',
					size === 'md' && 'h-[15px] w-[15px]',
					size === 'lg' && 'h-5 w-5',
				)}
			/>
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
