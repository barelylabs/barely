// https://ui.shadcn.com/docs/primitives/button

'use client';

import type { VariantProps } from 'class-variance-authority';
import type { ButtonProps as ReactAriaButtonProps } from 'react-aria-components';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@barely/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { useButton, useLink } from 'react-aria';
import { ButtonContext, useContextProps } from 'react-aria-components';

import type { ButtonVariants } from './button.variants';
import { buttonIconVariants, buttonVariants } from './button.variants';
import { Icon } from './icon';
import { Tooltip } from './tooltip';

type AriaButtonProps = ReactAriaButtonProps & VariantProps<ButtonVariants>;

// interface ButtonBaseProps extends VariantProps<ButtonVariants>  {
interface ButtonBaseProps extends AriaButtonProps {
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
			className,
		);
		const StartIcon = startIcon ? Icon[startIcon] : null;
		const EndIcon = endIcon ? Icon[endIcon] : null;

		const [ariaProps, ariaRef] = useContextProps(props, ref, ButtonContext);
		const { buttonProps } = useButton(ariaProps, ariaRef);

		const { linkProps } = useLink(ariaProps, ariaRef);

		const loadingLabel =
			!loadingText && typeof children === 'string' ?
				children
					.replace(/Create/g, 'Creating')
					.replace(/Save/g, 'Saving')
					.replace(/Update/g, 'Updating')
					.replace(/Delete/g, 'Deleting')
					// .replace(/Add/g, 'Adding')
					.replace(/Remove/g, 'Removing')
					.replace(/Edit/g, 'Editing')
					.replace(/Close/g, 'Closing')
					.replace(/Load/g, 'Loading')
			: loadingText ? loadingText
			: children;

		if ('href' in props && props.href !== undefined) {
			return (
				<Link {...props} {...linkProps} className={classes} passHref>
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
					{loading ? loadingLabel : children}
				</Link>
			);
		}

		const btn = (
			<span
				className={cn(
					'flex items-center justify-center',
					props.disabled ? 'cursor-not-allowed' : '',
					fullWidth ? 'w-full' : '',
				)}
			>
				<button
					ref={ref}
					{...buttonProps}
					// {...props}
					type={type}
					className={classes}
					disabled={loading || props.disabled}
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
					{loading ? loadingLabel : children}

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

const LoadingLinkButton = ({
	children,
	...props
}: ButtonBaseProps & ButtonAsAnchorProps) => {
	const [isLoading, setIsLoading] = React.useState(false);
	return (
		<Button
			{...props}
			onClick={(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
				setIsLoading(true);
				(
					props.onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
				)?.(e);
			}}
			loading={props.loading ?? isLoading}
		>
			{children}
		</Button>
	);
};

export { Button, LoadingLinkButton, buttonVariants, type ButtonProps };
