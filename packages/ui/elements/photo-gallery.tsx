import type { PhotoAlbumProps, RenderPhotoProps } from "react-photo-album";
import Image from "next/image";
import { useMediaQuery } from "@barely/lib/hooks/use-media-query";
import ReactPhotoAlbum from "react-photo-album";

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
  CarouselNextOverlay,
  CarouselPreviousOverlay,
} from "./carousel";

function NextJsImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
}: RenderPhotoProps) {
  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Image
        fill
        src={photo}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        {...{ alt, title, sizes, className, onClick }}
      />
    </div>
  );
}

type GalleryProps = Omit<PhotoAlbumProps, "layout"> & {
  layout?: "masonry" | "columns" | "rows";
  carousel?: boolean | "mobileOnly";
  carouselIndicator?: boolean;
};

export function PhotoGallery({
  photos,
  columns = (containerWidth) =>
    containerWidth < 450 ? 1 : containerWidth < 640 ? 2 : 3,
  layout = "masonry",
  carousel = "mobileOnly",
  carouselIndicator = true,
  ...props
}: GalleryProps) {
  const { isMobile } = useMediaQuery();

  // useEffect(() => console.log("isMobile", isMobile), [isMobile]);

  if (carousel === true || (carousel === "mobileOnly" && isMobile)) {
    return (
      <Carousel>
        <CarouselContent className="">
          {photos.map((photo, index) => (
            <CarouselItem key={index} className="">
              <div className="relative h-full w-full">
                {/* Background div wrapper */}
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden bg-neutral-800">
                  {/* Wrapper element with padding and negative margin */}

                  {/* Blurred background div */}
                  <div
                    className="min-h-[120%] min-w-[120%] "
                    style={{
                      backgroundImage: `url(${photo.src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(15px)",
                      opacity: 0.5,
                    }}
                  ></div>
                </div>
                {/* Content div */}
                <div className="relative z-10 flex h-full items-center justify-center">
                  <Image
                    src={photo.src}
                    alt={photo.alt ?? ""}
                    width={photo.width}
                    height={photo.height}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPreviousOverlay />
        <CarouselNextOverlay />
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
      renderPhoto={NextJsImage}
    />
  );
}
