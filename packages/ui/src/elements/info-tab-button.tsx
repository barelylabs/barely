import { cn } from '@barely/utils';

// import { calcPercent } from '@barely/lib/utils/number';

import { Icon } from './icon';
import { H, Text } from './typography';

export function InfoTabButton(p: {
	onClick?: () => void;
	selected?: boolean;
	selectedClassName?: string;
	icon: keyof typeof Icon;
	label: string;
	value: number | string;
	isLeft?: boolean;
	isRight?: boolean;
	iconBackgroundClassName?: string;
	iconClassName?: string;
	subValue?: number | string;
}) {
	const StatIcon = Icon[p.icon];

	return (
		<button
			type='button'
			className={cn(
				'flex flex-col gap-1 py-3 pl-3 pr-8',
				p.selected && 'border-b-3',
				p.selected && p.selectedClassName,
				p.isLeft && 'rounded-tl-md',
				p.isRight && 'rounded-tr-md',
			)}
			onClick={p.onClick}
		>
			<div className='flex flex-row items-center gap-1'>
				<div
					className={cn(
						'm-auto mb-0.5 rounded-sm bg-slate-500 p-[3px]',
						p.iconBackgroundClassName,
					)}
				>
					<StatIcon className='h-3.5 w-3.5 text-white' />
				</div>
				<Text variant='sm/medium' className='uppercase'>
					{p.label.toUpperCase()}
				</Text>
			</div>
			<div className='flex flex-row items-baseline gap-1'>
				<H size='4'>{p.value}</H>
				{p.subValue !== undefined && (
					<Text
						variant='sm/medium'
						className='uppercase tracking-[-.05em] text-muted-foreground'
					>
						({p.subValue})
					</Text>
				)}
			</div>
		</button>
	);
}
