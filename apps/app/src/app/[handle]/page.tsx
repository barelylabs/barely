import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function DashboardPage() {
	return (
		<>
			<DashContentHeader title='Overview' />
			<DashContent>
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col gap-2'>
						<p> 🛠️</p>
					</div>
				</div>
			</DashContent>
		</>
	);
}
