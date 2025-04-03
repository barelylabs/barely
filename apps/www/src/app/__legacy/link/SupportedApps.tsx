import { Card } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';

const SupportedApps = () => {
	return (
		<Card className='items-left -mt-7 flex w-fit flex-col space-y-4 rounded-xl border-3 bg-accent px-5 py-3 sm:items-center'>
			<div className='flex w-full max-w-sm grow flex-row flex-wrap justify-center gap-y-4 space-x-3 sm:justify-between'>
				<Icon.tiktok className='text-4xl text-tiktok' />
				<Icon.youtube className='text-4xl text-youtube' />
				<Icon.spotify className='text-4xl text-spotify' />
				<Icon.twitter className='text-4xl text-twitter' />
				<Icon.facebook className='text-4xl text-facebook' />
				<Icon.twitch className='text-4xl text-twitch' />
				<Icon.instagram className='text-4xl text-instagram' />
			</div>
		</Card>
	);
};

export default SupportedApps;
