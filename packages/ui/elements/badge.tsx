'use client';

import type { VariantProps } from 'class-variance-authority';
import { cn } from '@barely/lib/utils/cn';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';

import type { IconKey } from './icon';
import { Icon } from './icon';

const badgeVariants = cva(
	'inline-flex h-fit w-fit items-center justify-center font-medium',
	{
		variants: {
			variant: {
				solid: 'bg-primary text-primary-foreground',
				secondary: 'bg-secondary text-secondary-foreground',
				muted: 'bg-muted text-muted-foreground',
				subtle:
					'border-[0.5px] border-subtle-foreground/5 bg-subtle text-subtle-foreground',
				outline: 'border text-foreground',
				success: 'bg-green-100 text-green-800',
				info: 'bg-blue-100 text-blue-800',
				warning: 'bg-yellow-100 text-yellow-800',
				danger: 'bg-red-100 text-red-800',
			},
			size: {
				'2xs': 'space-x-1 px-2 py-0 text-2xs',
				xs: 'space-x-1 px-2 py-0.5 text-xs',
				sm: 'space-x-1 px-2.5 py-1 text-xs',
				md: 'space-x-1 px-3 py-1 text-xs sm:text-sm',
				lg: 'space-x-2 px-4 py-2 text-sm',
			},
			shape: {
				pill: 'rounded-full',
				rectangle: 'rounded-sm',
			},
			button: {
				true: 'active:scale-95 ',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'solid',
			size: 'md',
		},
	},
);

const badgeIconVariants = cva('mr-1', {
	variants: {
		size: {
			'2xs': 'h-3 w-3',
			xs: 'h-3 w-3',
			sm: 'h-3 w-3',
			md: 'h-3 w-3',
			lg: 'h-4 w-4',
		},
	},
});

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {
	asButton?: boolean;
	// rectangle?: boolean;
	grow?: boolean;
	icon?: IconKey;
	removeButton?: boolean;
	onRemove?: () => void;
}

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const Badge = ({
	className,
	variant,
	size = 'md',
	asButton,
	// rectangle,
	shape = 'rectangle',
	grow,
	icon,
	removeButton,
	onRemove,
	...props
}: BadgeProps) => {
	const BadgeIcon = icon && Icon[icon] ? Icon[icon] : () => null;

	return (
		<span
			className={cn(
				badgeVariants({ variant, size, shape }),
				grow && 'w-full',
				asButton && 'active:scale-95 hover:cursor-pointer',
				className,
			)}
			{...props}
		>
			{icon && (
				<BadgeIcon
					// className={cn(
					//   "mr-1",
					//   size === "sm" && "h-[8px] w-[8px] sm:h-2 sm:w-2",
					//   (!size || size === "md") && "h-[10px] w-[10px] sm:h-3 sm:w-3",
					// )}
					className={badgeIconVariants({ size })}
				/>
			)}
			{props.children}
			{removeButton && (
				<button
					className='ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
					onKeyDown={e => {
						if (e.key === 'Enter') {
							onRemove;
						}
					}}
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onClick={onRemove}
				>
					<X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
				</button>
			)}
		</span>
	);
};

export { Badge };
