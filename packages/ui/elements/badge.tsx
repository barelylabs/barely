import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@barely/lib/utils/edge/cn';

import { Icon } from './icon';

const badgeVariants = cva(
	'flex flex-row items-center justify-center rounded-full font-medium w-fit h-fit',
	{
		variants: {
			variant: {
				solid: 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900',
				subtle: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
				outline:
					'border border-slate-900 text-slate-900 dark:border-slate-600 dark:text-slate-50',
				success: 'bg-green-100 text-green-800',
				info: 'bg-blue-100 text-blue-800',
				warning: 'bg-yellow-100 text-yellow-800',
				danger: 'bg-red-100 text-red-800',
			},
			size: {
				sm: 'px-2.5 py-0.5 text-xs space-x-1',
				md: 'px-3 py-0.5 text-sm space-x-1',
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
	removeButton?: boolean;
	onRemove?: () => void;
}

const Badge = ({
	className,
	variant,
	size,
	rectangle,
	grow,
	removeButton,
	onRemove,
	...props
}: BadgeProps) => {
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
