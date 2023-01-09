import './globals.css';
import { Inter } from '@next/font/google';
const inter = Inter({ subsets: ['latin'] }); // fixme: this is not working
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html>
			{/* <html className={inter.variable}> */}
			<head>
				<link rel='stylesheet' href='https://rsms.me/inter/inter.css'></link>
			</head>
			<body className='h-full'>{children}</body>
		</html>
	);
}
