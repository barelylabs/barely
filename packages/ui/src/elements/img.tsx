'use client';

import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import type { ImageLoaderProps, ImageProps } from 'next/image';
import Image from 'next/image';
import { libEnv } from '@barely/lib/env';

export type ImgProps = Omit<ImageProps, 'src'> &
	(
		| {
				s3Key?: never;
				src: string | StaticImport;
		  }
		| {
				s3Key: string;
				src?: never;
		  }
	);

export const s3Loader = ({
	s3Key,
	width,
	quality,
}: Omit<ImageLoaderProps, 'src'> & { s3Key: string }) => {
	const url = new URL(`${libEnv.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN}/${s3Key}`);
	url.searchParams.set('format', 'webp');
	url.searchParams.set('width', width ? width.toString() : 'auto');
	url.searchParams.set('quality', quality ? quality.toString() : '75');
	return url.toString();
};

export function Img({
	alt,
	width,
	height,
	quality,
	src,
	s3Key,
	priority,
	...props
}: ImgProps) {
	if (s3Key) {
		return (
			<Image
				{...props}
				src={s3Key}
				width={width}
				height={height}
				alt={alt}
				quality={quality}
				priority={priority}
				loader={({ src, width, quality }) => s3Loader({ s3Key: src, width, quality })}
				placeholder={(props.placeholder ?? props.blurDataURL) ? 'blur' : undefined}
			/>
		);
	}

	if (!src || (typeof src === 'string' && src.length === 0)) {
		return <div {...props} />;
	}

	return (
		<Image src={src} alt={alt} unoptimized width={width} height={height} {...props} />
	);
}
