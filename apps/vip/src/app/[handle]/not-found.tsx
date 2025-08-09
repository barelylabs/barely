import Link from 'next/link';

import { Button } from '@barely/ui/button';

export default function NotFound() {
	return (
		<main className='flex min-h-screen flex-col items-center justify-center p-4'>
			<div className='text-center'>
				<h1 className='mb-4 text-6xl font-bold text-gray-900 dark:text-white'>404</h1>
				<h2 className='mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300'>
					Swap Not Found
				</h2>
				<p className='mb-8 text-gray-600 dark:text-gray-400'>
					This download link doesn't exist or has expired.
				</p>
				<Link href='/'>
					<Button>Go Home</Button>
				</Link>
			</div>
		</main>
	);
}
