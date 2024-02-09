"use client";

import { useRef } from "react";
import { cn } from "@barely/lib/utils/cn";
import { ScrollArea } from "@barely/ui/elements/scroll-area";

// import type { KPI } from "~/app/properyouth/kpis";
import type { SocialStatProps } from "~/app/properyouth/social-stats";
// import { KPIs } from "~/app/properyouth/kpis";
import { MusicPlayerBottomBar } from "~/app/properyouth/player";
import { PressContact } from "~/app/properyouth/press-contact";
import { PressHero } from "~/app/properyouth/press-hero";
import { PressPhotos } from "~/app/properyouth/press-photos";
import { PressVideos } from "~/app/properyouth/press-videos";
import { Section, SectionDiv } from "~/app/properyouth/section";
import { SocialStats } from "~/app/properyouth/social-stats";
import { TopPlayerBar } from "~/app/properyouth/top-player-bar";

// const kpis: KPI[] = [
//   {
//     label: "Social followers",
//     value: 15000,
//   },
//   {
//     label: "Monthly listeners",
//     value: 5980,
//   },
//   {
//     label: "Video views",
//     value: 120000,
//   },
// ];

const socialStats: SocialStatProps[] = [
  {
    icon: "spotify",
    label: "Spotify Followers",
    value: 12242,
  },
  {
    icon: "spotify",
    label: "Monthly Listeners",
    value: 5750,
  },
  {
    icon: "instagram",
    label: "Instagram Followers",
    value: 9882,
  },
  {
    icon: "youtube",
    label: "YouTube Subscribers",
    value: 2440,
  },
];

const heroPics = {
  avatarPic:
    "https://res.cloudinary.com/dregnw0zb/image/upload/v1707151055/proper_youth_-_v_-_roof_3_-square_mzh7dw.jpg",
  headerPic:
    "https://res.cloudinary.com/dregnw0zb/image/upload/v1706835629/press/proper_youth_-_h_-_bar_2_bhzdev.jpg",
};

export default function PressPage() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const mainRef = useRef<HTMLDivElement>(null);

  // const [mainHeight, setMainHeight] = useState(0);
  // const test = useMediaQuery();

  // useEffect(() => {
  //   const updateHeight = () => {
  //     if (mainRef.current) {
  //       setMainHeight(mainRef.current.offsetHeight);
  //     }
  //   };

  //   updateHeight(); // Update height on mount

  //   window.addEventListener("resize", updateHeight); // Update height on window resize

  //   return () => window.removeEventListener("resize", updateHeight); // Cleanup
  // }, []);
  return (
    <>
      <main
        ref={mainRef}
        className={`mx-auto box-border w-full max-w-5xl flex-1 overflow-hidden`}
        style={{ height: "calc(100dvh - 72px)" }}
      >
        <ScrollArea
          className={cn(
            `relative mx-auto h-[500px] max-h-full w-full flex-1 sm:rounded-xl sm:p-4 sm:pb-0 lg:p-6 lg:pb-0`,
          )}
          style={{ height: "calc(100vh - 72px)" }}
          hideScrollbar
          viewportRef={scrollAreaRef}
        >
          <PressHero
            scrollAreaRef={scrollAreaRef}
            band="Proper Youth"
            {...heroPics}
          />

          {/* <p>viewport height: {test.height}</p>
          <p>main height: {mainHeight}</p> */}

          <TopPlayerBar scrollAreaRef={scrollAreaRef} />

          {/* <KPIs kpis={kpis} /> */}
          {/* <SocialStats stats={socialStats} /> */}

          <Section id="bio">
            <SectionDiv title="Bio">
              <p className="text-left text-sm sm:text-md">
                The second album by dream pop trio Proper Youth draws the bulk
                of its inspiration from all three members&apos; biggest shared
                passion: 80&apos;s music. It was a singular decade full of
                chorussed guitars, analog synths, saxophone, and plenty of
                reverb that welcomed listeners to escape into an aural arena
                replete with romanticism and earnesty. The new record modernizes
                this approach, incorporating themes about aging, loneliness, and
                narcissism into a dreamy soundscape that sounds best when played
                loud.
                <br />
                <br />
                Singers/songwriters Adam Barito and Amy Nesky and
                producer/drummer Bobb Barito went right back to work after
                releasing their debut album featuring the surprise hit,{" "}
                <i>Off My Mind</i>. Initially split between Ann Arbor and
                Brooklyn, they came together in Louisville for four months in
                2020 to care for an ailing family member. It was in an apartment
                there that they channeled the anguish of that historic year into
                the groundwork of production. The intimate collaboration
                galvanized Amy and Adam to finally move to Brooklyn, where they
                spent two more years finishing the songs with Bobb in a Bedstuy
                studio.
                <br />
                <br />
                <i>Rusty Grand Am</i> is named after a car Adam and Bobb&apos;s
                dad owned when they were growing up. It stuck around well after
                its expiration date, resilient against the unstoppable threat of
                decay. Revisiting the old piece of junk served as a vehicle for
                the thrilling and never ending road toward the heart of
                nostalgia--one which Proper Youth never plans on exiting.
              </p>
            </SectionDiv>
          </Section>

          <Section id="press-quotes">
            <SectionDiv title="Press Quotes">
              <div className="flex flex-col gap-6">
                <p className="text-left text-md">
                  Praise for their debut album <i>So Close to Paradise</i>:
                </p>
                <p className="text-left text-md leading-tight">
                  &quot;Appealing vocals over infectious guitar lines and
                  compelling rhythm, with loveable sax arrangements and anthemic
                  vibes.&quot; - Velvety
                </p>
                <p className="text-left text-md leading-tight">
                  &quot;Really nice vocal tones - there&apos;s something
                  intoxicating about their music.&quot; - B-sides and Badlands
                </p>
                <p className="text-left text-md leading-tight">
                  &quot;Heartfelt, rich and alluring... [their music] smolders
                  with emotion as it gently grooves through a world of lush
                  atmospheric tones.&quot; - Barry Gruff
                </p>
              </div>
            </SectionDiv>
          </Section>

          <SocialStats stats={socialStats} />

          <PressVideos />

          <PressPhotos />

          <PressContact />
        </ScrollArea>
      </main>
      <MusicPlayerBottomBar />
    </>
  );
}
