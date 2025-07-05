import { Icon } from '@barely/ui/icon';

export function CartSteps() {
	return (
		<div className='flex w-full flex-row items-center justify-between'>
			<div className='flex flex-row items-center justify-center gap-2 opacity-80'>
				<Icon.creditCard className='h-4 w-4 text-brand sm:h-8 sm:w-8' />
				<span className='font-heading text-lg text-brand sm:text-2xl'>Payment</span>
			</div>

			<Icon.chevronRight className='h-4 w-4 text-brand sm:h-8 sm:w-8' />

			<div className='flex flex-row items-center justify-center gap-2'>
				<Icon.edit className='h-5 w-5 text-brand sm:h-9 sm:w-9' />
				<span className='font-heading text-xl text-brand sm:text-3xl'>Customize</span>
			</div>

			<Icon.chevronRight className='h-4 w-4 sm:h-8 sm:w-8' />

			<div className='flex w-fit min-w-fit flex-row items-center justify-center gap-2'>
				<Icon.checkCircle className='h-4 w-4 sm:h-7 sm:w-7' />
				<span className='font-heading text-lg sm:text-2xl'>Complete</span>
			</div>
		</div>
	);
}
