'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@barely/utils';

import { Button } from '@barely/ui/button';

interface MarketingButtonProps {
	variant?: 'hero-primary' | 'hero-secondary' | 'platform' | 'glass';
	href?: string;
	glow?: boolean;
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
}

export const MarketingButton = forwardRef<HTMLButtonElement, MarketingButtonProps>(
	(
		{
			variant = 'hero-primary',
			className,
			href,
			glow = false,
			children,
			onClick,
			disabled,
			type,
		},
		ref,
	) => {
		const variantStyles = {
			'hero-primary': cn(
				'relative h-12 px-8 text-base font-medium text-white shadow-lg',
				'bg-gradient-to-r from-secondary to-primary',
				'hover:scale-105 hover:shadow-xl',
				'transition-all duration-200',
				glow && 'glow-blue',
			),
			'hero-secondary': cn(
				'h-12 px-8 text-base font-medium',
				'border border-white/20 bg-white/5 text-white backdrop-blur-sm',
				'hover:border-white/30 hover:bg-white/10',
				'transition-all duration-200',
			),
			platform: cn(
				'h-10 px-6 text-sm font-medium text-white shadow-md',
				'bg-accent hover:bg-accent/90',
				'transition-all duration-200',
			),
			glass: cn(
				'h-10 px-6 text-sm font-medium',
				'glass text-white',
				'hover:bg-white/10',
				'transition-all duration-200',
			),
		};

		const baseStyles = cn(variantStyles[variant], className);

		if (href) {
			return (
				<Link
					href={href}
					className={cn(
						baseStyles,
						'inline-flex items-center justify-center rounded-md text-center no-underline',
					)}
				>
					{children}
				</Link>
			);
		}

		return (
			<Button
				ref={ref}
				className={baseStyles}
				onClick={onClick}
				disabled={disabled}
				type={type}
			>
				{children}
			</Button>
		);
	},
);

MarketingButton.displayName = 'MarketingButton';
