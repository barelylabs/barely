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

export default function Footer() {
	return (
		<footer className='w-full bg-white'>
			<div className='mx-auto max-w-5xl  py-12 px-6 lg:px-8'>
				<div className='mx-auto w-fit py-10'>
					<Link href='/privacy'>
						<span className=' text-gray-500'>privacy</span>
					</Link>
				</div>
				<div className='mx-auto mt-8 md:order-1 md:mt-0'>
					<p className='text-center text-sm leading-5 text-gray-500'>
						&copy; Barely Labs, LLC. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
