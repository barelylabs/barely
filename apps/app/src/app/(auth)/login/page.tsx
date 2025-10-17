import type { AppVariant } from '@barely/utils';
import Image from 'next/image';
import Link from 'next/link';
import { getAbsoluteUrl, getCurrentAppConfig } from '@barely/utils';
import logo from '@static/logo.png';

import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

import { handleLoggedInOnAuthPage } from '~/app/(auth)/handle-logged-in-on-auth-page';
import { LoginForm } from './login-form';

const SignInPage = async ({
	searchParams,
}: {
	searchParams?: Promise<{ error: string }>;
}) => {
	const awaitedSearchParams = await searchParams;
	const { error } = awaitedSearchParams ?? {};

	if (error) {
		console.error(error);
	}

	await handleLoggedInOnAuthPage();

	const appConfig = getCurrentAppConfig();

	let backApp: AppVariant;
	switch (appConfig.name) {
		case 'app':
			backApp = 'www';
			break;
		case 'appFm':
			backApp = 'fm';
			break;
		case 'appInvoice':
			backApp = 'invoice';
			break;
		default:
			backApp = 'www';
	}

	const backUrl = getAbsoluteUrl(backApp);

	return (
		<div className='container flex h-screen w-screen flex-col items-center justify-center'>
			<Link
				href={backUrl}
				className='absolute left-4 top-4 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent px-3 py-2 text-center text-sm font-medium text-slate-900 hover:border-slate-200 hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-slate-200 md:left-8 md:top-8'
			>
				<>
					<Icon.chevronLeft className='mr-2 h-4 w-4' />
					Back to {appConfig.title}
				</>
			</Link>
			<div className='mx-auto flex w-full flex-col justify-center space-y-4 text-center sm:w-[350px]'>
				<div className='flex flex-col space-y-1 text-center'>
					<div className='relative mx-auto mb-2 h-12 w-12'>
						<Image src={logo} alt={appConfig.logoAlt} fill sizes='w-48 h-48' priority />
					</div>
					<H size='4' className='font-bold'>
						Welcome back
					</H>
				</div>

				<LoginForm />
				{/* <UserAuthForm {...{ token, emailAddressId: email_address_id, redirect }} /> */}
			</div>
		</div>
	);
};

export default SignInPage;
