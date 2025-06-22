import { redirect } from 'next/navigation';

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{
		mode: 'preview' | 'live';
		handle: string;
		key: string;
	}>;
	searchParams: Promise<Record<string, string>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const queryString = new URLSearchParams(awaitedSearchParams).toString();
	redirect(`/${awaitedParams.handle}/${awaitedParams.key}/checkout?${queryString}`);
}
