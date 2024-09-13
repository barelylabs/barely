import { redirect } from 'next/navigation';

export default function Page({
	params,
	searchParams,
}: {
	params: {
		mode: 'preview' | 'live';
		handle: string;
		key: string;
	};
	searchParams: Record<string, string>;
}) {
	const queryString = new URLSearchParams(searchParams).toString();
	redirect(`/${params.handle}/${params.key}/checkout?${queryString}`);
}
