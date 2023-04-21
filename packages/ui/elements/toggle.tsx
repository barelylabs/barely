'use client';

import * as React from 'react';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, VariantProps } from 'class-variance-authority';
import { FieldAtom, useFieldActions, useFieldValue } from 'form-atoms';

import { cn } from '@barely/lib/utils/edge/cn';

import { FieldWrapper, FieldWrapperProps } from './field-wrapper';

const toggleVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors data-[state=on]:bg-slate-200 dark:hover:bg-slate-800 dark:data-[state=on]:bg-slate-700 focus:outline-none dark:text-slate-100 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-slate-900 hover:bg-slate-100  dark:hover:text-slate-100 dark:data-[state=on]:text-slate-100',
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				outline:
					'bg-transparent border border-slate-200 hover:bg-slate-100 dark:border-slate-700',
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

function ToggleField(
	props: React.ComponentProps<typeof TogglePrimitive.Root> &
		VariantProps<typeof toggleVariants> &
		Omit<FieldWrapperProps<boolean>, 'children'> & {
			fieldAtom: FieldAtom<boolean>;
		},
) {
	const { fieldAtom, ...rest } = props;
	const pressed = useFieldValue(fieldAtom);
	const fieldActions = useFieldActions(fieldAtom);

	return (
		<FieldWrapper fieldAtom={fieldAtom} {...rest}>
			<TogglePrimitive.Root
				{...rest}
				pressed={pressed}
				className={cn(
					toggleVariants({
						variant: rest.variant,
						size: rest.size,
						className: rest.className,
					}),
				)}
				onPressedChange={p => fieldActions.setValue(p)}
			/>
		</FieldWrapper>
	);
}

export { Toggle, ToggleField, toggleVariants };
