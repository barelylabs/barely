import { PhotoGallery } from "@barely/ui/elements/photo-gallery";

import { Section, SectionDiv } from "~/app/properyouth/section";

const pressPics = [
  {
    src: "https://res.cloudinary.com/dregnw0zb/image/upload/v1706835623/press/proper_youth_-_v_-_walking_1_kco6kk.jpg",
    width: 691,
    height: 1035,
  },
  {
    src: "https://res.cloudinary.com/dregnw0zb/image/upload/v1706835630/press/proper_youth_-_v_-_bar_1_jnixxj.jpg",
    width: 691,
    height: 1035,
  },
  {
    src: "https://res.cloudinary.com/dregnw0zb/image/upload/v1706835634/press/proper_youth_-_v_-_roof_3_oljzzm.jpg",
    width: 691,
    height: 1035,
  },
  {
    src: "https://res.cloudinary.com/dregnw0zb/image/upload/v1706843124/press/proper_youth_-_h_-_sky_silhouette_3_vz9z9g.jpg",
    width: 911,
    height: 608,
  },
  {
    src: "https://res.cloudinary.com/dregnw0zb/image/upload/v1706835634/press/proper_youth_-_v_-_wall_1_q2vare.jpg",
    width: 691,
    height: 1035,
  },
  {
    src: "https://res.cloudinary.com/dregnw0zb/image/upload/v1706835623/press/proper_youth_-_v_-_photo_booth_1_rpfnlq.jpg",
    width: 691,
    height: 1035,
  },
];

export function PressPhotos() {
  return (
    <Section id="photos">
      <SectionDiv title="Photos">
        <PhotoGallery photos={pressPics} carouselPrevNext="below" prioritize />
      </SectionDiv>
    </Section>
  );
}
