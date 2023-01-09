import '../styles/globals.css';

import React from 'react';

import { TrpcProvider } from '../client/trpcClient';

const RootLayout = ({ children, ...props }: { children: React.ReactNode }) => {
	return (
		<TrpcProvider>
			<html lang='en' className='h-full bg-gray-50'>
				<head />
				<body className='h-full'>
					<div className='flex flex-1 flex-col'>
						<main className='flex-1'>
							<div className='mx-auto max-w-7xl px-5'>
								<div>{children}</div>
							</div>
						</main>
					</div>
				</body>
			</html>
		</TrpcProvider>
	);
};
export default RootLayout;
