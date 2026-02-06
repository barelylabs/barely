import { redirect } from 'next/navigation';
import { getCurrentAppVariant, getDefaultProductForVariant } from '@barely/utils';

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	// Redirect to the default product route based on app variant
	try {
		const defaultProduct = getDefaultProductForVariant();
		if (defaultProduct) {
			redirect(`/${handle}${defaultProduct.defaultRoute}`);
		}
	} catch {
		// If there's an error getting the variant, fall through to default behavior
	}

	// Fallback to current behavior if no default product found
	// For appInvoice, redirect to /invoices as a hardcoded fallback
	try {
		const variant = getCurrentAppVariant();
		if (variant === 'appInvoice') {
			redirect(`/${handle}/invoices`);
		}
	} catch {
		// Ignore error and use default
	}

	// Default behavior - redirect to links page
	redirect(`/${handle}/links`);
}
