import './styles/globals.css';
// import { Inter } from '@next/font/google';
// const inter = Inter({ subsets: ['latin'] }); // fixme: this is not working
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' className='h-full scroll-smooth bg-gray-50'>
			<head>
				<link rel='stylesheet' href='https://rsms.me/inter/inter.css'></link>
			</head>

			<head />
			<body className='h-full'>
				<main>
					<div className='m-auto w-full justify-center'>
						<div className='mx-auto items-center'>{children}</div>
					</div>
					{/* <div className='m-auto w-full max-w-4xl justify-center py-6'>
						<div className='mx-auto items-center px-4 sm:px-6 md:px-8'>{children}</div>
					</div> */}
				</main>
			</body>
		</html>
	);
}
