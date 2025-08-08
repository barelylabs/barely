import Image from 'next/image';
import Link from 'next/link';
import logo from '@static/logo.png';

import { H, Text } from '@barely/ui/typography';

import { handleLoggedInOnAuthPage } from '~/app/(auth)/handle-logged-in-on-auth-page';
import RegisterUserForm from './register-user-form';

const RegisterUserPage = async ({
	searchParams,
}: {
	searchParams?: Promise<{ callbackUrl?: string }>;
}) => {
	const awaitedSearchParams = await searchParams;
	const { callbackUrl } = awaitedSearchParams ?? {};

	await handleLoggedInOnAuthPage({ callbackUrl });

	return (
		<div className='container flex h-screen min-h-fit w-screen flex-col items-center justify-center overflow-scroll lg:max-w-none lg:grid-cols-2 lg:px-0'>
			<Link
				href='/login'
				className='absolute right-4 top-4 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent px-3 py-2 text-center text-sm font-medium text-slate-900 hover:border-slate-200 hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-slate-200 md:right-8 md:top-8'
			>
				Login
			</Link>
			<div className='mx-auto flex w-[350px] max-w-full flex-col justify-center space-y-4 text-center'>
				<div className='flex flex-col space-y-1 text-center'>
					<div className='relative mx-auto mb-2 h-11 w-11'>
						<Image src={logo} alt='barely.ai' fill priority sizes='44px' />
					</div>
					<H size='4'>Create an account</H>
				</div>

				<RegisterUserForm callbackUrl={callbackUrl} />

				<Text variant={'xs/normal'} subtle>
					By creating an account, you agree to our{' '}
					<span>
						<Link href='/terms' className='underline hover:text-brand'>
							{`Terms of Service`}
						</Link>
					</span>{' '}
					and{' '}
					<span>
						<Link href='/privacy' className='underline hover:text-brand'>
							{`Privacy Policy`}
						</Link>
					</span>
				</Text>
			</div>
		</div>
	);
};

export default RegisterUserPage;
