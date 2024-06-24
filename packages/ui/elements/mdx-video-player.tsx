import { VideoPlayer } from './video-player';

export const mdxVideoPlayer = {
	VideoPlayer: ({ url }: { url: string }) => (
		<div className='mx-auto inline-block h-fit w-full md:max-w-4xl '>
			<VideoPlayer className='w-full' url={url} />
		</div>
	),
};
