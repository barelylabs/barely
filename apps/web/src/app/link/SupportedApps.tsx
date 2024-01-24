import {
	FaSpotify,
	FaInstagram,
	FaTiktok,
	FaFacebook,
	FaYoutube,
	FaTwitch,
	FaTwitter,
} from 'react-icons/fa';

const SupportedApps = () => {
	return (
		<div
			id='supported apps'
			className='items-left -mt-7 flex w-fit flex-col space-y-4 self-center rounded-xl bg-white px-5 py-3 shadow-lg sm:items-center'
		>
			<div className='flex w-full max-w-sm grow flex-row flex-wrap justify-center gap-y-4 space-x-3 sm:justify-between '>
				<FaTiktok className='text-4xl text-tiktok' />
				<FaYoutube className='text-4xl text-youtube' />
				<FaSpotify className='text-4xl text-spotify' />
				<FaTwitter className='text-4xl text-twitter' />
				<FaFacebook className='text-4xl text-facebook' />
				<FaTwitch className='text-4xl text-twitch' />
				<FaInstagram className='text-4xl text-instagram' />
			</div>
		</div>
	);
};

export default SupportedApps;
