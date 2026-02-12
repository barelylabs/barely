import { redirect } from 'next/navigation';
import { getDefaultProductForVariant } from '@barely/utils';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	// Redirect to the default product route based on app variant
	const defaultProduct = getDefaultProductForVariant();
	if (defaultProduct) {
		redirect(`/${handle}${defaultProduct.defaultRoute}`);
	}

	// Fallback to current behavior if no default product found
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
