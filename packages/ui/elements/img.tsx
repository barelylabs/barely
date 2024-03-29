import type { ImageProps } from 'next/image';
import Image from 'next/image';

export function Img({ src, alt, width, height, ...props }: ImageProps) {
	if (!src) {
		return <div {...props} />;
	}
	return <Image src={src} alt={alt} width={width} height={height} {...props} />;
}
