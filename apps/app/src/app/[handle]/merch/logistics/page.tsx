import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import {
	CartShippingAddress,
	CartSupportEmail,
} from '~/app/[handle]/merch/carts/_components/cart-settings';

export default function MerchLogisticsPage() {
	return (
		<>
			<DashContentHeader
				title='Merch Logistics'
				subtitle='Manage your fulfillment and support details.'
			/>
			<DashContent>
				<CartSupportEmail />
				<CartShippingAddress />
			</DashContent>
		</>
	);
}
