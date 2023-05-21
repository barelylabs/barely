import { forwardRef, ReactNode } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@barely/lib/utils/edge/cn';

const textStyles = cva([' leading-none align-text-bottom'], {
	variants: {
		size: {
			xs: 'text-xs',
			sm: 'text-sm leading-1',
			md: 'text-base',
			lg: 'text-lg',
			xl: 'text-xl',
			'2xl': 'text-2xl',
			'3xl': 'text-3xl',
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

interface TextProps extends Omit<TextStylesProps, 'size' | 'weight'> {
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

// special cases

const HHero = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h1
			ref={ref}
			className={cn(
				'scroll-m-20 text-5xl md:text-7xl lg:text-8xl lg:leading-[1.1] font-extrabold tracking-tight mb-4',
				className,
			)}
			{...props}
		>
			{children}
		</h1>
	),
);

const Title = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h1
			ref={ref}
			className={cn(
				'scroll-m-20 text-5xl lg:text-6xl font-bold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h1>
	),
);

const H1 = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h1
			ref={ref}
			className={cn(
				'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
				className,
			)}
			{...props}
		>
			{children}
		</h1>
	),
);

const H2 = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h2
			ref={ref}
			className={cn(
				'scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl',
				className,
			)}
			{...props}
		>
			{children}
		</h2>
	),
);

const H3 = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h3
			ref={ref}
			className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}
			{...props}
		>
			{children}
		</h3>
	),
);

const H4 = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h4
			ref={ref}
			className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}
			{...props}
		>
			{children}
		</h4>
	),
);

const H5 = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h5
			ref={ref}
			className={cn('scroll-m-20 text-lg font-medium tracking-tight', className)}
			{...props}
		>
			{children}
		</h5>
	),
);

const P = forwardRef<HTMLParagraphElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<p ref={ref} className={cn('mt-6 leading-7', className)} {...props}>
			{children}
		</p>
	),
);

const BlockQuote = forwardRef<
	HTMLQuoteElement,
	{ children: ReactNode; className?: string }
>(({ className, children, ...props }, ref) => (
	<blockquote ref={ref} className={cn('border-l-2 pl-6 italic ', className)} {...props}>
		{children}
	</blockquote>
));

const InlineCode = forwardRef<HTMLElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<code
			ref={ref}
			className={cn(
				'relative rounded py-[0.2rem] px-[0.3rem] bg-muted font-mono text-sm font-semibold text-slate-900 ',
				className,
			)}
			{...props}
		>
			{children}
		</code>
	),
);

const Lead = forwardRef<
	HTMLParagraphElement,
	{ children: ReactNode; className?: string }
>(({ className, children, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('text-md  md:text-lg lg:text-xl text-muted-foreground', className)}
		{...props}
	>
		{children}
	</p>
));

export { HHero, Title, H1, H2, H3, H4, H5, P, BlockQuote, InlineCode, Lead, Text };
