// https://ui.shadcn.com/docs/primitives/button

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@barely/lib/utils/cn';
import { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { buttonVariants, ButtonVariants } from './button.variants';
import { Tooltip } from './tooltip';

interface ButtonBaseProps extends VariantProps<ButtonVariants> {
	pill?: boolean;
	icon?: boolean;
	loading?: boolean;
	loadingText?: React.ReactNode;
	fullWidth?: boolean;
	disabledTooltip?: string | React.ReactNode;
	selected?: boolean;
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
			disabledTooltip,
			selected,
			...props
		},
		ref,
	) => {
		const classes = cn(
			buttonVariants({ variant, size, selected, className }),
			variant === 'link' && 'p-0 h-fit focus:ring-transparent m-0',
			variant === 'tab' && 'focus:ring-transparent',
			pill && 'rounded-full',
			fullWidth && 'w-full',
			icon && 'h-fit p-0 focus:ring-transparent',
			// selected === true && variant=== 'tab' && 'bg-opacity-10',
			className,
		);

		if ('href' in props && props.href !== undefined) {
			return (
				<Link {...props} className={classes} passHref>
					{children}
				</Link>
			);
		}

		const btn = (
			<span className={props.disabled ? 'cursor-not-allowed' : ''}>
				<button
					type={props.type ?? 'button'}
					className={classes}
					disabled={loading || props.disabled}
					ref={ref}
					{...props}
				>
					{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
					{loading && loadingText ? loadingText : children}
				</button>
			</span>
		);

		if (props.disabled && disabledTooltip)
			return <Tooltip content={disabledTooltip}>{btn}</Tooltip>;

		return btn;
	},
);
Button.displayName = 'Button';

// const Highlight =

export { Button, buttonVariants, type ButtonProps };
