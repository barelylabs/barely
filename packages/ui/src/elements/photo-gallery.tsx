'use client';

import type { Image } from '@barely/validators';
import type { PhotoAlbumProps, RenderPhotoProps } from 'react-photo-album';
import { useMediaQuery } from '@barely/hooks';
import ReactPhotoAlbum from 'react-photo-album';

import { BackgroundImg } from './background-image';
import {
	Carousel,
	CarouselContent,
	CarouselIndicator,
	CarouselItem,
	CarouselNextOverlay,
	CarouselPreviousNext,
	CarouselPreviousOverlay,
} from './carousel';
import { Img } from './img';

export { ReactPhotoAlbum as PhotoAlbum };

function NextJsImage({
	photo,
	imageProps: { alt, title, sizes, className, onClick },
	wrapperStyle,
	priority = false,
}: RenderPhotoProps<Image> & {
	priority?: boolean;
}) {
	return (
		<div style={{ ...wrapperStyle, position: 'relative' }}>
			{photo.s3Key ?
				<Img
					fill
					s3Key={photo.s3Key}
					placeholder={'blurDataURL' in photo ? 'blur' : undefined}
					{...{ alt, title, sizes, className, onClick, priority }}
				/>
			:	<Img
					fill
					src={photo.src}
					placeholder={'blurDataURL' in photo ? 'blur' : undefined}
					{...{ alt, title, sizes, className, onClick, priority }}
				/>
			}
		</div>
	);
}

function NextJsImageWithPriority(props: RenderPhotoProps<Image>) {
	return <NextJsImage {...props} priority />;
}

export type GalleryProps = Omit<PhotoAlbumProps, 'layout' | 'photos'> & {
	layout?: 'masonry' | 'columns' | 'rows';
	carousel?: boolean | 'mobileOnly';
	carouselIndicator?: boolean;
	carouselPrevNext?: 'overlay' | 'leftRight' | 'below';
	prioritize?: boolean;
	photos: Image[];
};

export function PhotoGallery({
	photos,
	columns = containerWidth =>
		containerWidth < 450 ? 1
		: containerWidth < 640 ? 2
		: 3,
	layout = 'masonry',
	carousel = 'mobileOnly',
	carouselIndicator,
	carouselPrevNext,
	prioritize = false,
	...props
}: GalleryProps) {
	const { isMobile } = useMediaQuery();

	if (carousel === true || (carousel === 'mobileOnly' && isMobile)) {
		return (
			<Carousel opts={{ containScroll: false }}>
				<CarouselContent className='-ml-11'>
					{photos.length &&
						photos.map((photo, index) => (
							<CarouselItem key={index} className='basis-3/4'>
								<div className='relative h-full w-full'>
									{/* Blurred background */}
									{/* s3Key: {photo.s3Key} */}
									<div className='absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden'>
										<BackgroundImg
											// src={photo.src}
											s3Key={photo.s3Key}
											alt={''}
											className='scale-125 overflow-hidden opacity-70 blur-lg'
											sizes='(max-width: 450px) 100vw, (max-width: 640px) 50vw, 33vw'
										/>
									</div>
									{/* Content */}
									<div className='relative z-10 flex h-full items-center justify-center'>
										{/* <pre>{JSON.stringify(photo, null, 2)}</pre> */}
										<Img
											// src={photo.src}
											s3Key={photo.s3Key}
											alt={''}
											width={photo.width}
											height={photo.height}
											priority={index < 2}
											sizes='(max-width: 450px) 100vw, (max-width: 640px) 50vw, 33vw'

											// className='h-20 w-20 object-cover'
										/>
									</div>
								</div>
							</CarouselItem>
						))}
				</CarouselContent>
				{carouselPrevNext === 'overlay' ?
					<>
						<CarouselPreviousOverlay />
						<CarouselNextOverlay />
					</>
				: carouselPrevNext === 'below' ?
					<CarouselPreviousNext />
				:	null}
				{carouselIndicator && <CarouselIndicator />}
			</Carousel>
		);
	}

	return (
		// @ts-expect-error - TODO: type inference not working here
		<ReactPhotoAlbum<Image>
			{...props}
			layout={layout}
			columns={columns}
			photos={photos}
			renderPhoto={prioritize ? NextJsImageWithPriority : NextJsImage}
		/>
	);
}
