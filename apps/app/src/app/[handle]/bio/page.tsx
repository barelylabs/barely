import { redirect } from 'next/navigation';

export default async function BioPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const awaitedParams = await params;
	// Redirect to the blocks page (new blocks-based approach)
	redirect(`/${awaitedParams.handle}/bio/home/blocks`);
}
