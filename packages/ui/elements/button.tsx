// https://ui.shadcn.com/docs/primitives/button

import * as React from 'react';

import Link from 'next/link';

import { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@barely/lib/utils/edge/cn';

import { buttonVariants, ButtonVariants } from './button.variants';

interface ButtonBaseProps extends VariantProps<ButtonVariants> {
	pill?: boolean;
	icon?: boolean;
	loading?: boolean;
	loadingText?: React.ReactNode;
	fullWidth?: boolean;
}

interface ButtonAsAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string;
}

interface ButtonAsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	href?: never;
}

type ButtonProps = ButtonBaseProps & (ButtonAsAnchorProps | ButtonAsButtonProps);

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
		const classes = cn(
			buttonVariants({ variant, size, className }),
			variant === 'link' && 'p-0 h-fit focus:ring-transparent m-0',
			pill && 'rounded-full',
			fullWidth && 'w-full',
			icon && 'h-fit px-2 py-2',
		);

		if ('href' in props && props.href !== undefined) {
			return (
				<Link {...props} className={classes} passHref>
					{children}
				</Link>
			);
		}

		return (
			<button
				type={props.type ?? 'button'}
				className={classes}
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

// const Highlight =

export { Button, buttonVariants, type ButtonProps };
