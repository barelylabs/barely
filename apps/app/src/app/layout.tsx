import './globals.css';

import React from 'react';

import { TrpcProvider } from '../client/trpcClient';

const RootLayout = ({ children, ...props }: { children: React.ReactNode }) => {
	return (
		<TrpcProvider>
			<html lang='en' className='h-screen bg-gray-50'>
				<head />
				<body className='h-screen'>
					<main>
						<div className='h-screen w-full py-6'>
							<div className='mx-auto h-full px-4 sm:px-6 md:px-8'>
								{/* <input className='w-full rounded-lg px-5 py-2' /> */}
								{children}
							</div>
						</div>
					</main>
				</body>
			</html>
		</TrpcProvider>
	);
};
export default RootLayout;
