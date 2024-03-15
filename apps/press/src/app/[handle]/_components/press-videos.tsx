import { VideoCarousel } from "@barely/ui/elements/video-player";

import type { PublicPressKit } from "@barely/lib/server/press-kit.schema";

import { Section, SectionDiv } from "~/app/[handle]/_components/press-section";

export function PressVideos({
  videos,
}: {
  videos: NonNullable<PublicPressKit["videos"]>;
}) {
  return (
    <Section id="videos">
      <SectionDiv title="Music Videos">
        <VideoCarousel videos={videos} />
      </SectionDiv>
    </Section>
  );
}
