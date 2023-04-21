import { ReactNode } from 'react';

import { cn } from '@barely/lib/utils/edge/cn';

interface Props {
	title?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
}

const Container = ({ children, className }: Props) => {
	return (
		<>
			<div
				className={cn(
					'container flex w-full flex-col min-h-full items-start justify-center p-6',
					className,
				)}
			>
				{children}
			</div>

			{/* <div className='mx-auto w-full bg-white p-6 shadow-lg dark:bg-gray-800 sm:my-8 sm:max-w-lg sm:rounded-xl'>
				{(title || action) && (
					<div className='mb-4 flex items-center justify-between'>
						{title && (
							<h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
								{title}
							</h1>
						)}
						{action}
					</div>
				)}
				{children}
			</div> */}
		</>
	);
};

export { Container };
