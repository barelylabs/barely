import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { CartStatHeader } from '~/app/[handle]/carts/stats/cart-stat-header';
import { CartTimeseries } from '~/app/[handle]/carts/stats/cart-timeseries';

export default function CartStatsPage() {
	return (
		<>
			<DashContentHeader title='Cart Stats' />
			<CartStatHeader />
			<CartTimeseries />

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<StatLocations eventType='cart/viewCheckout' />
				<StatDevices eventType='cart/viewCheckout' />
				<StatExternalReferers eventType='cart/viewCheckout' />
				<StatBarelyReferers eventType='cart/viewCheckout' />
			</div>
		</>
	);
}
