import type { MdxImageSize } from '@barely/const';
import { MDX_IMAGE_SIZE_TO_WIDTH } from '@barely/const';
import { cn } from '@barely/utils';

import { Img } from './img';

export function mdxImageFile() {
	const ImageFile = ({
		s3Key,
		alt,
		width,
		height,
		size = 'md',
	}: {
		s3Key: string;
		alt: string;
		width: number;
		height: number;
		size: MdxImageSize;
	}) => {
		const adjustedWidth = MDX_IMAGE_SIZE_TO_WIDTH[size];
		const aspectRatio = width / height;
		const adjustedHeight = Math.round(adjustedWidth / aspectRatio);

		return (
			<Img
				s3Key={s3Key}
				alt={alt}
				width={adjustedWidth}
				height={adjustedHeight}
				className={cn(
					'rounded-md',
					size === 'xs' && 'max-w-[min(100%,200px)]',
					size === 'sm' && 'max-w-[min(100%,18rem)]', // 18rem = 288px (max-w-xs)
					size === 'md' && 'max-w-[min(100%,24rem)]', // 24rem = 384px (max-w-sm)
					size === 'lg' && 'max-w-[min(100%,28rem)]', // 28rem = 448px (max-w-md)
					size === 'xl' && 'max-w-[min(100%,32rem)]', // 32rem = 512px (max-w-lg)
				)}
			/>
		);
	};

	return {
		ImageFile,
	};
}
