import { VideoPlayer } from './video-player';

export const mdxVideoPlayer = {
	VideoPlayer: ({ url }: { url: string }) => (
		<div className='mx-auto h-fit w-full md:max-w-3xl'>
			<VideoPlayer className='w-full' url={url} />
		</div>
	),
};
