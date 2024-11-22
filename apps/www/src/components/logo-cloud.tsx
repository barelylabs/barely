import Image from 'next/image';
import { clsx } from 'clsx';

export function LogoCloud({ className }: React.ComponentPropsWithoutRef<'div'>) {
	return (
		<div
			className={clsx(
				className,
				'flex justify-between max-sm:mx-auto max-sm:max-w-md max-sm:flex-wrap max-sm:justify-evenly max-sm:gap-x-4 max-sm:gap-y-4',
			)}
		>
			<Image
				alt='Barely Sparrow'
				src='/logo-cloud/barely-sparrow.svg'
				className='h-9 max-sm:mx-auto sm:h-8 lg:h-12'
				width={80}
				height={80}
			/>
			<Image
				alt='Gourmet Music'
				src='/logo-cloud/gourmet.svg'
				className='h-9 max-sm:mx-auto sm:h-8 lg:h-12'
				width={80}
				height={80}
			/>
			<Image
				alt='Tuple'
				src='/logo-cloud/tuple.svg'
				className='h-9 max-sm:mx-auto sm:h-8 lg:h-12'
				width={80}
				height={80}
			/>
			{/* <img
				alt='Transistor'
				src='/logo-cloud/transistor.svg'
				className='h-9 max-sm:mx-auto sm:h-8 lg:h-12'
			/>
			<img
				alt='Statamic'
				src='/logo-cloud/statamic.svg'
				className='h-9 max-sm:mx-auto sm:h-8 lg:h-12'
			/> */}
		</div>
	);
}
