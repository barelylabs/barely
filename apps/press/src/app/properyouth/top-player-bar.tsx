import { useEffect, useRef, useState } from "react";
import { cn } from "@barely/lib/utils/cn";
import { MusicPlayButton } from "@barely/ui/elements/music-player";
import { H } from "@barely/ui/elements/typography";

import { Section, SectionDiv } from "~/app/properyouth/section";

export function TopPlayerBar(props: {
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}) {
  const playerBarRef = useRef<HTMLDivElement>(null);

  const [stuckClassName, setStuckClassName] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (playerBarRef.current && props.scrollAreaRef.current) {
        const playerBarTop = playerBarRef.current.getBoundingClientRect().top;
        // console.log("playerBarTop", playerBarTop);
        const scrollAreaTop =
          props.scrollAreaRef.current.getBoundingClientRect().top;

        const isAtTop = playerBarTop - scrollAreaTop <= 0;

        if (isAtTop) {
          setStuckClassName("shadow-lg shadow-slate-800/50");
        } else {
          setStuckClassName("");
        }
      }
    };

    const scrollArea = props.scrollAreaRef.current;
    if (scrollArea) {
      //   console.log(scrollArea);
      scrollArea.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("scroll", handleScroll);
      }
    };
  }, [props.scrollAreaRef]);

  return (
    <Section
      ref={playerBarRef}
      id="player-bar"
      className={cn("top-0 z-50 py-6 sm:sticky", stuckClassName)}
    >
      <SectionDiv>
        <div className="flex flex-row items-center">
          <MusicPlayButton size="large" />
          <div className="ml-4 flex flex-col justify-center">
            <H size="3" className="-mt-2 text-gray-300">
              Listen to Proper Youth
            </H>
          </div>
        </div>
      </SectionDiv>
    </Section>
  );
}
