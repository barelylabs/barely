import { Icons } from '@barely/ui';

const SupportedApps = () => {
	return (
		<div
			id='supported apps'
			className='items-left -mt-7 flex w-fit flex-col space-y-4 self-center rounded-xl bg-white px-5 py-3 shadow-lg sm:items-center'
		>
			<div className='flex w-full max-w-sm grow flex-row flex-wrap justify-center gap-y-4 space-x-3 sm:justify-between '>
				<Icons.tiktok className='text-4xl text-tiktok' />
				<Icons.youtube className='text-4xl text-youtube' />
				<Icons.spotify className='text-4xl text-spotify' />
				<Icons.twitter className='text-4xl text-twitter' />
				<Icons.facebook className='text-4xl text-facebook' />
				<Icons.twitch className='text-4xl text-twitch' />
				<Icons.instagram className='text-4xl text-instagram' />
			</div>
		</div>
	);
};

export default SupportedApps;
