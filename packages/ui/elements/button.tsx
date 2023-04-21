// https://ui.shadcn.com/docs/primitives/button

'use client';

import * as React from 'react';

import { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { cn } from '@barely/lib/utils/edge/cn';

import { buttonVariants, ButtonVariants } from './button.variants';

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<ButtonVariants> {
	pill?: boolean;
	icon?: boolean;
	loading?: boolean;
	loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			pill,
			icon,
			loading,
			loadingText,
			children,
			fullWidth,
			...props
		},
		ref,
	) => {
		return (
			<button
				type={props.type ?? 'button'}
				className={cn(
					buttonVariants({ variant, size, fullWidth, className }),
					variant === 'link' && 'p-0 h-fit focus:ring-transparent m-0',
					pill && 'rounded-full',
					icon && 'h-fit px-2 py-2',
				)}
				disabled={loading}
				ref={ref}
				{...props}
			>
				{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				{loading && loadingText ? loadingText : children}
			</button>
		);
	},
);
Button.displayName = 'Button';

const SubmitButton = ({ children, ...props }: ButtonProps) => {
	const { formState } = useFormContext();
	return (
		<>
			<Button type='submit' loading={formState.isSubmitting} {...props}>
				{children}
			</Button>
		</>
	);
};

export { Button, SubmitButton, buttonVariants };
