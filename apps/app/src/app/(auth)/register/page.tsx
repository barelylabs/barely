import Image from 'next/image';
import Link from 'next/link';

import logo from '@public/static/logo.png';

import { H3, Text } from '@barely/ui/elements/typography';

import RegisterUserForm from './register-user-form';

const RegisterUserPage = ({
	searchParams,
}: {
	searchParams?: { callbackUrl?: string };
}) => {
	const { callbackUrl } = searchParams ?? {};

	return (
		<div className='container flex h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
			<Link
				href='/login'
				className='absolute top-4 right-4 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent py-2 px-3 text-center text-sm  font-medium text-slate-900 hover:border-slate-200 hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-slate-200 md:top-8 md:right-8'
			>
				Login
			</Link>
			<div className='mx-auto flex w-full flex-col justify-center space-y-4 text-center sm:w-[350px]'>
				<div className='flex flex-col space-y-1 text-center'>
					<div className='relative mx-auto mb-2 h-12 w-12'>
						<Image src={logo} alt='barely.io' fill priority />
					</div>
					<H3 className='font-bold'>Create an account</H3>
				</div>

				<RegisterUserForm callbackUrl={callbackUrl} />

				<Text variant={'xs/normal'} subtle>
					By creating an account, you agree to our{' '}
					<span>
						<Link href='/terms' className='hover:text-brand underline'>
							{`Terms of Service`}
						</Link>
					</span>{' '}
					and{' '}
					<span>
						<Link href='/privacy' className='hover:text-brand underline'>
							{`Privacy Policy`}
						</Link>
					</span>
				</Text>
			</div>
		</div>
	);
};

export default RegisterUserPage;
