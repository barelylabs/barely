import { SignIn, currentUser } from '@clerk/nextjs/app-beta';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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
			<SignIn
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
			/>
		</div>
	);
}

export default SignInPage;
