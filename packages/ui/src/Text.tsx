// https://www.youtube.com/watch?v=b1NEj8HG1yU
import { cn } from '@barely/utils/edge';
import { cva, VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';

const textStyles = cva([], {
	variants: {
		size: {
			sm: 'p-2 text-base',
			md: 'p-3 text-base',
			lg: 'p-4 text-base',
		},
		weight: {
			light: 'font-light',
			normal: 'font-normal',
			medium: 'font-medium',
			semibold: 'font-semibold',
			bold: 'font-bold',
		},
	},
});

type TextStylesProps = VariantProps<typeof textStyles>;

export interface TextProps extends Omit<TextStylesProps, 'size' | 'weight'> {
	variant?: `${NonNullable<TextStylesProps['size']>}/${NonNullable<
		TextStylesProps['weight']
	>}`;
	children: ReactNode;
	className?: string;
}

export function Text({ variant, children, className, ...props }: TextProps) {
	const [size, weight]: [TextStylesProps['size'], TextStylesProps['weight']] = !variant
		? ['md', 'normal']
		: (variant.split('/') as [TextStylesProps['size'], TextStylesProps['weight']]);

	return (
		<div className={cn(textStyles({ size: size, weight, ...props }), className)}>
			{children}
		</div>
	);
}
