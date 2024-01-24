import { z } from 'zod';
import SignUpForm from './SignUpForm';

interface SignInPageProps {
	searchParams?: { [key: string]: string | string[] | undefined };
}

async function SignInPage({ searchParams }: SignInPageProps) {
	// const user = await currentUser();
	// if (user) redirect('/campaigns');

	const paramsSchema = z.object({ redirectUrl: z.string().optional() });
	const params = paramsSchema.safeParse(searchParams);

	const redirectUrl = params.success ? params.data.redirectUrl : undefined;
	return (
		<div className='my-auto mx-auto h-full w-fit'>
			<SignUpForm />
			{/* <SignUp
				routing='hash'
				redirectUrl={redirectUrl}
				appearance={{
					layout: {
						socialButtonsPlacement: 'bottom',
						socialButtonsVariant: 'iconButton',
						// logoPlacement: 'outside',
						// logoImageUrl: '/logo+barely-io__transparent+dark_txt.png',
					},
					elements: { formButtonPrimary: 'bg-purple-500' },
				}}
			/> */}
		</div>
	);
}

export default SignInPage;
