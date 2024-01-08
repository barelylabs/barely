'use client';

import { cn } from '@barely/lib/utils/cn';
import { cva, VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { Icon, IconSelection } from './icon';

const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-full font-medium w-fit h-fit',
	{
		variants: {
			variant: {
				solid: 'bg-primary text-primary-foreground',
				secondary: 'bg-secondary text-secondary-foreground',
				muted: 'bg-muted text-muted-foreground',
				subtle:
					'bg-subtle text-subtle-foreground border-[0.5px] border-subtle-foreground/5',
				outline: 'border text-foreground',
				success: 'bg-green-100 text-green-800',
				info: 'bg-blue-100 text-blue-800',
				warning: 'bg-yellow-100 text-yellow-800',
				danger: 'bg-red-100 text-red-800',
			},
			size: {
				'2xs': 'px-2 py-0 text-2xs space-x-1',
				xs: 'px-2 py-0.5 text-xs space-x-1',
				sm: 'px-2.5 py-1 text-xs space-x-1',
				md: 'px-3 py-1 text-xs sm:text-sm space-x-1',
				lg: 'px-4 py-2 text-sm space-x-2',
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

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {
	asButton?: boolean;
	rectangle?: boolean;
	grow?: boolean;
	icon?: IconSelection;
	removeButton?: boolean;
	onRemove?: () => void;
}

const Badge = ({
	className,
	variant,
	size,
	asButton,
	rectangle,
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
				badgeVariants({ variant, size }),
				rectangle && 'rounded-sm',
				grow && 'w-full',
				asButton && 'hover:cursor-pointer active:scale-95',
				className,
			)}
			{...props}
		>
			{icon && (
				<BadgeIcon
					className={cn(
						'mr-1',
						size === 'sm' && 'h-[8px] w-[8px] sm:h-2 sm:w-2',
						(!size || size === 'md') && 'h-[10px] w-[10px] sm:h-3 sm:w-3',
					)}
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
