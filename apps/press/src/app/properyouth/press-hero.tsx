import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@barely/ui/elements/icon";

import { SectionDiv } from "~/app/properyouth/section";

interface PressHeroProps {
  band: string;
  headerPic: string;
  avatarPic: string;
  scrollAreaRef: RefObject<HTMLDivElement>;
}

export function PressHero(props: PressHeroProps) {
  const pressHeroRef = useRef<HTMLDivElement>(null);

  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [headerZoom, setHeaderZoom] = useState(1.1);

  useEffect(() => {
    const handleScroll = () => {
      if (pressHeroRef.current && props.scrollAreaRef.current) {
        const opacity =
          1 + pressHeroRef.current.getBoundingClientRect().top / 450;

        const zoom =
          1.1 + pressHeroRef.current.getBoundingClientRect().top / 7500;

        // console.log("zoom", zoom);

        setHeaderOpacity(opacity);
        setHeaderZoom(zoom);
      }
    };

    const scrollArea = props.scrollAreaRef.current;
    if (scrollArea) scrollArea.addEventListener("scroll", handleScroll);

    return () => {
      if (scrollArea) scrollArea.removeEventListener("scroll", handleScroll);
    };
  }, [props.scrollAreaRef]);

  const heroText = (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-50"></div>
      <SectionDiv className="relative h-full justify-end">
        <div className="flex flex-row items-end justify-between gap-2">
          <div className="flex flex-col items-end space-y-4">
            <div>
              <div className="flex flex-row items-center gap-3">
                <Icon.press className="h-4 w-4 text-white" />
                <p className="text-white">Press Kit</p>
              </div>
              <p className="-mb-[2px] font-heading text-5xl sm:-mb-[6px] sm:text-7xl md:text-[85px] lg:text-[90px]">
                {props.band}
              </p>
            </div>
          </div>

          <div className="flex flex-row items-end gap-2">
            <Link href="https://instagram.com/proper.youth" target="_blank">
              <Icon.instagram className="h-6 w-6 text-white hover:text-pink-500" />
            </Link>
            <Link href="https://youtube.com/properyouth" target="_blank">
              <Icon.youtube className="h-6 w-6 text-white hover:text-youtube-500" />
            </Link>
            <Link href="https://tiktok.com/proper.youth" target="_blank">
              <Icon.tiktok className="h-6 w-6 text-white hover:text-tiktok-500" />
            </Link>
            <Link
              href="https://open.spotify.com/artist/3h1e8MBcZjWu1AcBDXOCzp"
              target="_blank"
            >
              <Icon.spotify className="h-6 w-6 text-white hover:text-spotify-500" />
            </Link>
          </div>
        </div>
      </SectionDiv>
    </>
  );

  const heroMobile = (
    <section
      className="relative h-[350px] w-full py-6 sm:hidden sm:h-[400px] md:h-[450px] md:py-10"
      id="intro-mobile"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 33%), url(${props.avatarPic})`,

          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: headerOpacity,
          transform: `scale(${headerZoom})`,
          zIndex: -1,
        }}
      ></div>
      {heroText}
    </section>
  );

  const heroDesktop = (
    <section
      id="intro-desktop"
      className="relative hidden h-[350px] w-full py-6 sm:block sm:h-[400px] md:h-[450px] md:py-10"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 33%), url(${props.headerPic})`,

          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: headerOpacity,
          transform: `scale(${headerZoom})`,
          zIndex: -1,
        }}
      ></div>
      {heroText}
    </section>
  );

  return (
    <div ref={pressHeroRef}>
      {heroMobile}
      {heroDesktop}
    </div>
  );
}
