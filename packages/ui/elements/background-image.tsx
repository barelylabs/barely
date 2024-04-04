import type { ImageProps } from 'next/image';
import type { CSSProperties } from 'react';
import * as React from 'react';
import Image from 'next/image';
import { cn } from '@barely/lib/utils/cn';

interface BackGroundImageProps extends ImageProps {
	divStyle?: CSSProperties;
}

export const BackgroundImage = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & BackGroundImageProps
>(({ children, style, sizes, src, ...props }, ref) => {
	return (
		<div
			ref={ref}
			className={cn('absolute bottom-0 left-0 right-0 top-0 z-[-1]', props.className)}
			style={style}
		>
			<Image
				src={src}
				alt=''
				className='absolute inset-0 h-full w-full object-cover object-center'
				fill
				priority
				sizes={sizes}
			/>
			{children}
		</div>
	);
});

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
