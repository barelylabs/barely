import { cn } from '@barely/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('animate-pulse rounded-md bg-muted text-opacity-0', className)}
			{...props}
		/>
	);
}

export { Skeleton };
