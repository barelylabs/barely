// https://ui.shadcn.com/docs/primitives/button

import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@barely/lib/utils/cn';
import { Loader2 } from 'lucide-react';

import type { ButtonVariants } from './button.variants';
import { buttonIconVariants, buttonVariants } from './button.variants';
import { Icon } from './icon';
import { Tooltip } from './tooltip';

interface ButtonBaseProps extends VariantProps<ButtonVariants> {
	iconClassName?: string;
	/** left-aligned icon */
	startIcon?: keyof typeof Icon;
	/** right-aligned icon */
	endIcon?: keyof typeof Icon;
	/** loading state */
	loading?: boolean;
	loadingText?: React.ReactNode;
	disabled?: boolean;
	disabledTooltip?: string | React.ReactNode;
	selected?: boolean;
	/** styling */
	fullWidth?: boolean;
	pill?: boolean;
	icon?: boolean;
	// color?: 'pink' | 'blue';
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
			variant = 'button',
			look = 'primary',
			type = 'button' /* bc the default type of a button should be "button" */,
			size = 'md',
			loading = false,
			loadingText,
			disabledTooltip,
			selected = false,
			/* styles */
			// color,
			pill,
			fullWidth,
			/* icon */
			startIcon,
			endIcon,
			iconClassName,
			/* attributes from 'HTMLAnchorProps' or 'HTMLButtonProps' */
			children,
			...props
		},
		ref,
	) => {
		const classes = cn(
			buttonVariants({
				variant,
				look: look,
				size,
				selected,
				loading,
				pill,
				fullWidth,
			}),
			// color === 'pink' && 'bg-pink-500 text-white hover:bg-pink-600',
			className,
		);

		if ('href' in props && props.href !== undefined) {
			return (
				<Link {...props} className={classes} passHref>
					{children}
				</Link>
			);
		}

		const StartIcon = startIcon ? Icon[startIcon] : null;
		const EndIcon = endIcon ? Icon[endIcon] : null;

		const btn = (
			<span
				className={cn(
					'flex items-center justify-center',
					props.disabled ? 'cursor-not-allowed' : '',
				)}
			>
				<button
					ref={ref}
					type={type as 'button' | 'submit' | 'reset'}
					className={classes}
					disabled={loading ?? props.disabled}
					{...props}
					/* if button is disabled, prevent onClick handler */
					onClick={
						props.disabled ? (e: React.MouseEvent) => e.preventDefault() : props.onClick
					}
				>
					{StartIcon && (
						<StartIcon
							className={cn(
								buttonIconVariants({
									variant,
									look: look,
									size,
									position: 'start',
								}),
								iconClassName,
							)}
						/>
					)}

					{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
					{loading && loadingText ? loadingText : children}

					{EndIcon && (
						<EndIcon
							className={cn(
								buttonIconVariants({
									variant,
									look: look,
									size,
									position: 'end',
								}),
								iconClassName,
							)}
						/>
					)}
				</button>
			</span>
		);

		if (props.disabled && disabledTooltip)
			return <Tooltip content={disabledTooltip}>{btn}</Tooltip>;

		return btn;
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants, type ButtonProps };
