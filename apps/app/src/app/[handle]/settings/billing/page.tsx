import { DashContentHeader } from "~/app/[handle]/_components/dash-content-header";
import { BillingSummary } from "~/app/[handle]/settings/billing/billing-summary";
import { UpgradeModal } from "~/app/[handle]/settings/billing/upgrade-modal";

export default function BillingSettingsPage() {
  return (
    <>
      <DashContentHeader title="Billing" subtitle="Update your billing." />
      <BillingSummary />
      <UpgradeModal />
    </>
  );
}
