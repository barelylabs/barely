import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import type { ImageLoaderProps, ImageProps } from 'next/image';
import Image from 'next/image';
import { env } from '@barely/lib/env';

type ImgProps = Omit<ImageProps, 'src'> &
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

const s3Loader = ({
	s3Key,
	width,
	quality,
}: Omit<ImageLoaderProps, 'src'> & { s3Key: string }) => {
	const url = new URL(`https://${env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN}/${s3Key}`);
	url.searchParams.set('format', 'auto');
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
				// fill
				src={s3Key}
				width={width}
				height={height}
				alt={alt}
				quality={quality}
				// priority
				// unoptimized
				priority={priority}
				{...props}
				loader={({ src, width, quality }) => s3Loader({ s3Key: src, width, quality })}
			/>
		);
	}

	if (!src || (typeof src === 'string' && src.length === 0)) {
		return <div {...props} />;
	}

	return (
		// <div className='relative h-full w-full'>
		<Image
			src={src}
			alt={alt}
			// loader={myLoader}
			width={width}
			height={height}
			{...props}
		/>
		// </div>
	);
}

// export function BarelyImg({ src, alt, width, height, ...props }: ImageProps) {
// 	if (!src) {
// 		return <div {...props} />;
// 	}

// 	return (
// 		<div className='relative h-full w-full'>

// 			<Image
// 				src={src}
// 				alt={alt}
// 				loader={myLoader}
// 				width={width}
// 				height={height}
// 				{...props}
// 			/>
// 		</div>
// 	);
// }
