import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { cva } from 'class-variance-authority';

import { WrapBalancer } from './wrap-balancer';

// import WrapBalancer, {
//   Provider as WrapBalancerProvider,
// } from "react-wrap-balancer";

const textStyles = cva(['align-text-bottom leading-none'], {
	variants: {
		size: {
			'2xs': 'text-3xs sm:text-2xs',
			xs: 'text-2xs sm:text-xs',
			sm: 'leading-1 text-xs sm:text-sm',
			md: 'text-sm sm:text-base',
			lg: 'text-md sm:text-lg',
			xl: 'text-lg sm:text-xl',
			'2xl': 'text-xl sm:text-2xl',
			'3xl': 'text-2xl sm:text-3xl',
		},
		weight: {
			light: 'font-light',
			normal: 'font-normal',
			medium: 'font-medium',
			semibold: 'font-semibold',
			bold: 'font-bold',
		},

		subtle: { true: 'text-subtle-foreground' },
		muted: { true: 'text-muted-foreground' },
		underline: { true: 'underline' },
	},
	defaultVariants: { size: 'md', weight: 'normal' },
});

type TextStylesProps = VariantProps<typeof textStyles>;

export interface TextProps extends Omit<TextStylesProps, 'size' | 'weight'> {
	variant?: `${NonNullable<TextStylesProps['size']>}/${NonNullable<
		TextStylesProps['weight']
	>}`;
	children: ReactNode;
	className?: string;
}

const Text = ({ variant, children, className, ...props }: TextProps) => {
	const [size, weight]: [TextStylesProps['size'], TextStylesProps['weight']] = !variant
		? ['md', 'normal']
		: (variant.split('/') as [TextStylesProps['size'], TextStylesProps['weight']]);

	return (
		<p className={cn(textStyles({ size: size, weight, ...props }), className)}>
			{children}
		</p>
	);
};

const headerStyles = cva(['scroll-m-20 font-heading '], {
	variants: {
		size: {
			hero: 'text-6xl md:text-7xl lg:text-[105px]',
			title: 'text-5xl lg:text-6xl',
			'1': 'text-4xl lg:text-5xl',
			'2': 'text-3xl lg:text-4xl',
			'3': 'text-2xl lg:text-3xl',
			'4': 'text-xl lg:text-2xl',
			'5': 'text-lg',
		},

		subtle: { true: 'text-subtle-foreground' },
		muted: { true: 'text-muted-foreground' },
		underline: { true: 'underline' },
	},
	defaultVariants: { size: '1' },
});

type HeaderStylesProps = VariantProps<typeof headerStyles>;

interface HeaderProps extends HeaderStylesProps {
	size?: HeaderStylesProps['size'];
	children: ReactNode;
	className?: string;
}

const H = forwardRef<HTMLHeadingElement, HeaderProps>(
	({ size, className, children, ...props }, ref) => {
		const styles = cn(headerStyles({ size }), className);

		const wrapBalancedChildren = <WrapBalancer>{children}</WrapBalancer>;

		switch (size) {
			case 'hero' || 'title' || '1' || null || undefined:
				return (
					<h1 ref={ref} className={styles} {...props}>
						{wrapBalancedChildren}
					</h1>
				);
			case '2':
				return (
					<h2 ref={ref} className={styles} {...props}>
						{wrapBalancedChildren}
					</h2>
				);

			case '3':
				return (
					<h3 ref={ref} className={styles} {...props}>
						{wrapBalancedChildren}
					</h3>
				);
			case '4':
				return (
					<h4 ref={ref} className={styles} {...props}>
						{wrapBalancedChildren}
					</h4>
				);
			case '5':
				return (
					<h5 ref={ref} className={styles} {...props}>
						{wrapBalancedChildren}
					</h5>
				);
			default:
				return (
					<h6 ref={ref} className={styles} {...props}>
						{wrapBalancedChildren}
					</h6>
				);
		}
	},
);

H.displayName = 'H';

const P = forwardRef<HTMLParagraphElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<p ref={ref} className={cn('mt-6 leading-7 ', className)} {...props}>
			{children}
		</p>
	),
);

P.displayName = 'P';

const BlockQuote = forwardRef<
	HTMLQuoteElement,
	{ children: ReactNode; className?: string }
>(({ className, children, ...props }, ref) => (
	<blockquote ref={ref} className={cn('border-l-2 pl-6 italic ', className)} {...props}>
		{children}
	</blockquote>
));

BlockQuote.displayName = 'BlockQuote';

const InlineCode = forwardRef<HTMLElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<code
			ref={ref}
			className={cn(
				'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-slate-900 ',
				className,
			)}
			{...props}
		>
			{children}
		</code>
	),
);

InlineCode.displayName = 'InlineCode';

const Lead = forwardRef<
	HTMLParagraphElement,
	{ children: ReactNode; className?: string }
>(({ className, children, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('text-md  text-muted-foreground md:text-lg lg:text-xl', className)}
		{...props}
	>
		{children}
	</p>
));

Lead.displayName = 'Lead';

export {
	H,
	P,
	BlockQuote,
	InlineCode,
	Lead,
	Text,
	// WrapBalancer,
	// WrapBalancerProvider,
};
