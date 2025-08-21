import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BillingSummary } from '~/app/[handle]/settings/billing/billing-summary';

export default function BillingSettingsPage() {
	return (
		<>
			<DashContentHeader title='Billing' subtitle='Update your billing.' />
			<DashContent>
				<BillingSummary />
			</DashContent>
		</>
	);
}
