export function TailwindIndicator() {
	if (process.env.NODE_ENV === 'production') return null;

	return (
		// <div className=''>
		<div className='fixed bottom-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border-[1px] border-b bg-background bg-opacity-25 px-1 text-xs text-neutral-500'>
			<div className='block sm:hidden'>xs</div>
			<div className='hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden'>sm</div>
			<div className='hidden md:block lg:hidden xl:hidden 2xl:hidden'>md</div>
			<div className='hidden lg:block xl:hidden 2xl:hidden'>lg</div>
			<div className='hidden xl:block 2xl:hidden'>xl</div>
			<div className='hidden 2xl:block'>2xl</div>
		</div>
	);
}
