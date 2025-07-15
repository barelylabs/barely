import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';

interface TrustBadgeProps {
	className?: string;
}

export function MoneyBackBadge({ className }: TrustBadgeProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm',
				className,
			)}
		>
			<Icon.shield className='h-4 w-4 text-green-500' />
			<span className='text-green-500 font-medium'>30-Day Money Back Guarantee</span>
		</div>
	);
}

export function OpenSourceBadge({ className }: TrustBadgeProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm',
				className,
			)}
		>
			<Icon.gitHub className='h-4 w-4 text-purple-500' />
			<span className='text-purple-500 font-medium'>Open Source & Transparent</span>
		</div>
	);
}

export function SecurityBadge({ className }: TrustBadgeProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm',
				className,
			)}
		>
			<Icon.lock className='h-4 w-4 text-blue-500' />
			<span className='text-blue-500 font-medium'>Secure & Encrypted</span>
		</div>
	);
}

export function PhDBadge({ className }: TrustBadgeProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-2 text-sm border border-purple-500/20',
				className,
			)}
		>
			<Icon.star className='h-4 w-4 text-purple-300' />
			<span className='text-purple-300 font-medium'>PhD in Optimization Science</span>
		</div>
	);
}