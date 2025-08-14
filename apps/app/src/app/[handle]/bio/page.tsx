import { redirect } from 'next/navigation';

export default async function BioPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const awaitedParams = await params;
	// Redirect to the new edit layout with home page
	redirect(`/${awaitedParams.handle}/bio/home`);
}
