export function DashContent({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex flex-1 flex-col overflow-y-auto'>
			<div className='grid grid-cols-1 gap-4 p-3 md:gap-6 md:p-6 lg:py-8'>{children}</div>
		</div>
	);
}
