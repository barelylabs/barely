import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
	return (
		<div className='mt-6 overflow-hidden bg-white shadow-md sm:rounded-lg'>
			<div className='px-4 py-5 sm:px-6'>{children}</div>
		</div>
	);
}
