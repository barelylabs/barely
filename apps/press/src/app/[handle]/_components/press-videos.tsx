import type { PublicPressKit } from '@barely/validators';

import { VideoCarousel } from '@barely/ui/video-player';

import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export function PressVideos({
	videos,
}: {
	videos: NonNullable<PublicPressKit['videos']>;
}) {
	return (
		<Section id='videos'>
			<SectionDiv title='Music Videos'>
				<VideoCarousel videos={videos} />
			</SectionDiv>
		</Section>
	);
}
