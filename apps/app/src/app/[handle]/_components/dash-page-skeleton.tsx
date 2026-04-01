import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

export function DashPageSkeleton() {
	return (
		<>
			<div className='flex flex-row items-center justify-between border-b border-subtle-foreground/70 bg-accent p-3 md:border-0 md:bg-transparent md:p-6 md:pb-0 lg:pt-8'>
				<div className='h-8 w-48 animate-pulse rounded bg-muted' />
				<div className='h-9 w-24 animate-pulse rounded bg-muted' />
			</div>
			<div className='flex h-full flex-col bg-background md:min-h-0'>
				<div className='grid h-fit grid-cols-1 gap-4 bg-background p-3 md:gap-6 md:p-6'>
					<GridListSkeleton />
				</div>
			</div>
		</>
	);
}
