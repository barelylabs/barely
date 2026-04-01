import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { Logo } from '@barely/ui/logo';

export function DashboardShellSkeleton() {
	return (
		<div className='flex h-screen w-screen bg-accent'>
			{/* Product Sidebar Skeleton */}
			<aside className='fixed left-0 top-0 z-30 flex h-screen w-16 flex-col items-center bg-accent'>
				<Logo className='mb-3 mt-5 h-7 w-7' />

				{/* Workspace avatar placeholder */}
				<div className='flex items-center justify-center p-3'>
					<div className='h-10 w-10 animate-pulse rounded-lg bg-muted' />
				</div>

				{/* Product icon placeholders */}
				<div className='flex-1 overflow-y-auto'>
					<div className='space-y-1 p-3'>
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className='flex h-11 w-11 items-center justify-center rounded-lg'
							>
								<div className='h-5 w-5 animate-pulse rounded bg-muted' />
							</div>
						))}
					</div>
					<div className='mx-3'>
						<div className='h-px bg-border' />
					</div>
					<div className='space-y-1 p-3'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className='flex h-11 w-11 items-center justify-center rounded-lg'
							>
								<div className='h-5 w-5 animate-pulse rounded bg-muted' />
							</div>
						))}
					</div>
				</div>

				{/* User avatar placeholder */}
				<div className='p-3'>
					<div className='flex h-11 w-11 items-center justify-center rounded-lg'>
						<div className='h-8 w-8 animate-pulse rounded-full bg-muted' />
					</div>
				</div>
			</aside>

			{/* Context Sidebar Background */}
			<div className='fixed left-[60px] top-0 hidden h-screen w-60 bg-accent md:block' />

			{/* Context Sidebar Skeleton */}
			<aside className='fixed left-[64px] top-2 z-40 hidden h-[calc(100vh-1rem)] w-56 md:block'>
				<div className='flex h-full flex-col overflow-hidden rounded-xl border border-subtle-foreground/50 bg-card/50 shadow-md'>
					{/* Product name placeholder */}
					<div className='border-b p-4'>
						<div className='h-5 w-24 animate-pulse rounded bg-muted' />
						<div className='mt-1.5 h-3 w-36 animate-pulse rounded bg-muted' />
					</div>

					{/* Navigation placeholders */}
					<div className='flex-1 overflow-y-auto py-3'>
						<div className='flex flex-col gap-1 px-3'>
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className='h-8 w-full animate-pulse rounded-md bg-muted' />
							))}
						</div>
					</div>
				</div>
			</aside>

			{/* Main Content Area */}
			<div className='flex min-h-screen w-full flex-col bg-accent md:ml-[300px] md:w-[calc(100vw-300px)]'>
				<div className='flex h-screen flex-col bg-accent md:p-0 md:pt-2'>
					<div className='flex flex-1 flex-col overflow-x-hidden rounded-tl-xl md:rounded-tl-2xl md:border-l md:border-t md:border-subtle-foreground/70 md:bg-background'>
						{/* Content header skeleton */}
						<div className='flex flex-row items-center justify-between border-b border-subtle-foreground/70 bg-accent p-3 md:border-0 md:bg-transparent md:p-6 md:pb-0 lg:pt-8'>
							<div className='h-8 w-48 animate-pulse rounded bg-muted' />
							<div className='h-9 w-24 animate-pulse rounded bg-muted' />
						</div>
						{/* Grid list skeleton */}
						<div className='flex h-full flex-col bg-background md:min-h-0'>
							<div className='grid h-fit grid-cols-1 gap-4 bg-background p-3 md:gap-6 md:p-6'>
								<GridListSkeleton />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
