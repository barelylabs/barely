import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@barely/lib/utils/edge/cn';

import { Icon, IconSelection } from './icon';

const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-full font-medium w-fit h-fit',
	{
		variants: {
			variant: {
				solid: 'bg-primary text-primary-foreground',
				secondary: 'bg-secondary text-secondary-foreground',
				subtle: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
				outline: 'border text-foreground',
				success: 'bg-green-100 text-green-800',
				info: 'bg-blue-100 text-blue-800',
				warning: 'bg-yellow-100 text-yellow-800',
				danger: 'bg-red-100 text-red-800',
			},
			size: {
				sm: 'px-2.5 py-0.5 text-xs space-x-1',
				md: 'px-3 py-0.5 text-xs sm:text-sm space-x-1',
				lg: 'px-4 py-2 text-sm space-x-2',
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
	rectangle,
	grow,
	icon,
	removeButton,
	onRemove,
	...props
}: BadgeProps) => {
	const BadgeIcon = icon && Icon[icon] ? Icon[icon] : () => null;

	return (
		<div
			className={cn(
				badgeVariants({ variant, size }),
				rectangle && 'rounded-md',
				grow && 'w-full',
				className,
			)}
			{...props}
		>
			{icon && (
				<BadgeIcon
					className={cn('mr-1', size === 'md' && 'h-[10px] w-[10px] sm:h-3 sm:w-3')}
				/>
			)}
			{props.children}
			{removeButton && (
				<button
					type='button'
					className='ml-1.5 inline-flex focus:outline-none'
					onClick={onRemove}
				>
					<Icon.x className='h-[13px] w-[13px]' />
				</button>
			)}
		</div>
	);
};

export { Badge };
