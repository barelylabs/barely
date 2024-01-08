import { forwardRef, ReactNode } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { cva, VariantProps } from 'class-variance-authority';

const textStyles = cva(['leading-none align-text-bottom '], {
	variants: {
		size: {
			xs: 'text-2xs sm:text-xs',
			sm: 'text-xs sm:text-sm leading-1',
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

const headerStyles = cva(['font-heading scroll-m-20 '], {
	variants: {
		size: {
			hero: 'text-6xl md:text-7xl lg:text-8xl',
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

export const H = forwardRef<HTMLHeadingElement, HeaderProps>(
	({ size, className, children, ...props }, ref) => {
		const styles = cn(headerStyles({ size }), className);

		switch (size) {
			case 'hero' || 'title' || '1' || null || undefined:
				return (
					<h1 ref={ref} className={styles} {...props}>
						{children}
					</h1>
				);
			case '2':
				return (
					<h2 ref={ref} className={styles} {...props}>
						{children}
					</h2>
				);

			case '3':
				return (
					<h3 ref={ref} className={styles} {...props}>
						{children}
					</h3>
				);
			case '4':
				return (
					<h4 ref={ref} className={styles} {...props}>
						{children}
					</h4>
				);
			case '5':
				return (
					<h5 ref={ref} className={styles} {...props}>
						{children}
					</h5>
				);
			default:
				return (
					<h6 ref={ref} className={styles} {...props}>
						{children}
					</h6>
				);
		}
	},
);

const HHero = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<h1
			ref={ref}
			className={cn(
				'mb-4 scroll-m-20 font-heading text-6xl md:text-7xl lg:text-8xl lg:leading-[1.1]',
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
			className={cn('scroll-m-20 font-heading text-5xl lg:text-6xl', className)}
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
			className={cn('scroll-m-20 font-heading text-4xl lg:text-5xl', className)}
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
				'scroll-m-20 font-heading text-3xl font-bold lg:text-4xl ',
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
			className={cn(
				'scroll-m-20 font-heading text-2xl tracking-[.025em] lg:text-3xl',
				className,
			)}
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
			className={cn('scroll-m-20 font-heading text-xl ', className)}
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
			className={cn('scroll-m-20 font-heading text-lg ', className)}
			{...props}
		>
			{children}
		</h5>
	),
);

// export const H = {
// 	hero: HHero,
// 	title: Title,
// 	'1': H1,
// 	'2': H2,
// 	'3': H3,
// 	'4': H4,
// 	'5': H5,
// };

const P = forwardRef<HTMLParagraphElement, { children: ReactNode; className?: string }>(
	({ className, children, ...props }, ref) => (
		<p ref={ref} className={cn('mt-6 leading-7 ', className)} {...props}>
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
				'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-slate-900 ',
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
		className={cn('text-md  text-muted-foreground md:text-lg lg:text-xl', className)}
		{...props}
	>
		{children}
	</p>
));

export { HHero, Title, H1, H2, H3, H4, H5, P, BlockQuote, InlineCode, Lead, Text };
