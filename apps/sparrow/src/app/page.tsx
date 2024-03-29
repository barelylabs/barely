import Link from 'next/link';

import { H } from '@barely/ui/elements/typography';

export default function Component() {
	return (
		<section className='relative h-screen w-full bg-cover bg-center'>
			<div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-60' />
			<div className='relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white'>
				<div className='flex flex-col items-center'>
					<picture>
						<img
							alt='Logo'
							className='mb-4 h-24 w-24 rounded-full bg-purple-500'
							src='/_static/barely_sparrow_logo_2-tone.svg'
						/>
					</picture>

					<H size='hero'>Barely Sparrow</H>
				</div>
				<p className='mt-6 text-lg md:max-w-2xl md:text-xl'>
					An independent record label and digital marketing agency based in Brooklyn, NY.
				</p>
				<Link
					className='mt-8 inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-sm font-medium text-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
					href='mailto:adam@barelysparrow.com'
				>
					Contact us
				</Link>
			</div>
		</section>
	);
}
