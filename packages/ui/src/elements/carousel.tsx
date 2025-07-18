'use client';

import type { UseEmblaCarouselType } from 'embla-carousel-react';
import * as React from 'react';
import { cn } from '@barely/utils';
import useEmblaCarousel from 'embla-carousel-react';

import type { ButtonProps } from './button';
import { Button } from './button';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: 'horizontal' | 'vertical';
	setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	currentIndex: number;
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error('useCarousel must be used within a <Carousel />');
	}

	return context;
}

const Carousel = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
	(
		{ orientation = 'horizontal', opts, setApi, plugins, className, children, ...props },
		ref,
	) => {
		const [carouselRef, api] = useEmblaCarousel(
			{
				...opts,
				align: opts?.align ?? 'center',
				axis: orientation === 'horizontal' ? 'x' : 'y',
			},
			plugins,
		);
		const [canScrollPrev, setCanScrollPrev] = React.useState(false);
		const [canScrollNext, setCanScrollNext] = React.useState(false);
		const [currentIndex, setCurrentIndex] = React.useState(0);

		const onSelect = React.useCallback((api: CarouselApi) => {
			if (!api) {
				return;
			}

			setCurrentIndex(api.selectedScrollSnap());
			setCanScrollPrev(api.canScrollPrev());
			setCanScrollNext(api.canScrollNext());
		}, []);

		const scrollPrev = React.useCallback(() => {
			api?.scrollPrev();
		}, [api]);

		const scrollNext = React.useCallback(() => {
			api?.scrollNext();
		}, [api]);

		const handleKeyDown = React.useCallback(
			(event: React.KeyboardEvent<HTMLDivElement>) => {
				if (event.key === 'ArrowLeft') {
					event.preventDefault();
					scrollPrev();
				} else if (event.key === 'ArrowRight') {
					event.preventDefault();
					scrollNext();
				}
			},
			[scrollPrev, scrollNext],
		);

		React.useEffect(() => {
			if (!api || !setApi) {
				return;
			}

			setApi(api);
		}, [api, setApi]);

		React.useEffect(() => {
			if (!api) {
				return;
			}

			onSelect(api);
			api.on('reInit', onSelect);
			api.on('select', onSelect);

			return () => {
				api.off('select', onSelect);
			};
		}, [api, onSelect]);

		return (
			<CarouselContext.Provider
				value={{
					carouselRef,
					api,
					opts,
					orientation,
					currentIndex,
					scrollPrev,
					scrollNext,
					canScrollPrev,
					canScrollNext,
				}}
			>
				<div
					ref={ref}
					onKeyDownCapture={handleKeyDown}
					className={cn('relative', className)}
					role='region'
					aria-roledescription='carousel'
					{...props}
				>
					{children}
				</div>
			</CarouselContext.Provider>
		);
	},
);
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div ref={carouselRef} className=''>
			<div
				ref={ref}
				className={cn(
					'flex',
					orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
					className,
				)}
				{...props}
			/>
		</div>
	);
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { orientation } = useCarousel();
	return (
		<div
			ref={ref}
			role='group'
			aria-roledescription='slide'
			className={cn(
				'min-w-0 shrink-0 grow-0 basis-full',
				orientation === 'horizontal' ? 'pl-4' : 'pt-4',
				className,
			)}
			{...props}
		/>
	);
});
CarouselItem.displayName = 'CarouselItem';

// PREVIOUS / NEXT
const CarouselPrevious = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ look = 'link', size = 'md', ...props }, ref) => {
	const { scrollPrev, canScrollPrev } = useCarousel();
	return (
		<Button
			ref={ref}
			size={size}
			look={look}
			variant='icon'
			pill
			startIcon='chevronLeft'
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			{...props}
		>
			<span className='sr-only'>Previous slide</span>
		</Button>
	);
});
CarouselPrevious.displayName = 'CarouselPreviousLeft';

const CarouselNext = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ look = 'link', size = 'md', ...props }, ref) => {
	const { scrollNext, canScrollNext } = useCarousel();

	return (
		<Button
			ref={ref}
			size={size}
			look={look}
			variant='icon'
			pill
			startIcon='chevronRight'
			disabled={!canScrollNext}
			onClick={scrollNext}
			{...props}
		>
			<span className='sr-only'>Next slide</span>
		</Button>
	);
});
CarouselNext.displayName = 'CarouselNext';

const CarouselPrevious_LeftTop = ({
	className,
	look: variant = 'outline',
	...props
}: ButtonProps) => {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();

	return (
		<CarouselPrevious
			{...props}
			look={variant}
			className={cn(
				'absolute',
				orientation === 'horizontal' ?
					'-left-12 top-1/2 -translate-y-1/2'
				:	'-top-12 left-1/2 -translate-x-1/2 rotate-90',
				className,
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
		/>
	);
};

const CarouselNext_RightBottom = ({
	className,
	look: color = 'outline',
	...props
}: ButtonProps) => {
	const { orientation, scrollNext, canScrollNext } = useCarousel();

	return (
		<CarouselNext
			{...props}
			look={color}
			className={cn(
				'absolute',
				orientation === 'horizontal' ?
					'-right-12 top-1/2 -translate-y-1/2'
				:	'-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
				className,
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
		/>
	);
};

// prev/next overlay
const CarouselPreviousOverlay = ({
	className,

	...props
}: ButtonProps) => {
	const { orientation } = useCarousel();

	return (
		<CarouselPrevious
			{...props}
			className={cn(
				'absolute',
				orientation === 'horizontal' ?
					'left-1 top-1/2 -translate-y-1/2'
				:	'left-1/2 top-1 -translate-x-1/2 rotate-90',
				className,
			)}
		/>
	);
};

const CarouselNextOverlay = ({
	className,

	...props
}: ButtonProps) => {
	const { orientation } = useCarousel();

	return (
		<CarouselNext
			{...props}
			className={cn(
				'absolute',
				orientation === 'horizontal' ?
					'right-1 top-1/2 -translate-y-1/2'
				:	'bottom-1 left-1/2 -translate-x-1/2 rotate-90',
				className,
			)}
		/>
	);
};

const CarouselPreviousNext = () => {
	return (
		<div className='flex w-full flex-row items-center justify-end pr-3 pt-3'>
			<CarouselPrevious />
			<CarouselNext />
		</div>
	);
};

const CarouselIndicator = () => {
	const { api, currentIndex } = useCarousel();

	return (
		<div className='absolute flex h-8 w-full flex-row gap-2 py-2'>
			{api
				?.scrollSnapList()
				.map((_, i) => (
					<button
						key={i}
						onClick={() => api.scrollTo(i)}
						className={cn(
							'h-1 w-full cursor-pointer rounded-sm bg-muted sm:h-[6px]',
							currentIndex === i && 'bg-slate-400',
						)}
					/>
				))}
		</div>
	);
};

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	// prev/next
	CarouselPrevious,
	CarouselNext,
	CarouselPrevious_LeftTop,
	CarouselNext_RightBottom,
	CarouselPreviousOverlay,
	CarouselNextOverlay,
	CarouselPreviousNext,
	// indicator
	CarouselIndicator,
};
