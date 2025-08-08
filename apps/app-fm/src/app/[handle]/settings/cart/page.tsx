import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import {
	CartShippingAddress,
	CartSupportEmail,
} from '~/app/[handle]/settings/cart/cart-settings';

export default function CartSettingsPage() {
	return (
		<>
			<DashContentHeader title='Cart' subtitle='Manage your cart settings.' />
			<CartSupportEmail />
			<CartShippingAddress />
		</>
	);
}
