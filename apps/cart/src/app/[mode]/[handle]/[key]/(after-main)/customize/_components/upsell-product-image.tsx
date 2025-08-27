'use client';

import { Img } from '@barely/ui/src/elements/img';

import { usePublicFunnel } from '~/app/[mode]/[handle]/[key]/_components/use-public-funnel';

export function UpsellProductImage({ handle, key }: { handle: string; key: string }) {
	const { publicFunnel } = usePublicFunnel({
		handle,
		key,
	});

	const s3Key = publicFunnel.upsellProduct?._images[0]?.file.s3Key;

	if (!s3Key) return null;

	return (
		<Img
			s3Key={s3Key}
			blurDataURL={publicFunnel.upsellProduct?._images[0]?.file.blurDataUrl ?? ''}
			alt={publicFunnel.upsellProduct?.name ?? ''}
			width={600}
			height={600}
			className='mx-auto h-auto w-full max-w-[300px] rounded-lg sm:max-h-[400px]'
		/>
	);
}
