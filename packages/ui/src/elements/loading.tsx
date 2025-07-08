import type { VariantProps } from 'class-variance-authority';
import { cn } from '@barely/utils';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const loadingDotStyles = cva(
	['h-1 w-1 animate-bounce rounded-full bg-muted-foreground'],
	{
		variants: {
			size: {
				xs: 'h-0.5 w-0.5',
				sm: 'h-1 w-1',
				md: 'h-1.5 w-1.5',
				lg: 'h-2 w-2',
			},

			color: {
				primary: 'bg-foreground',
				secondary: 'bg-secondary-foreground',
				accent: 'bg-accent-foreground',
				muted: 'bg-muted-foreground',
			},
		},
		defaultVariants: { size: 'sm', color: 'muted' },
	},
);

type LoadingDotStylesProps = VariantProps<typeof loadingDotStyles>;

interface LoadingDotProps extends LoadingDotStylesProps {
	className?: string;
}

export function LoadingDots(props: LoadingDotProps) {
	const dotStyle = loadingDotStyles({ size: props.size, color: props.color });

	return (
		<div className={cn('flex space-x-1', props.className)}>
			<div className={dotStyle} />
			<div className={cn(dotStyle, 'delay-250')} />
			<div className={cn(dotStyle, 'delay-500')} />
		</div>
	);
}

const loadingSpinnerStyles = cva(['animate-spin'], {
	variants: {
		size: {
			xs: 'h-3 w-3',
			sm: 'h-4 w-4',
			md: 'h-5 w-5',
			lg: 'h-6 w-6',
		},

		color: {
			primary: 'text-foreground',
			secondary: 'text-secondary-foreground',
			accent: 'text-muted-foreground',
			muted: 'text-muted-foreground',
		},
	},
	defaultVariants: { size: 'sm', color: 'muted' },
});

type LoadingSpinnerStylesProps = VariantProps<typeof loadingSpinnerStyles>;

interface LoadingSpinnerProps extends LoadingSpinnerStylesProps {
	className?: string;
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
	const spinnerStyle = loadingSpinnerStyles({
		size: props.size,
		color: props.color,
	});

	return <Loader2 className={cn(spinnerStyle, props.className)} />;
}
