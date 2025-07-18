import type { PublicImage } from '@barely/validators';

import { PhotoGallery } from '@barely/ui/photo-gallery';

import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export function PressPhotos({ photos }: { photos: PublicImage[] }) {
	return (
		<Section id='photos'>
			<SectionDiv title='Photos'>
				{/* <pre>{JSON.stringify(photos, null, 2)}</pre> */}
				<PhotoGallery
					photos={photos.map(p => ({
						...p,
						src: p.s3Key,
					}))}
					carouselPrevNext='below'
					prioritize
				/>
			</SectionDiv>
		</Section>
	);
}
