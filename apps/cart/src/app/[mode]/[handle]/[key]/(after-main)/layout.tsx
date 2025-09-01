import type { ReactNode } from 'react';

export default function AfterMainLayout({ children }: { children: ReactNode }) {
	return (
		<div className='mx-auto flex min-h-[100vh] w-full max-w-3xl flex-col items-center gap-10 p-4'>
			{children}
		</div>
	);
}
