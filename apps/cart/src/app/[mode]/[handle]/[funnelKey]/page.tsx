import { redirect } from 'next/navigation';

export default function Page({
	params,
}: {
	params: {
		mode: 'preview' | 'live';
		handle: string;
		funnelKey: string;
	};
}) {
	redirect(`/${params.handle}/${params.funnelKey}/checkout`);
}
