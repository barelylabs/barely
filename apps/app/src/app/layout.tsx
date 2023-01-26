import './globals.css';

import React from 'react';

import { TrpcProvider } from '../client/trpcClient';
import { ClerkProvider } from '@clerk/nextjs/app-beta';

const RootLayout = ({ children, ...props }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider>
			<TrpcProvider>
				<html lang='en' className='h-screen bg-gray-50'>
					<head />
					<body className='h-screen'>
						<main>
							<div className='h-screen w-full py-6'>
								<div className='mx-auto h-full w-full px-4 sm:px-6 md:px-8'>
									{children}
								</div>
							</div>
						</main>
					</body>
				</html>
			</TrpcProvider>
		</ClerkProvider>
	);
};
export default RootLayout;
