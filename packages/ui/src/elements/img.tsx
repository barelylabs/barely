'use client';

import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { getS3ImageUrl } from '@barely/files/utils';

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

export function Img({
	alt,
	width,
	height,
	quality,
	src,
	s3Key,
	priority,
	sizes,
	...props
}: ImgProps & { sizes?: string }) {
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
				sizes={sizes}
				loader={({ src, width, quality }) =>
					getS3ImageUrl({ s3Key: src, width, quality })
				}
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
