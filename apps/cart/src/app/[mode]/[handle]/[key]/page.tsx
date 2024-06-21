import { redirect } from 'next/navigation';

export default function Page({
	params,
}: {
	params: {
		mode: 'preview' | 'live';
		handle: string;
		key: string;
	};
}) {
	redirect(`/${params.handle}/${params.key}/checkout`);
}
