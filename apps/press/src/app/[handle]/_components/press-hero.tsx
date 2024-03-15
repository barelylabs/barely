"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BackgroundImage } from "@barely/ui/elements/background-image";
import { BottomThirdFadeGradient } from "@barely/ui/elements/gradient";
import { Icon } from "@barely/ui/elements/icon";

import type { PublicPressKit } from "@barely/lib/server/press-kit.schema";

import { PressScrollAreaViewportContext } from "~/app/[handle]/_components/press-scroll-area";
// import { ScrollAreaViewportContext } from "@barely/ui/elements/scroll-area";

import { SectionDiv } from "~/app/[handle]/_components/press-section";

export function PressHero({
  workspace,
  showInstagramLink,
  showYoutubeLink,
  showTiktokLink,
  showSpotifyLink,
  showSocialLinks,
}: PublicPressKit) {
  const scrollAreaRef = useContext(PressScrollAreaViewportContext);

  const pressHeroRef = useRef<HTMLDivElement>(null);

  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [headerZoom, setHeaderZoom] = useState(1.1);

  useEffect(() => {
    const handleScroll = () => {
      if (pressHeroRef.current && scrollAreaRef?.current) {
        const opacity =
          1 + pressHeroRef.current.getBoundingClientRect().top / 450;

        const zoom =
          1.1 + pressHeroRef.current.getBoundingClientRect().top / 7500;

        setHeaderOpacity(opacity);
        setHeaderZoom(zoom);
      }
    };

    const scrollArea = scrollAreaRef?.current;
    if (scrollArea) scrollArea.addEventListener("scroll", handleScroll);

    return () => {
      if (scrollArea) scrollArea.removeEventListener("scroll", handleScroll);
    };
  }, [scrollAreaRef]);

  const igLink =
    showInstagramLink && workspace.instagramUsername
      ? `https://instagram.com/${workspace.instagramUsername}`
      : null;
  const ytLink =
    showYoutubeLink && workspace.youtubeChannelId
      ? `https://youtube.com/channel/${workspace.youtubeChannelId}`
      : null;
  const tiktokLink =
    showTiktokLink && workspace.tiktokUsername
      ? `https://tiktok.com/@${workspace.tiktokUsername}`
      : null;
  const spotifyLink =
    showSpotifyLink && workspace.spotifyArtistId
      ? `https://open.spotify.com/artist/${workspace.spotifyArtistId}`
      : null;

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
                {workspace.name}
              </p>
            </div>
          </div>

          <div className="flex flex-row items-end gap-2">
            {showSocialLinks && (
              <>
                {igLink && (
                  <Link
                    href="https://instagram.com/proper.youth"
                    target="_blank"
                  >
                    <Icon.instagram className="h-6 w-6 text-white hover:text-pink-500" />
                  </Link>
                )}
                {ytLink && (
                  <Link href="https://youtube.com/properyouth" target="_blank">
                    <Icon.youtube className="h-6 w-6 text-white hover:text-youtube-500" />
                  </Link>
                )}
                {tiktokLink && (
                  <Link href="https://tiktok.com/proper.youth" target="_blank">
                    <Icon.tiktok className="h-6 w-6 text-white hover:text-tiktok-500" />
                  </Link>
                )}
                {spotifyLink && (
                  <Link
                    href="https://open.spotify.com/artist/3h1e8MBcZjWu1AcBDXOCzp"
                    target="_blank"
                  >
                    <Icon.spotify className="h-6 w-6 text-white hover:text-spotify-500" />
                  </Link>
                )}
              </>
            )}
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
      <BackgroundImage
        src={workspace.avatarImageUrl ?? workspace.headerImageUrl ?? ""}
        alt=""
        divStyle={{
          opacity: headerOpacity,
          transform: `scale(${headerZoom})`,
        }}
      >
        <BottomThirdFadeGradient />
      </BackgroundImage>
      {heroText}
    </section>
  );

  const heroDesktop = (
    <section
      id="intro-desktop"
      className="relative hidden h-[350px] w-full py-6 sm:block sm:h-[400px] md:h-[450px] md:py-10"
    >
      <BackgroundImage
        src={workspace.headerImageUrl ?? workspace.avatarImageUrl ?? ""}
        alt=""
        divStyle={{
          opacity: headerOpacity,
          transform: `scale(${headerZoom})`,
        }}
      >
        <BottomThirdFadeGradient />
      </BackgroundImage>
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
