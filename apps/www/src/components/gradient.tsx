import { cn } from '@barely/utils';
import { clsx } from 'clsx';

export function Gradient({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
	return (
		<div
			{...props}
			className={cn(
				'bg-gray-500',
				// 'bg-opacity-20 bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#EA0B80] from-[28%] via-[#b060ff] via-[70%] to-[#2B8FCE] sm:bg-[linear-gradient(145deg,var(--tw-gradient-stops))]',
				className,
			)}
		/>
	);
}

export function GradientBackground() {
	return (
		<div className='relative mx-auto max-w-7xl'>
			<div
				className={clsx(
					'absolute -right-60 -top-44 h-60 w-[36rem] transform-gpu md:right-0',
					'bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#2B8FCE] from-[28%] via-[#ee87cb] via-[70%] to-[#b060ff]',
					'rotate-[-10deg] rounded-full blur-3xl',
				)}
			/>
		</div>
	);
}
