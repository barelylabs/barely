// https://ui.shadcn.com/docs/primitives/switch

'use client';

import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';

import { Tooltip } from './tooltip';

const switchVariants = cva(
	'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input data-[state=unchecked]:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				lg: 'h-[24px] w-[44px]',
				md: 'h-[20px] w-[36px]',
				sm: 'h-[16px] w-[28px]',
			},
		},
		defaultVariants: {
			size: 'sm',
		},
	},
);

const switchThumbVariants = cva(
	'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
	{
		variants: {
			size: {
				lg: 'h-5 w-5 data-[state=checked]:translate-x-5',
				md: 'h-4 w-4 data-[state=checked]:translate-x-4',
				sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
			},
		},
		defaultVariants: {
			size: 'sm',
		},
	},
);

export interface SwitchAddonProps extends VariantProps<typeof switchVariants> {
	disabled?: boolean;
	disabledTooltip?: string | React.ReactNode;
}

export const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & SwitchAddonProps
>(({ className, size, disabled = false, disabledTooltip, ...props }, ref) => {
	if (disabled && disabledTooltip) {
		return (
			<Tooltip content={disabledTooltip}>
				<div
					className={cn(
						switchVariants({ size }),
						'relative cursor-not-allowed bg-slate-200 radix-state-checked:bg-primary radix-state-unchecked:bg-input radix-state-unchecked:bg-slate-200',
					)}
					data-state='delayed-open'
				>
					<div
						className={cn(switchThumbVariants({ size }), 'rounded-full bg-background')}
						data-state={props.checked ? 'checked' : 'unchecked'}
					/>
				</div>
			</Tooltip>
		);
	}

	return (
		<SwitchPrimitives.Root
			className={cn(switchVariants({ size }), className)}
			disabled={disabled}
			{...props}
			ref={ref}
		>
			<SwitchPrimitives.Thumb className={cn(switchThumbVariants({ size }))} />
		</SwitchPrimitives.Root>
	);
});
Switch.displayName = SwitchPrimitives.Root.displayName;
