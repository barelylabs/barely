import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { cva } from 'class-variance-authority';

import { Icon } from './icon';
import { Text } from './typography';

const alertVariants = cva('relative w-full rounded-lg border', {
	variants: {
		variant: {
			info: 'bg-background text-foreground',
			success: 'bg-success-50 text-success dark:bg-success dark:text-success',
			warning: 'bg-warning-50 text-warning dark:bg-warning dark:text-warning',
			destructive:
				'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
		},
		size: {
			sm: 'p-2',
			md: 'p-3',
			lg: 'p-4',
		},
		defaultVariants: {
			size: 'md',
			variant: 'info',
		},
	},
});

interface AlertProps extends VariantProps<typeof alertVariants> {
	title?: string;
	description?: string;
	actionLabel?: string;
	actionHref?: string;
}

export function Alert(props: AlertProps) {
	return (
		<div className={alertVariants({ variant: props.variant, size: props.size ?? 'sm' })}>
			<div className='flex flex-row'>
				<div className='ml-1 flex-shrink-0'>
					{props.variant === 'success' ?
						<Icon.checkCircleFilled className='h-5 w-5' />
					: props.variant === 'info' ?
						<Icon.info className='h-5 w-5' />
					: props.variant === 'warning' ?
						<Icon.warning className=' h-[16px] w-[16px]' />
					:	<Icon.xCircleFilled className='h-5 w-5' />}
				</div>

				<div className='ml-[10px] mt-[2px] flex flex-col gap-1'>
					<p className='text-md font-semibold leading-none tracking-tight text-green-800'>
						{props.title}
					</p>

					<p className='text-sm text-green-800'>{props.description}</p>

					{props.actionLabel && props.actionHref && (
						<Link href={props.actionHref}>
							<Text variant='xs/normal' muted className='hover:underline'>
								{props.actionLabel}
							</Text>
						</Link>
					)}
				</div>
				<div className='ml-auto pl-3'>
					<div className='-mx-1.5 -my-1.5'>
						{/* <button
							type='button'
							className='inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50'
						>
							<span className='sr-only'>Dismiss</span>
						</button> */}
					</div>
				</div>
			</div>
		</div>
	);
}
