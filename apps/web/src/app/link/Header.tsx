import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import logo from '../../../public/logos/logo+barely-io__transparent+light_txt.png';
import Link from 'next/link';

// function classNames(...classes) {
// 	return classes.filter(Boolean).join(' ');
// }

export default function Header() {
	return (
		<Popover className=' w-full bg-purple-900'>
			<div
				id='topbar'
				className='mx-auto flex max-w-5xl items-center justify-between py-8 px-6 md:justify-start md:space-x-10 lg:px-8'
			>
				<Link href='/'>
					<div className='relative flex h-[40px] w-48 justify-start lg:flex-1'>
						<span className='sr-only'>barely.link</span>
						<Image src={logo} alt='barely.link' fill style={{ objectFit: 'contain' }} />
					</div>
				</Link>

				<div className='-my-2 -mr-2 md:hidden'>
					<Popover.Button className='inline-flex items-center justify-center rounded-md p-2 text-gray-50 hover:bg-purple-800 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500'>
						<span className='sr-only'>Open menu</span>
						<Bars3Icon className='h-6 w-6' aria-hidden='true' />
					</Popover.Button>
				</div>

				<div
					id='top-links'
					className='hidden justify-end space-x-10 text-gray-50 md:flex md:flex-1 md:items-center '
				>
					<a href='#brand' className='text-base font-medium hover:text-purple-200 '>
						brand
					</a>
					<a href='#track' className='text-base font-medium hover:text-purple-200 '>
						track
					</a>
					<a href='#grow' className='text-base font-medium hover:text-purple-200 '>
						grow
					</a>
					<a href='#marketing' className='text-base font-medium hover:text-purple-200 '>
						market
					</a>
				</div>

				{/* <div
					id='sign-in'
					className='hidden items-center justify-end md:flex md:flex-1 lg:w-0'
				>
					<a
						href='#'
						className='whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900'
					>
						Sign in
					</a>
					<a
						href='#'
						className='ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-purple-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-purple-700'
					>
						Sign up
					</a>
				</div> */}
			</div>

			<Transition
				as={Fragment}
				enter='duration-200 ease-out'
				enterFrom='opacity-0 scale-95'
				enterTo='opacity-100 scale-100'
				leave='duration-100 ease-in'
				leaveFrom='opacity-100 scale-100'
				leaveTo='opacity-0 scale-95'
			>
				<Popover.Panel
					focus
					className='absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden'
				>
					{({ close }) => (
						<div className='divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5'>
							<div className='px-5 pt-5 pb-6'>
								<div className='flex items-center justify-between'>
									<div>
										{/* <img
											className='h-9 w-auto'
											src='/logos/barely-io-logo.svg'
											alt='barely.io'
										/> */}
									</div>
									<div className='-mr-2'>
										<Popover.Button className='inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500'>
											<span className='sr-only'>Close menu</span>
											<XMarkIcon className='h-6 w-6' aria-hidden='true' />
										</Popover.Button>
									</div>
								</div>
							</div>

							<div className='py-6 px-5'>
								<div className='grid grid-cols-1 gap-4 text-2xl'>
									<a
										href='#brand'
										className='text-base font-medium text-gray-900 hover:text-gray-700'
										onClick={() => close()}
									>
										Brand
									</a>

									<a
										href='#track'
										className='text-base font-medium text-gray-900 hover:text-gray-700'
										onClick={() => close()}
									>
										Track
									</a>
									<a
										href='#grow'
										className='text-base font-medium text-gray-900 hover:text-gray-700'
										onClick={() => close()}
									>
										Grow
									</a>
									<a
										href='#market'
										className='text-base font-medium text-gray-900 hover:text-gray-700'
										onClick={() => close()}
									>
										Market
									</a>
								</div>
								{/* <div id='popover-sign-in' className='mt-6'>
								<a
									href='#'
									className='flex w-full items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-purple-700'
								>
									Sign up
								</a>
								<p className='mt-6 text-center text-base font-medium text-gray-500'>
									Existing customer?{' '}
									<a href='#' className='text-purple-600 hover:text-purple-500'>
										Sign in
									</a>
								</p>
							</div> */}
							</div>
						</div>
					)}
				</Popover.Panel>
			</Transition>
		</Popover>
	);
}
