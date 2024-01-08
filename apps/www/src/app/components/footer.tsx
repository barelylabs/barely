import Link from 'next/link';

// import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

// const navigation = [
// 	{
// 		name: 'Facebook',
// 		href: '#',
// 		icon: FaFacebook,
// 	},
// 	{
// 		name: 'Instagram',
// 		href: '#',
// 		icon: FaInstagram,
// 	},
// 	{
// 		name: 'Twitter',
// 		href: '#',
// 		icon: FaTwitter,
// 	},
// 	{
// 		name: 'YouTube',
// 		href: '#',
// 		icon: FaYoutube,
// 	},
// ];

import { Separator } from '@barely/ui/elements/separator';
import { Text } from '@barely/ui/elements/typography';

export default function Footer() {
	return (
		<footer className='w-full'>
			<div className='w-full py-12 sm:pt-24 px-6 lg:px-8'>
				<Separator />
				<div className='mx-auto w-fit py-10'>
					<Link href='/privacy'>
						<Text variant='md/normal' subtle className='text-center'>
							privacy
						</Text>
					</Link>
				</div>
				<div className='flex flex-col gap-2 mx-auto mt-8 md:order-1 md:mt-0 text-center'>
					<Text variant='sm/light' muted className='text-center'>
						&copy; Barely Labs, LLC. All rights reserved.
					</Text>
					<Text variant='xs/light' muted className='text-center'>
						barely.io is not affiliated with or funded by Spotify.
					</Text>
				</div>
			</div>
		</footer>
	);
}
