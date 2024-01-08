import { cn } from '@barely/lib/utils/cn';
import { cva, VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const loadingDotStyles = cva(
	['w-1 h-1 bg-muted-foreground rounded-full animate-bounce '],
	{
		variants: {
			size: {
				xs: 'w-0.5 h-0.5',
				sm: 'w-1 h-1',
				md: 'w-1.5 h-1.5',
				lg: 'w-2 h-2',
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
			xs: 'w-3 h-3',
			sm: 'w-4 h-4',
			md: 'w-5 h-5',
			lg: 'w-6 h-6',
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
	const spinnerStyle = loadingSpinnerStyles({ size: props.size, color: props.color });

	return <Loader2 className={cn(spinnerStyle, props.className)} />;
}
