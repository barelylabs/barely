// import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
// import type { ImageProps } from 'next/image';
'use client';

import type { CSSProperties } from 'react';
import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';

import type { ImgProps } from './img';
import { Img } from './img';

type BackGroundImageProps = ImgProps & {
	divStyle?: CSSProperties;
};

export const BackgroundImg = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & BackGroundImageProps
>(({ children, divStyle, sizes, priority, quality, src, s3Key, ...props }, ref) => {
	if (!s3Key && typeof src !== 'string') return null;

	return (
		<div
			ref={ref}
			className={cn('absolute bottom-0 left-0 right-0 top-0 z-[-1]', props.className)}
			style={divStyle}
		>
			{s3Key ?
				<Img
					s3Key={s3Key}
					className='absolute inset-0 h-full w-full object-cover object-center'
					fill
					priority={priority}
					quality={quality}
					sizes={sizes}
					{...props}
				/>
			:	<Img
					src={src ?? ''}
					className='absolute inset-0 h-full w-full object-cover object-center'
					fill
					priority={priority}
					quality={quality}
					sizes={sizes}
					{...props}
				/>
			}
			{children}
		</div>
	);
});

BackgroundImg.displayName = 'BackgroundImage';

// export default BackgroundImg;
