import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import React from 'react';
import { cn } from '@barely/lib/utils/cn';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';

const labelVariants = cva(
	'py-1 font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
	{
		variants: {
			size: {
				sm: 'text-sm',
				md: 'text-md',
				lg: 'text-lg',
			},
		},
		defaultVariants: {
			size: 'sm',
		},
	},
);

export type LabelStylesProps = VariantProps<typeof labelVariants>;

export interface LabelProps extends VariantProps<typeof labelVariants> {
	htmlFor?: string;
	className?: string;
	children: ReactNode;
}

export const Label = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
		VariantProps<typeof labelVariants>
>(({ size, className, ...props }, ref) => (
	<LabelPrimitive.Root
		ref={ref}
		className={cn(labelVariants({ size }), className)}
		{...props}
	/>
));
Label.displayName = LabelPrimitive.Root.displayName;

// const Label = ({ size, className, ...props }: LabelProps) => {
// 	return (
// 		<label
// 			htmlFor={props.htmlFor}
// 			className={cn(labelStyles({ size }), className)}
// 			{...props}
// 		>
// 			{props.children}
// 		</label>
// 	);
// };

// export { Label };
