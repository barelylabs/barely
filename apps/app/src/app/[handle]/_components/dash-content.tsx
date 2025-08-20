export function DashContent({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex h-fit flex-1 flex-col bg-background md:min-h-0'>
			<div className='grid h-full grid-cols-1 gap-4 bg-background p-3 md:gap-6 md:p-6'>
				{children}
			</div>
		</div>
	);
}
