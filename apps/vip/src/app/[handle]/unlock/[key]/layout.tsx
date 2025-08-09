import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { vipEnv } from '~/env';
import { trpcCaller } from '~/trpc/server';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ handle: string; key: string }>;
}): Promise<Metadata> {
	const { handle, key } = await params;

	const swap = await trpcCaller.swap.byHandleAndKey({ handle, key }).catch(() => {
		return notFound();
	});

	const coverImageUrl =
		swap.coverImage?.s3Key ?
			`https://${vipEnv.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${swap.coverImage.s3Key}`
		:	undefined;

	return {
		title: `${swap.name} - barely.vip`,
		description: swap.description ?? `Download ${swap.name}`,
		openGraph: {
			title: swap.name,
			description: swap.description ?? `Download ${swap.name}`,
			images: coverImageUrl ? [coverImageUrl] : undefined,
		},
	};
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
