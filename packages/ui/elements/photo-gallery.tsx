"use client";

import type { PhotoAlbumProps, RenderPhotoProps } from "react-photo-album";
import { useMediaQuery } from "@barely/lib/hooks/use-media-query";
import ReactPhotoAlbum from "react-photo-album";

import type { Image } from "@barely/lib/server/file.schema";

import BackgroundImage from "./background-image";
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
  CarouselNextOverlay,
  CarouselPreviousNext,
  CarouselPreviousOverlay,
} from "./carousel";
import { Img } from "./img";

export { ReactPhotoAlbum as PhotoAlbum };

function NextJsImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
  priority = false,
}: RenderPhotoProps & { priority?: boolean }) {
  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Img
        fill
        src={photo}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        {...{ alt, title, sizes, className, onClick, priority }}
      />
    </div>
  );
}

function NextJsImageWithPriority(props: RenderPhotoProps) {
  return <NextJsImage {...props} priority />;
}

export type GalleryProps = Omit<PhotoAlbumProps, "layout"> & {
  layout?: "masonry" | "columns" | "rows";
  carousel?: boolean | "mobileOnly";
  carouselIndicator?: boolean;
  carouselPrevNext?: "overlay" | "leftRight" | "below";
  prioritize?: boolean;
  photos: Image[];
};

export function PhotoGallery({
  photos,
  columns = (containerWidth) =>
    containerWidth < 450 ? 1 : containerWidth < 640 ? 2 : 3,
  layout = "masonry",
  carousel = "mobileOnly",
  carouselIndicator,
  carouselPrevNext,
  prioritize = false,
  ...props
}: GalleryProps) {
  const { isMobile } = useMediaQuery();

  if (carousel === true || (carousel === "mobileOnly" && isMobile)) {
    return (
      <Carousel opts={{ containScroll: false }}>
        <CarouselContent className="-ml-11">
          {photos.map((photo, index) => (
            <CarouselItem key={index} className="basis-3/4">
              <div className="relative h-full w-full">
                {/* Blurred background */}
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden">
                  <BackgroundImage
                    src={photo.src}
                    alt={photo.alt ?? ""}
                    className="scale-125 opacity-50 blur-lg"
                  />
                </div>
                {/* Content */}
                <div className="relative z-10 flex h-full items-center justify-center">
                  <Img
                    src={photo.src}
                    alt={photo.alt ?? ""}
                    width={photo.width}
                    height={photo.height}
                    priority={index < 2}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {carouselPrevNext === "overlay" ? (
          <>
            <CarouselPreviousOverlay />
            <CarouselNextOverlay />
          </>
        ) : carouselPrevNext === "below" ? (
          <CarouselPreviousNext />
        ) : null}

        {carouselIndicator && <CarouselIndicator />}
      </Carousel>
    );
  }

  return (
    <ReactPhotoAlbum
      {...props}
      layout={layout}
      columns={columns}
      photos={photos}
      renderPhoto={prioritize ? NextJsImageWithPriority : NextJsImage}
    />
  );
}
