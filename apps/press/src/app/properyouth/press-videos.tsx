import { VideoCarousel } from "@barely/ui/elements/video-player";

import { Section, SectionDiv } from "~/app/properyouth/section";

export function PressVideos() {
  return (
    <Section id="videos">
      <SectionDiv title="Music Videos">
        <VideoCarousel
          urls={[
            "https://youtu.be/BLzqKpDsN2o",
            "https://youtu.be/y9xU7KBhN5g",
            "https://youtu.be/Y16t11ZZ4bw",
            "https://youtu.be/Vj-wWAHJ180",
          ]}
        />
      </SectionDiv>
    </Section>
  );
}
