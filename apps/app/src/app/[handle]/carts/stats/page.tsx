import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { CartTimeseries } from '~/app/[handle]/carts/stats/cart-timeseries';

export default function CartStatsPage() {
	return (
		<>
			<DashContentHeader title='Cart Stats' />
			<Suspense fallback={'loading'}>
				<CartTimeseries />
			</Suspense>
		</>
	);
}
