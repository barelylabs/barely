import { forwardRef, ReactNode } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@barely/lib/utils/edge/cn';

const textStyles = cva(
	['text-slate-900 dark:text-slate-50 leading-none align-text-bottom'],
	{
		variants: {
			size: {
				xs: 'text-xs',
				sm: 'text-sm leading-1',
				md: 'text-base',
				lg: 'text-lg',
			},
			weight: {
				light: 'font-light',
				normal: 'font-normal',
				medium: 'font-medium',
				semibold: 'font-semibold',
				bold: 'font-bold',
			},

			// paragraph: { true: 'text-slate-500 dark:text-slate-400' },
			subtle: { true: 'text-slate-600 dark:text-slate-400' },

			underline: { true: 'underline' },
		},
		defaultVariants: { size: 'md', weight: 'normal' },
	},
);

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
	<blockquote
		ref={ref}
		className={cn(
			'mt-6 border-l-2 border-slate-300 pl-6 italic text-slate-800 dark:border-slate-600 dark:text-slate-200',
			className,
		)}
		{...props}
	>
		{children}
	</blockquote>
));

const InlineCode = forwardRef<HTMLElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<code
			ref={ref}
			className={cn(
				'relative rounded bg-slate-100 py-[0.2rem] px-[0.3rem] font-mono text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-400',
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
		className={cn('mt-6 text-xl text-slate-700 dark:text-slate-400', className)}
		{...props}
	>
		{children}
	</p>
));

export { H1, H2, H3, H4, H5, P, BlockQuote, InlineCode, Lead, Text };
