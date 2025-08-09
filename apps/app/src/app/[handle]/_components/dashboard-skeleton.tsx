import { Skeleton } from '@barely/ui/elements/skeleton';

export function DashboardSkeleton() {
	return (
		<div className='mx-auto flex w-full flex-1 flex-row'>
			{/* Sidebar skeleton */}
			<div className='hidden w-64 bg-accent p-4 md:block'>
				<div className='space-y-4'>
					<Skeleton className='h-8 w-full' />
					<div className='space-y-2'>
						{[...Array(6)].map((_, i) => (
							<Skeleton key={i} className='h-10 w-full' />
						))}
					</div>
				</div>
			</div>

			{/* Main content area */}
			<div className='flex h-[100vh] w-full flex-col bg-accent md:pt-2'>
				<div className='flex h-full w-full border-l border-t border-subtle-foreground/70 bg-background md:rounded-tl-2xl'>
					<div className='flex h-full w-full flex-col overflow-clip'>
						<div className='grid h-fit grid-cols-1 gap-6 overflow-y-scroll p-6 lg:py-8'>
							{/* Content skeleton */}
							<div className='space-y-4'>
								<Skeleton className='h-8 w-48' />
								<Skeleton className='h-4 w-64' />
								<div className='mt-8 space-y-4'>
									{[...Array(3)].map((_, i) => (
										<div key={i} className='space-y-2'>
											<Skeleton className='h-32 w-full' />
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
