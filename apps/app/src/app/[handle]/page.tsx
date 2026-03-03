import { redirect } from 'next/navigation';
import { getDefaultProductForVariant } from '@barely/utils';

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	// Redirect to the default product route based on app variant
	// Only wrap getDefaultProductForVariant() in try-catch, NOT redirect(),
	// because Next.js redirect() works by throwing a NEXT_REDIRECT error internally
	let defaultProduct: ReturnType<typeof getDefaultProductForVariant> | undefined;
	try {
		defaultProduct = getDefaultProductForVariant();
	} catch {
		// If there's an error getting the variant, default to links
		redirect(`/${handle}/links`);
	}

	if (defaultProduct) {
		redirect(`/${handle}${defaultProduct.defaultRoute}`);
	}

	// Fallback if no default product found
	redirect(`/${handle}/links`);
}
