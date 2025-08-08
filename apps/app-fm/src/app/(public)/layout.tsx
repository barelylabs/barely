import { PublicHeader } from '~/app/(public)/public-header';

export default function PublicDashLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{/* <div className=' w-full mx-auto max-w-7xl items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[240px_minmax(0,1fr)]'> */}
			<PublicHeader />
			<div className='mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 py-6 lg:py-10'>
				{children}
			</div>
			{/* </div> */}
		</>
	);
}
